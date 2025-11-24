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
    address public constant TOM = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address public constant BEN = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address public constant RICK = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;
    address public constant JACK = 0x617F2E2fD72FD9D5503197092aC168c91465E7f2;
    address public constant FOND = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    address public constant STARTUP_A = 0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678;

    Token internal Professional;
    Token internal RTKCoin;
    
    // Параметры системы
    uint256 public constant VOTE_TOKEN_RATE = 3; // 1 голос = 3 системных токена
    uint256 public constant WRAP_TOKEN_PRICE = 1 ether; // Цена wrap token = 1 ETH
    uint256 public rtkExchangeRate = 2; // 1 RTK = 0.5 PROF (1/2)
    
    // Структуры данных
    enum UserStatus { NOT_MEMBER, MEMBER }
    enum QuorumType { SIMPLE_MAJORITY, SUPER_MAJORITY, WEIGHTED }
    
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
        MANAGE_PRO_TOKEN,
        MANAGE_RTK_TOKEN
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
    }

    // Мэппинги
    mapping(uint256 => ProposalInfo) public proposals;
    mapping(address => User) public users;
    mapping(uint256 => mapping(address => VoteSupport)) public voteSupports;
    mapping(uint256 => mapping(address => uint256)) public wrapTokenSupports;

    event VoteSupported(address indexed supporter, address indexed voter, uint256 indexed proposalId, uint256 wrapTokens);
    event NewStartupInvestment(address indexed startup, uint256 amount);
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event RTKExchangeRateChanged(uint256 newRate);

    constructor(IVotes _token)
        Governor("MyGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% кворум
    {
        Professional = Token(address(_token));
        RTKCoin = new Token("RTKCoin", "RTK", 20_000_000);
        
        // Инициализация токенов
        Professional.giveStartTokens();
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
    modifier onlyMember() {
        require(users[msg.sender].status == UserStatus.MEMBER, "Not a DAO member");
        _;
    }

    // Основная функция создания предложения
    function propose(
        string memory description,
        address targetAddress,
        uint256 targetAmount,
        ProposalType proposalType,
        QuorumType quorumType
    ) public onlyMember returns (uint256) {


        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(this);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("addMember(address)", targetAddress);

        uint256 proposalId = super.propose(targets, values, calldatas, description);
        
        proposals[proposalId] = ProposalInfo({
            proposalType: proposalType,
            targetAddress: targetAddress,
            targetAmount: targetAmount,
            description: description,
            calldatas: calldatas,
            executed: false,
            quorumType: quorumType,
            proposer: msg.sender
        });

        return proposalId;
    }

    // Функция выполнения предложения (вызывается через Governor)
    function executeProposal(uint256 proposalId) public {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");
        require(!proposals[proposalId].executed, "Already executed");

        ProposalInfo storage proposal = proposals[proposalId];
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);

        targets[0] = address(this);
        values[0] = 0;

        bytes32 descriptionHash = keccak256(bytes(proposal.description));
        
        super.execute(targets, values, proposal.calldatas, descriptionHash);
    }

    // === ФУНКЦИИ ВЫПОЛНЕНИЯ ПРЕДЛОЖЕНИЙ ===

    function executeInvestment(address startup, uint256 amount) public {
        require(msg.sender == address(this), "Only governor can call");
        // Логика инвестирования
        emit NewStartupInvestment(startup, amount);
    }

    function addMember(address member) public {
        require(msg.sender == address(this), "Only governor can call");
        users[member].status = UserStatus.MEMBER;
        emit MemberAdded(member);
    }

    function removeMember(address member) public {
        require(msg.sender == address(this), "Only governor can call");
        users[member].status = UserStatus.NOT_MEMBER;
        emit MemberRemoved(member);
    }

    function changeRTKExchangeRate(uint256 newRate) public {
        require(msg.sender == address(this), "Only governor can call");
        rtkExchangeRate = newRate;
        emit RTKExchangeRateChanged(newRate);
    }

    // === ФУНКЦИИ ДЕЛЕГИРОВАНИЯ И ПОДДЕРЖКИ ===

    function supportVote(uint256 proposalId, address voter, uint256 wrapTokenAmount) public {
        require(state(proposalId) == ProposalState.Active, "Voting not active");
        require(wrapTokenAmount > 0, "Amount must be positive");
        
        // Проверяем баланс wrap токенов
        require(RTKCoin.balanceOf(msg.sender) >= wrapTokenAmount, "Not enough RTK tokens");
        
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
    
    function getProposalDetails(uint256 proposalId)
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
        forVotes = forVotes_ / (10 ** 12) / 5000;
        againstVotes = against / (10 ** 12) / 5000;
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

    function getUserBalances(address user) public view returns (uint256 profiBalance, uint256 rtkBalance) {
        profiBalance = Professional.balanceOf(user);
        rtkBalance = RTKCoin.balanceOf(user);
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

    // Функция для покупки RTK токенов за ETH
    function buyRTKWithETH() public payable {
        uint256 rtkAmount = (msg.value * (10 ** RTKCoin.decimals())) / WRAP_TOKEN_PRICE;
        require(RTKCoin.balanceOf(address(this)) >= rtkAmount, "Not enough RTK tokens");
        RTKCoin.transfer(msg.sender, rtkAmount);
    }

    // Функция для возврата RTK токенов и получения ETH обратно
    function refundRTK(uint256 rtkAmount) public {
        uint256 ethAmount = (rtkAmount * WRAP_TOKEN_PRICE) / (10 ** RTKCoin.decimals());
        require(address(this).balance >= ethAmount, "Not enough ETH in contract");
        
        RTKCoin.transferFrom(msg.sender, address(this), rtkAmount);
        payable(msg.sender).transfer(ethAmount);
    }
}