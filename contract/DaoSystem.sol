// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GovernanceBundle.sol";
import {Token} from "./Token.sol";

contract DaoSystem is
    Governor,
    GovernorVotes,
    GovernorCountingSimple,
    GovernorVotesQuorumFraction
{
    // Обьявление адресов пользователей, стартапа и фонда
    address public Tom = 0xda82d8e188e355c380d77616B2b63b0267aA68eD;
    address public Ben = 0xa0Fddc85DA6Fbe53D2e7d55cbDa9a22c3620816C;
    address public Rick = 0x58E4a1126170CfA7CCF016a9362AE1a9f1c70914;
    address public Jack = 0xB6458438e80Ad9bd3DD3DdB5FB1942a139C1ffD3;
    address public Fond = 0x9f44852E86D85c421Af26cF233105D959dED3D42;
    address public StartupA = 0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C;

    // Обьявление токенов для контракта
    Token internal Professional;
    Token internal RtkCoin;

    // Переменные: ВремяГолосования, стоимость голоса, курс wrap на profi
    uint256 wrapTokenRate = 2;
    uint256 votingTime = 300;
    uint256 voteCost = 3;

    // Структуры и enum
    // Статусы пользователя
    enum UserStatus {
        MEMBER,
        NOT_MEMBER
    }
    // Типы кворумов
    enum QuorumType {
        SIMPLE_MAJORITY,
        SUPER_MAJORITY,
        WEIGHTED
    }
    // Типы предложения
    enum ProposalType {
        INVEST_NEW_STARTUP,
        ADD_INVESTMENT,
        ADD_MEMBER,
        REMOVE_MEMBER,
        MANAGE_WRAP_TOKEN,
        MANAGE_SYSTEM_TOKEN
    }
    // Структура пользователя
    struct User {
        string name;
        address userAddress;
        UserStatus status;
    }
    // Структура предложения
    struct ProposalInfo {
        string description;
        address targetAddress;
        uint256 targetAmount;
        bytes[] calldatas;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        QuorumType quorumType;
        ProposalType proposalType;
        ProposalState state;
        uint256 endTime;
    }
    // Структура голоса
    struct VoteInfo {
        address voter;
        uint8 support;
        uint256 tokenAmount;
        bool isWrap;
    }

    // Маппинги пользователей, голосов и предложений
    mapping(address => User) private users;
    mapping(uint256 => VoteInfo[]) public votes;
    mapping(uint256 => ProposalInfo) public proposals;
    mapping(ProposalType => bytes4) private proposalSelectors;

    event SupportedVote(uint256 indexed id, uint256 amount, address indexed helper, address indexed user);
    event NewStartupInvestment(address indexed startup, uint256 amount);
    event StartupInvestment(address indexed startup, uint256 amount);
    event SystemTokenManaged(address indexed target, uint256 amount);
    event RTKExchangeRateChanged(uint256 newRate);
    event MemberRemoved(address indexed member);
    event MemberAdded(address indexed member);

    // Проверка, чтобы вызов функции проводился MEMBER DaoSystem
    modifier onlyMember() {
        require(users[msg.sender].status == UserStatus.MEMBER, "Not a DAO member");
        _;
    }

    // Проверка, чтобы вызов функции проводился владельцем Предложения
    modifier onlyProposer(uint256 proposalId) {
        require(proposals[proposalId].proposer == msg.sender, "Not the proposer");
        _;
    }

    constructor(
        IVotes _token
    )
        Governor("DaoSystem")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(0)
    {
        Professional = Token(address(_token));
        Professional.giveStartTokens();

        RtkCoin = new Token("RTK", "RtkCoin", 20_000_000);
        RtkCoin.mint(address(this), 20_000_000 * (10 ** RtkCoin.decimals()));

        initializeUsers();
        initializeProposalSelectors();
    }

    // Функция инициализирует внутренние функции для предложений, чтобы они успешно запускались
    function initializeProposalSelectors() internal {
        proposalSelectors[ProposalType.INVEST_NEW_STARTUP] = this.newStartupInvestment.selector;
        proposalSelectors[ProposalType.ADD_INVESTMENT] = this.startupInvestment.selector;
        proposalSelectors[ProposalType.ADD_MEMBER] = this.addMember.selector;
        proposalSelectors[ProposalType.REMOVE_MEMBER] = this.removeMember.selector;
        proposalSelectors[ProposalType.MANAGE_WRAP_TOKEN] = this.changeRTKExchangeRate.selector;
        proposalSelectors[ProposalType.MANAGE_SYSTEM_TOKEN] = this.manageSystemToken.selector;
    }

    // Функция для инициализации пользователей, создаются начальные обьекты
    function initializeUsers() internal {
        users[Tom] = User("Tom", Tom, UserStatus.MEMBER);
        users[Ben] = User("Ben", Ben, UserStatus.MEMBER);
        users[Rick] = User("Rick", Rick, UserStatus.MEMBER);
        users[Jack] = User("Jack", Jack, UserStatus.NOT_MEMBER);
    }

    // Функция для создания предложения
    // Берем описание, адрес и кол-во токенов направленное на предложение, тип предложения, тип кворума и длительность голосования в минутах
    // Возвращает ID предложения
    function propose(
        string memory description,
        address targetAddress,
        uint256 targetAmount,
        ProposalType proposalType,
        QuorumType quorumType,
        uint256 votingInMinutes
    ) public onlyMember returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(this);
        values[0] = 0;

        bytes4 selector = proposalSelectors[proposalType];
        calldatas[0] = abi.encodeWithSelector(selector, targetAddress, targetAmount);

        uint256 proposalId = super.propose(targets, values, calldatas, description);

        votingTime = votingInMinutes * 60;

        proposals[proposalId] = ProposalInfo(
            description,
            targetAddress,
            targetAmount,
            calldatas,
            msg.sender,
            0,
            0,
            quorumType,
            proposalType,
            state(proposalId),
            block.timestamp + votingTime
        );

        return proposalId;
    }

    // Функция для голосования за предложение
    // Принимает ID предложения, цифру поддержки (1 | 0), а также кол-во токенов
    function castVote(uint256 id, uint8 support, uint256 amount) public onlyMember {
        require(Professional.balanceOf(msg.sender) >= toTokenAmount(amount), "Insufficient balance");

        ProposalInfo storage proposal = proposals[id];
        bool isInvestment = proposal.proposalType <= ProposalType.ADD_INVESTMENT;
        
        uint256 voteWeight = isInvestment ? amount : amount / voteCost;

        if (support == 1) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }

        votes[id].push(VoteInfo(msg.sender, support, amount, false));
        
        Professional.transferTokens(msg.sender, address(this), toTokenAmount(amount));
        
        super.castVote(id, support);
    }

    // Функция для поддержки голоса за предложение
    function supportVote(
        uint256 id,
        uint256 amount,
        address userAddress
    ) public {
        ProposalInfo storage proposal = proposals[id];
        VoteInfo memory supportedVote;

        require(users[msg.sender].status == UserStatus.NOT_MEMBER, "Only non-members can delegate");
        require(users[userAddress].status == UserStatus.MEMBER, "Can only delegate to DAO members");

        for (uint i = 0; i < votes[id].length; i++) {
            if (votes[id][i].voter == userAddress) {
                supportedVote = votes[id][i];
                break;
            }
        }

        bool isInvestment = proposal.proposalType <= ProposalType.ADD_INVESTMENT;

        uint256 systemEquivalent = amount / wrapTokenRate; // 1 wrap = 0.5 системного
        uint256 voteWeight = isInvestment ? systemEquivalent : systemEquivalent / voteCost;

        if (supportedVote.support == 1) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }

        RtkCoin.transferTokens(msg.sender, address(this), amount );

        votes[id].push(VoteInfo(msg.sender, supportedVote.support, amount, true));

        super.castVote(id, supportedVote.support);
        emit SupportedVote(id, amount, msg.sender, userAddress);
    }

    // Функция для выполнения предложения после успешного голосования
    // Принимает ID предложения
    function executeProposal(uint256 id) public onlyProposer(id) {
        ProposalInfo memory proposal = proposals[id];
        require(block.timestamp >= proposal.endTime, "Voting not finished yet");

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);

        targets[0] = address(this);
        values[0] = 0;

        bytes32 descriptionHash = keccak256(bytes(proposal.description));
        require(checkQuorum(proposal), "Quorum not reached");

        super.execute(targets, values, proposal.calldatas, descriptionHash);
    }

    // Функция для проверки кворума, выполнены ли условия на голосовании
    function checkQuorum(
        ProposalInfo memory proposal
    ) public pure returns (bool) {
        uint256 forVotes = proposal.votesFor;
        uint256 totalVotes = forVotes + proposal.votesAgainst;

        if (proposal.quorumType == QuorumType.SIMPLE_MAJORITY) {
            return forVotes > totalVotes / 2;
        } else if (proposal.quorumType == QuorumType.SUPER_MAJORITY) {
            return forVotes * 3 > totalVotes * 2;
        } else if (proposal.quorumType == QuorumType.WEIGHTED) {
            return forVotes > 0;
        }
    }

    // Фунция для удаления предложения и закрытие голосования
    // Принимает ID предложения и возвращает токены всем, кто голосовал за него
    function closeVoting(uint256 id) public onlyProposer(id) {
        ProposalInfo memory proposal = proposals[id];
        VoteInfo[] storage proposalVotes = votes[id];

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);

        targets[0] = address(this);
        values[0] = 0;

        bytes32 descriptionHash = keccak256(bytes(proposal.description));

        super._cancel(targets, values, proposal.calldatas, descriptionHash);
        
        // Возвращаем токены всем кто голосовал
        for (uint i = 0; i < proposalVotes.length; i++) {
            VoteInfo memory vote = proposalVotes[i];
            if (vote.isWrap) {
                // Возвращаем wrap токены
                Professional.transferTokens(proposal.proposer, vote.voter, toTokenAmount(vote.tokenAmount / wrapTokenRate));
            } else {
                // Возвращаем системные токены
                Professional.transferTokens(proposal.proposer, vote.voter, toTokenAmount(vote.tokenAmount));
            }
        }
    }

    // Внутренние функции для предложений
    function newStartupInvestment(address startupAddress, uint256 amount) external {
        emit NewStartupInvestment(startupAddress, amount);
    }
    function startupInvestment(address startupAddress, uint256 amount) external {
        emit StartupInvestment(startupAddress, amount);
    }
    function addMember(address member) public {
        users[member].status = UserStatus.MEMBER;
        emit MemberAdded(member);
    }
    function removeMember(address member) public {
        users[member].status = UserStatus.NOT_MEMBER;
        emit MemberRemoved(member);
    }
    function changeRTKExchangeRate(uint256 newRate) public {
        wrapTokenRate = newRate;
        emit RTKExchangeRateChanged(newRate);
    }
    function manageSystemToken(address targetAddress, uint256 targetAmount) external {
        emit SystemTokenManaged(targetAddress, targetAmount);
    }

    // Функция для получения пользователя
    // Принимает адрес пользователя, возвращает имя, статус пользователя, балансы profi и rtk
    function getUser(address userAddress) public view returns (string memory name, UserStatus status, uint256 profi, uint256 rtk) {
        User memory user = users[userAddress];

        // Только участники DAO могут видеть полную информацию
        if (users[msg.sender].status != UserStatus.MEMBER) {
            // Для не-участников возвращаем только имя
            return (user.name, UserStatus.NOT_MEMBER, 0, 0);
        }

        name = user.name;
        status = user.status;
        profi = Professional.balanceOf(userAddress) / (10 ** Professional.decimals());
        rtk = RtkCoin.balanceOf(userAddress) / (10 ** RtkCoin.decimals());
    }

    // Функция для покупки wrap за eth
    function buyWrapWithEth(uint256 amount) public payable {
        RtkCoin.transferTokens(
            address(this),
            msg.sender,
            toTokenAmount(amount)
        );
    }

    // Функция для покупки wrap за profi
    function buyWrapWithProfi(uint256 amount) public payable {
        uint256 requiredCost = amount / wrapTokenRate;
        
        Professional.transferTokens(
            msg.sender,
            address(this),
            toTokenAmount(requiredCost)
        );
        RtkCoin.transferTokens(
            address(this),
            msg.sender,
            toTokenAmount(requiredCost) * wrapTokenRate
        );
    }
    
    // Функция для преобразования числа в число для токенов (с доп нулями)
    function toTokenAmount(uint256 amount) public view returns (uint256) {
        return amount * (10 ** Professional.decimals());
    }

    // Функция которая отвечает за задержку по блокам, от создания предложения, до инициализации голосования
    function votingDelay() public pure override returns (uint256) {
        return 1;
    }

    // Функция которая отвечает за длительность голосования за предложение
    // При тесте в remix меняем на 2 или 3, чтобы через пару транзакций голосование заканчивалось
    function votingPeriod() public view override returns (uint256) {
        return votingTime;
    }
}