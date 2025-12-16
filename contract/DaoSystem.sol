// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
pragma solidity ^0.8.27;

import "./GovernanceBundle.sol";
import {Token} from "./Token.sol";
import "./GovernanceBundle.sol";
import {Token} from "./Token.sol";

contract MyGovernor is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    // Адреса пользователей
    address public constant TOM = 0xD6f9EDa37aC1445755F3ec3c5Fa51660Ca40678C;
    address public constant BEN = 0x2cE921Bff1c951914B062f2557d6914521bb8E77;
    address public constant RICK = 0x942aB5420dBd2838D89da4cfdDfE7c7D3C59BFC2;
    address public constant JACK = 0xb7ec4240d2A4e5bfB8c398F13e7c47c4138b1A44;
    address public constant FOND = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    address public constant STARTUP_A =
        0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678;

    Token internal Professional;
    Token internal RTKCoin;

    // Параметры системы
    uint256 public constant VOTE_TOKEN_RATE = 3; // 1 голос = 3 системных токена
    uint256 public constant WRAP_TOKEN_PRICE = 1 ether; // Цена wrap token = 1 ETH
    uint256 public rtkExchangeRate = 2; // 1 RTK = 0.5 PROF (1/2)

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
        users[TOM] = User("Tom", TOM, UserStatus.MEMBER);
        users[BEN] = User("Ben", BEN, UserStatus.MEMBER);
        users[RICK] = User("Rick", RICK, UserStatus.MEMBER);
        users[JACK] = User("Jack", JACK, UserStatus.NOT_MEMBER);
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
        address targetAddress,
        uint256 targetAmount
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
            targetAmount: targetAmount,
            description: description,
            calldatas: calldatas,
            executed: false,
            calldatas: calldatas,
            executed: false,
            quorumType: quorumType,
            proposer: msg.sender,
            tokenForVotes: 0,
            tokenAgainstVotes: 0
        });

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

    // Нужно прокинуть еще одну транзакцию, чтобы state предложения поменялся на АКТИВНЫЙ (1 для инициализации голосования)
    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 блок
    }

    // На фронте при инициализации будет прокидываться пустая транзакция, для продвижения блоков
    // Цифра в VotingPeriod по сути означает транзанкции которые могут быть, до конца голосования (время на фронте для примера)
    function votingPeriod() public pure override returns (uint256) {
        return 4; // 4 блока для демонстрации
    }

    function advanceBlock() public {
        // ВНУТРИ НИЧЕГО НЕТ
        // ¯\_(ツ)_/¯
    }
}
