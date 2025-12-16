// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./GovernanceBundle.sol";
import {Token} from "./Token.sol";

contract MyGovernor is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    // Адреса пользователей
    address public Tom = 0xda82d8e188e355c380d77616B2b63b0267aA68eD;
    address public Ben = 0xa0Fddc85DA6Fbe53D2e7d55cbDa9a22c3620816C;
    address public Rick = 0x58E4a1126170CfA7CCF016a9362AE1a9f1c70914;
    address public Jack = 0xB6458438e80Ad9bd3DD3DdB5FB1942a139C1ffD3;
    address public constant FOND = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    address public constant STARTUP_A = 0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678;

    Token internal Professional;
    Token internal RTKCoin;

    // Параметры системы
    uint256 public constant VOTE_TOKEN_RATE = 3; // 1 голос = 3 системных токена
    uint256 public constant WRAP_TOKEN_PRICE = 1 ether; // Цена wrap token = 1 ETH
    uint256 public rtkExchangeRate = 2; // 1 RTK = 0.5 PROF (1/2)
    uint256 public votingTime = 300;

    // Структуры данных
    enum UserStatus {
        NOT_MEMBER,
        MEMBER
    }
    enum QuorumType {
        SIMPLE_MAJORITY,
        SUPER_MAJORITY,
        WEIGHTED
    }

    struct User {
        string name;
        address userAddress;
        UserStatus status;
    }

    struct VoteSupport {
        address supporter;
        address voter;
        uint256 wrapTokens;
        bool support;
    }

    enum ProposalType {
        INVEST_NEW_STARTUP,
        ADD_INVESTMENT,
        ADD_MEMBER,
        REMOVE_MEMBER,
        MANAGE_WRAP_TOKEN
    }

    struct ProposalInfo {
        ProposalType proposalType;
        address targetAddress;
        uint256 targetAmount;
        string description;
        bytes[] calldatas;
        bool executed;
        QuorumType quorumType;
        address proposer;
        uint256 tokenForVotes;
        uint256 tokenAgainstVotes;
    }

    // Мэппинги
    mapping(uint256 => ProposalInfo) public proposals;
    mapping(address => User) public users;
    mapping(uint256 => mapping(address => VoteSupport)) public voteSupports;
    mapping(uint256 => mapping(address => uint256)) public wrapTokenSupports;

    event VoteSupported(
        address indexed supporter,
        address indexed voter,
        uint256 indexed proposalId,
        uint256 wrapTokens
    );
    event NewStartupInvestment(address indexed startup, uint256 amount);
    event StartupInvestment(address indexed startup, uint256 amount);
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event RTKExchangeRateChanged(uint256 newRate);

    constructor(
        IVotes _token
    )
        Governor("MyGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% кворум
    {
        Professional = Token(address(_token));
        Professional.giveStartTokens();

        RTKCoin = new Token("RTKCoin", "RTK", 20_000_000);
        RTKCoin.mint(address(this), 20_000_000 * 10 ** Professional.decimals());

        // Инициализация пользователей
        _initializeUsers();
    }

    function _initializeUsers() internal {
        users[Tom] = User("Tom", Tom, UserStatus.MEMBER);
        users[Ben] = User("Ben", Ben, UserStatus.MEMBER);
        users[Rick] = User("Rick", Rick, UserStatus.MEMBER);
        users[Jack] = User("Jack", Jack, UserStatus.NOT_MEMBER);
    }

    // Модификатор для проверки участника DAO
    // Модификатор для проверки участника DAO
    modifier onlyMember() {
        require(
            users[msg.sender].status == UserStatus.MEMBER,
            "Not a DAO member"
        );
        _;
    }

    // Основная функция создания предложения
    function propose(
        string memory description,
        address targetAddress,
        uint256 targetAmount,
        ProposalType proposalType,
        QuorumType quorumType,
        uint256 votingInMunutes
    ) public onlyMember returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(this);
        values[0] = 0;

        // Заполняем массивы в зависимости от типа предложения
        if (proposalType == ProposalType.INVEST_NEW_STARTUP) {
            calldatas[0] = abi.encodeWithSignature(
                "newStartupInvestment(address, uint256)",
                targetAddress,
                targetAmount
            );
        } else if (proposalType == ProposalType.ADD_INVESTMENT) {
            calldatas[0] = abi.encodeWithSignature(
                "startupInvestment(address, uint256)",
                targetAddress,
                targetAmount
            );
        } else if (proposalType == ProposalType.ADD_MEMBER) {
            calldatas[0] = abi.encodeWithSignature(
                "addUserToDao(address)",
                targetAddress
            );
        } else if (proposalType == ProposalType.REMOVE_MEMBER) {
            calldatas[0] = abi.encodeWithSignature(
                "removeUserFromDao(address)",
                targetAddress
            );
        } else if (proposalType == ProposalType.MANAGE_WRAP_TOKEN) {
            calldatas[0] = abi.encodeWithSignature(
                "executeTokenChange(address,uint256)",
                targetAddress,
                targetAmount
            );
        }

        uint256 proposalId = super.propose(
            targets,
            values,
            calldatas,
            description
        );

        proposals[proposalId] = ProposalInfo({
            proposalType: proposalType,
            targetAddress: targetAddress,
            targetAmount: targetAmount,
            description: description,
            calldatas: calldatas,
            executed: false,
            quorumType: quorumType,
            proposer: msg.sender,
            tokenForVotes: 0,
            tokenAgainstVotes: 0
        });

        votingTime = votingInMunutes * 60;
        return proposalId;
    }

    function castVote(
        uint256 id,
        uint8 support,
        uint256 tokenAmount
    ) public onlyMember {
        ProposalInfo storage proposal = proposals[id];

        if (tokenAmount > 1) {
            proposal.tokenForVotes = support == 1 ? tokenAmount : 0;
            proposal.tokenAgainstVotes = support == 1 ? 0 : tokenAmount;
            super.castVote(id, support);
        } else {
            super.castVote(id, support);
        }
    }

    // Функция выполнения предложения (вызывается через Governor)
    function executeProposal(uint256 id) public {
        require(state(id) == ProposalState.Succeeded, "Proposal not succeeded");
        require(!proposals[id].executed, "Already executed");

        ProposalInfo storage proposal = proposals[id];
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);

        targets[0] = address(this);
        values[0] = 0;

        bytes32 descriptionHash = keccak256(bytes(proposal.description));

        super.execute(targets, values, proposal.calldatas, descriptionHash);
    }

    // === ФУНКЦИИ ВЫПОЛНЕНИЯ ПРЕДЛОЖЕНИЙ ===

    // Фукнция для новых вложений в стартап
    function newStartupInvestment(
        address startupAddress,
        uint256 amount
    ) external {
        emit NewStartupInvestment(startupAddress, amount);
    }

    // Фукнция для вложений в стартап
    function startupInvestment(
        address startupAddress,
        uint256 amount
    ) internal {
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
        rtkExchangeRate = newRate;
        emit RTKExchangeRateChanged(newRate);
    }

    // === ФУНКЦИИ ДЕЛЕГИРОВАНИЯ И ПОДДЕРЖКИ ===

    function supportVote(
        uint256 proposalId,
        address voter,
        uint256 wrapTokenAmount
    ) public {
        require(state(proposalId) == ProposalState.Active, "Voting not active");
        require(wrapTokenAmount > 0, "Amount must be positive");

        // Проверяем баланс wrap токенов
        require(
            RTKCoin.balanceOf(msg.sender) >= wrapTokenAmount,
            "Not enough RTK tokens"
        );

        // Переводим токены в контракт
        RTKCoin.transferFrom(msg.sender, address(this), wrapTokenAmount);

        // Записываем поддержку
        voteSupports[proposalId][msg.sender] = VoteSupport({
            supporter: msg.sender,
            voter: voter,
            wrapTokens: wrapTokenAmount,
            support: true // Можно расширить для поддержки против
        });

        wrapTokenSupports[proposalId][voter] += wrapTokenAmount;

        emit VoteSupported(msg.sender, voter, proposalId, wrapTokenAmount);
    }

    // === GETTER ФУНКЦИИ ===

    function getProposalDetails(
        uint256 proposalId
    )
        public
        view
        returns (
            ProposalState status,
            address proposer,
            uint256 forVotes,
            uint256 againstVotes,
            address targetAddress,
            uint256 targetAmount,
            string memory description,
            bool executed,
            ProposalType proposalType,
            QuorumType quorumType
        )
    {
        ProposalInfo memory proposal = proposals[proposalId];

        uint256 against;
        uint256 forVotes_;
        uint256 abstain;

        (against, forVotes_, abstain) = proposalVotes(proposalId);

        status = state(proposalId);
        proposer = proposalProposer(proposalId);

        forVotes = proposal.tokenForVotes > 0
            ? proposal.tokenForVotes
            : (forVotes_ / (10 ** 12) / 10000);
        againstVotes = proposal.tokenAgainstVotes > 0
            ? proposal.tokenAgainstVotes
            : (against / (10 ** 12) / 10000);

        targetAddress = proposal.targetAddress;
        targetAmount = proposal.targetAmount;
        description = proposal.description;
        executed = proposal.executed;
        proposalType = proposal.proposalType;
        quorumType = proposal.quorumType;
    }

    function getUserStatus(address user) public view returns (UserStatus) {
        return users[user].status;
    }

    function getUserBalances(
        address user
    ) public view returns (uint256 profi, uint256 rtk) {
        profi = Professional.balanceOf(user);
        rtk = RTKCoin.balanceOf(user);
    }

    // Функция для покупки wrap за eth
    function buyWrapWithEth(uint256 amount) public payable {
        uint256 requiredEth = amount * WRAP_TOKEN_PRICE;
        require(
            RTKCoin.balanceOf(address(this)) >= requiredEth,
            "Not enough WRAP tokens in contract"
        );
        RTKCoin.transferTokens(
            address(this),
            msg.sender,
            requiredEth * 10 ** RTKCoin.decimals()
        );
    }

    // Функция для покупки wrap за profi
    function buyWrapWithProfi(uint256 amount) public {
        uint256 requiredCost = amount * rtkExchangeRate;
        Professional.transferTokens(
            msg.sender,
            address(this),
            requiredCost * 10 ** Professional.decimals()
        );
        RTKCoin.transferTokens(
            address(this),
            msg.sender,
            requiredCost * 10 ** RTKCoin.decimals()
        );
    }

    // === ФУНКЦИИ Governor НАСТРОЙКИ ===

    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 блок
    }

    function votingPeriod() public view override returns (uint256) {
        return votingTime;
    }
}
