    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GovernanceBundle.sol";
import { Token } from "./Token.sol";

contract DaoSystem is Governor {
    address internal Tom = 0xda82d8e188e355c380d77616B2b63b0267aA68eD;
    address internal Ben = 0xa0Fddc85DA6Fbe53D2e7d55cbDa9a22c3620816C;
    address internal Rick = 0x58E4a1126170CfA7CCF016a9362AE1a9f1c70914;
    address internal Jack = 0xB6458438e80Ad9bd3DD3DdB5FB1942a139C1ffD3;
   address internal Fond = 0x812F7c9C267B3B24fC81d8f6CDdb9482D2b992df;

    Token internal Professional;
    Token internal RTKCoin;

    // Отношение к Profi для обмена
    uint256 internal RtkExchangeRate = 2;
    uint256 internal VoteTokenRate = 3; // 1 голос = 3 системных токена
    uint256 public WrapTokenPrice = 1; // Цена wrap token = 1 ETH
    
    // Статусы пользователей
    enum UserStatus {
        NOT_MEMBER, // Не является участником DAO
        MEMBER, // Участник DAO
        BANNED // Заблокированный пользователь, НЕ УВЕРЕН ЧТО ПОНАДОБИТСЯ
    }

    // Типы предложений
    enum ProposalType {
        INVEST_NEW_STARTUP, // Инвестировать в новый стартап
        ADD_INVESTMENT, // Добавить инвестиций в стартап
        ADD_MEMBER, // Добавить участника в DAO
        REMOVE_MEMBER, // Убрать участника из DAO
        MANAGE_WRAP_TOKEN // Изменить wrap токен
    }

    // Статусы голосования
    enum VotingStatus {
        PENDING,  // Ожидает начала голосования
        REJECTED, // Не принято
        APPROVED, // Принято
        ACTIVE,   // Активно
        DELETED   // Удалено
    }

    // Способы достижения кворума
    enum QuorumType { 
        SIMPLE_MAJORITY, // 50% +1 голос (Типы propose: C, D, E, F)
        SUPER_MAJORITY, // 2/3 (Типы propose: C, D, E, F)
        WEIGHTED // Зависит от количества токенов (Типы propose: A, B)
    }

    // Структура пользователя
    struct User {
        string name;
        address userAddress;
        UserStatus status;
        uint256 wrapTokenBalance;
    }

    // Структура голосования
    struct Voting {
        address initiator;
        string description;
        uint256 startTime;
        uint256 endTime;
        VotingStatus status;
        QuorumType quorumType;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 totalVotes;
        address[] voters;
    }

    // Структура голоса поддержки
    struct VoteSupport {
        uint256 proposalId;
        address voter; // Адрес пользователя, чей голос поддерживается
        uint256 wrapTokens; // Количество wrap токенов, использованных для поддержки
        bool support; // Голос за или против
    }

    // Структура предложения
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votingId;
        bool executed;
        ProposalType proposalType;
        address targetAddress;
        uint256 targetAmount;
    }

    event VoteSupported(address indexed supporter, address indexed voter, uint256 indexed proposalId, uint256 additionalVotes);
    event VoteCast(address indexed voter,uint256 indexed proposalId,bool support,uint256 votingPower,uint256 profiAmount);
    event ProposalCreated(address indexed creator, uint256 id, ProposalType proposalType, string description, address targetAddress, uint256 targetAmount, bool indexed executed);
    event VotingStarted(uint256 indexed id, uint256 startTime, uint256 endTime, address indexed initiator, uint256 votesFor, uint256 votesAgainst, VotingStatus indexed votingStatus, string description);
    event ProposalExecuted(uint256 indexed proposalId, VotingStatus indexed status);
    event NewStartupInvestment(address indexed startup, uint256 amount);
    event StartupInvestment(address indexed startup, uint256 amount);
    event VotingCancelled(uint256 indexed id);

    // Данные
    mapping(uint256 => mapping(address => VoteSupport)) public voteSupports;
    mapping(uint256 => mapping(address => uint256)) public votes;
    mapping(VotingStatus => uint256[]) public votingProposals;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Voting) public votings;
    mapping(address => User) users;

    constructor() Governor("DaoSystem") {
        // Создание стартапы с тикетом PROFI и токеном RTKCoin
        Professional = new Token("Professional", "PROFI", 100_000);
        RTKCoin = new Token("RTKCoin", "RTK", 20_000_000);

        Professional.giveStartTokens();
        RTKCoin.mint(address(this), 20_000_000 * 10**Professional.decimals());

        addMember(Tom, "Tom", UserStatus.MEMBER);
        addMember(Ben, "Ben", UserStatus.MEMBER);
        addMember(Rick, "Rick", UserStatus.MEMBER);
        addMember(Jack, "Jack", UserStatus.NOT_MEMBER);
    }

    // Проверка, чтобы функцию мог запускать только Участник DAO
    modifier onlyMember() {
        require(users[msg.sender].status == UserStatus.MEMBER);
        _;
    }

    // Добавление участника DAO при запуске системы
    function addMember(address memberAddress, string memory name, UserStatus status) public {
        users[memberAddress] = User(name, memberAddress, status, 0);
    }

    // Исключение участника из DAO по его адресу
    function removeUserFromDao(address memberAddress) public {
        require(users[memberAddress].status == UserStatus.MEMBER, "User is not a member");
        users[memberAddress].status = UserStatus.NOT_MEMBER;
    }

    // Функция для получения данных о пользователе, принимает адрес пользователя
    function getUser(address userAddress) public view returns(User memory) {
        return users[userAddress];
    }

    // Вспомогательная функция, принимает адрес пользователя, возвращает его баланс Profi
    function getBalanceProfi(address user) public view returns(uint256) {
        return Professional.balanceOf(user);
    }

    // Фукнция для новых вложений в стартап
    function newStartupInvestment(address startupAddress, uint256 amount) external {
        emit NewStartupInvestment(startupAddress, amount);
    }

    // Фукнция для вложений в стартап
    function startupInvestment(address startupAddress, uint256 amount) internal {
        emit StartupInvestment(startupAddress, amount);
    }

    // Функция для покупки wrap за eth
    function buyWrapWithEth(uint256 amount) public payable {
        uint256 requiredEth = amount * WrapTokenPrice;
        require(RTKCoin.balanceOf(address(this)) >= requiredEth, "Not enough WRAP tokens in contract");
        RTKCoin.transferTokens(address(this), msg.sender, requiredEth * 10 ** RTKCoin.decimals());
        users[msg.sender].wrapTokenBalance += amount;
    }

    // Функция для покупки wrap за profi
    function buyWrapWithProfi(uint256 amount) public {
        uint256 requiredCost = amount * RtkExchangeRate;
        Professional.transferTokens(msg.sender, address(this), requiredCost * 10 ** Professional.decimals());
        RTKCoin.transferTokens(address(this), msg.sender, requiredCost * 10 ** RTKCoin.decimals());
        users[msg.sender].wrapTokenBalance += amount;
    }

    function propose(
        ProposalType proposalType,
        string memory description,
        QuorumType quorumType,
        address targetAddress, // Адрес участника или стартапа
        uint256 targetAmount // Сумма инвестиций или новый параметр
    ) public onlyMember {

        // Создаем массивы targets, values и calldatas
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(this); // Договор DAO
        values[0] = 0; // Нет перевода ETH

        // Заполняем массивы в зависимости от типа предложения
        if (proposalType == ProposalType.INVEST_NEW_STARTUP) {
            calldatas[0] = abi.encodeWithSignature("newStartupInvestment(address, uint256)", targetAddress, targetAmount);
        }
        else if (proposalType == ProposalType.ADD_INVESTMENT) {
            calldatas[0] = abi.encodeWithSignature("startupInvestment(address, uint256)", targetAddress, targetAmount);
        }
        else if (proposalType == ProposalType.ADD_MEMBER) {
            calldatas[0] = abi.encodeWithSignature("addUserToDao(address)", targetAddress);
        }
        else if (proposalType == ProposalType.REMOVE_MEMBER) {
            calldatas[0] = abi.encodeWithSignature("removeUserFromDao(address)", targetAddress);
        }
        else if (proposalType == ProposalType.MANAGE_WRAP_TOKEN) {
            calldatas[0] = abi.encodeWithSignature("executeTokenChange(address,uint256)", targetAddress, targetAmount);
        }
        _createProposal(targets, values, calldatas, description, quorumType, proposalType, targetAddress, targetAmount);
    }

    // Внутренняя функция создания предложения
    function _createProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        QuorumType quorumType,
        ProposalType proposalType,
        address targetAddress, // Адрес участника или стартапа
        uint256 targetAmount // Сумма инвестиций или новый параметр
    ) internal returns (uint256) {
        uint256 proposalId = super.propose(targets, values, calldatas, description);
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposalType: proposalType,
            proposer: msg.sender,
            description: description,
            votingId: proposalId, // В Governor proposalId == votingId
            executed: false,
            targetAddress: targetAddress,
            targetAmount: targetAmount
        });

        votings[proposalId] = Voting({
            initiator: msg.sender,
            description: description,
            startTime: 0,
            endTime: 0,
            status: VotingStatus.PENDING,
            quorumType: quorumType,
            votesFor: 0,
            votesAgainst: 0,
            totalVotes: 0,
            voters: new address[](0) // Инициализация пустого массива voters
        });  

        emit ProposalCreated(msg.sender, proposalId, proposalType, description, targetAddress, targetAmount, proposals[proposalId].executed);
        return proposalId;
    }

    function getProposal(uint256 proposalId) public view returns(Proposal memory) {
        return proposals[proposalId];
    }

    function checkVotingRequires(Voting memory voting) internal view {
        require(voting.status == VotingStatus.ACTIVE, "Voting is not active");
        require(block.timestamp <= voting.endTime, "Voting period has ended");
    }

    // Функция для начала голосования по предложению
    function startVoting(uint256 proposalId, uint256 timeForVoting) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer == msg.sender, "Only proposer can start voting");
        require(votings[proposal.votingId].startTime == 0, "Voting already started");

        Voting storage voting = votings[proposal.votingId];
        voting.startTime = block.timestamp; // Set startTime to current timestamp
        voting.endTime = block.timestamp + timeForVoting; // Set endTime
        voting.status = VotingStatus.ACTIVE; // Update status to ACTIVE
        votingProposals[VotingStatus.ACTIVE].push(proposalId);

        emit VotingStarted(proposalId, voting.startTime, voting.endTime, msg.sender, voting.votesFor, voting.votesAgainst, voting.status, voting.description);
    }

    function castVote(uint256 proposalId, bool support, uint256 tokenAmount) public onlyMember {
        Voting storage voting = votings[proposalId];

        checkVotingRequires(voting);
        require(!hasVoted(proposalId, msg.sender), "Already voted");
        require(proposals[proposalId].proposer != msg.sender, "Can't vote by yourself");

        // Определяем вес голоса
        uint256 votingPower;
        if (proposals[proposalId].proposalType == ProposalType.INVEST_NEW_STARTUP || 
            proposals[proposalId].proposalType == ProposalType.ADD_INVESTMENT) {
            // Для инвестиционных предложений вес голоса равен количеству токенов Profi
            votingPower = tokenAmount;
        } else {
            // Для остальных предложений один голос стоит 3 токена Profi
            require(tokenAmount == 3, "Invalid token amount for non-investment proposals");
            votingPower = 3;
        }

        require(Professional.balanceOf(msg.sender) >= tokenAmount, "Not enough Profi tokens");

        // Вычитаем токены Profi у пользователя
        Professional.transferTokens(msg.sender, address(this), tokenAmount * 10 ** Professional.decimals());

        _countVote(proposalId, msg.sender, support ? 1 : 0, votingPower, "");
        voting.voters.push(msg.sender);

        emit VoteCast(msg.sender, proposalId, support, votingPower, Professional.balanceOf(msg.sender));
    }

    function supportVote(uint256 proposalId, address voter, uint256 wrapTokenAmount) public {
        Voting storage voting = votings[proposalId];

        checkVotingRequires(voting);

        // Проверяем, что адрес, который поддерживают, уже проголосовал
        uint256 voterWeight = votes[proposalId][voter];
        require(voterWeight > 0, "The supported user has not voted yet");

        // Проверяем, что у пользователя достаточно wrap токенов
        require(RTKCoin.balanceOf(msg.sender) >= wrapTokenAmount, "Not enough wrap tokens");

        // Конвертируем wrap токены в голоса
        uint256 additionalVotes = wrapTokenAmount / RtkExchangeRate;

        RTKCoin.transferTokens(msg.sender, address(this), wrapTokenAmount);

        // Проверяем, как проголосовал пользователь (за или против)
        bool voterSupport = voteSupports[proposalId][voter].support;
        if (voterSupport) {
            // Если пользователь голосовал "За"
            voting.votesFor += additionalVotes;
        } else {
            // Если пользователь голосовал "Против"
            voting.votesAgainst += additionalVotes;
        }

        // Увеличиваем общий счетчик голосов
        voting.totalVotes += additionalVotes;

        // Записываем данные о поддержке
        voteSupports[proposalId][msg.sender] = VoteSupport({
            proposalId: proposalId,
            voter: voter,
            wrapTokens: wrapTokenAmount,
            support: voterSupport
        });

        emit VoteSupported(msg.sender, voter, proposalId, additionalVotes);
    }

    // Функция для отмены голосования
    function cancelVoting(uint256 proposalId) public onlyMember {
        Voting storage voting = votings[proposalId];
        checkVotingRequires(voting);
        require(msg.sender == voting.initiator, "Only initiator can cancel");
        
        // Возвращаем токены всем проголосовавшим участникам
        for (uint i = 0; i < voting.voters.length; i++) {
            address voter = voting.voters[i];
            uint256 voteAmount = votes[proposalId][voter];
            
            if (voteAmount > 0) {
                // Обнуляем запись о голосе
                delete votes[proposalId][voter];
                
                // Возвращаем токены участнику из счета инициатора
                require(
                    Professional.transferFrom(voting.initiator, voter, voteAmount),
                    "Token transfer failed"
                );
            }
        }
        
        // Очищаем список проголосовавших
        delete voting.voters;
        
        // Меняем статус голосования
        voting.status = VotingStatus.DELETED;
        
        emit VotingCancelled(proposalId);
    }

    // Функция для завершения голосования и выполнения предложения
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        Voting storage voting = votings[proposal.votingId];
        
        checkVotingRequires(voting);
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp > voting.endTime, "Voting is still ongoing");
        
        if (quorumReached(proposalId) && _voteSucceeded(proposalId)) {
            voting.status = VotingStatus.APPROVED;
            proposal.executed = true;
            _executeProposal(proposalId);
        } else {
            voting.status = VotingStatus.REJECTED;
        }
        
        emit ProposalExecuted(proposalId, voting.status);
    }

    // Внутренняя функция выполнения предложения
    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.proposalType == ProposalType.INVEST_NEW_STARTUP) {
            emit NewStartupInvestment(proposal.targetAddress, proposal.targetAmount);
        }
        else if (proposal.proposalType == ProposalType.ADD_INVESTMENT) {
            emit StartupInvestment(proposal.targetAddress, proposal.targetAmount);
        }
        else if (proposal.proposalType == ProposalType.ADD_MEMBER) {
            users[proposal.targetAddress].status = UserStatus.MEMBER;
        }
        else if (proposal.proposalType == ProposalType.MANAGE_WRAP_TOKEN) {
            RtkExchangeRate = proposal.targetAmount;
        } 
        else if (proposal.proposalType == ProposalType.REMOVE_MEMBER) {
            removeUserFromDao(proposal.targetAddress);
        }
    }

    // Функция проверки достижения кворума, принимает ID предложения, при успехе возвращает true и наоборот
    function quorumReached(uint256 proposalId) public view returns (bool) {
        Voting storage voting = votings[proposalId];
        Proposal storage proposal = proposals[proposalId];

        if (proposal.proposalType == ProposalType.INVEST_NEW_STARTUP || 
            proposal.proposalType == ProposalType.ADD_INVESTMENT) {
                // Минимальный порог - эквивалент 30% от общего предложенного количества
                uint256 minQuorum = (Professional.totalSupply() / VoteTokenRate) * 30 / 100;
                return voting.votesFor >= minQuorum;
        }
        else {
            if (voting.quorumType == QuorumType.SIMPLE_MAJORITY) {
                return voting.votesFor > voting.votesAgainst;
            } else if (voting.quorumType == QuorumType.SUPER_MAJORITY) {
                return voting.votesFor > (voting.votesFor + voting.votesAgainst) * 2 / 3;
            }
        }
        revert("Invalid quorum conditions");
    }

    // Дальше вся муть нужная для компиляции контракта, без нее Governor ругается

    function COUNTING_MODE() external pure override returns (string memory) {
        return "support=bravo&quorum=against,for,abstain";
    }

    function CLOCK_MODE() pure public override(Governor) returns (string memory) {
        return "mode=blocknumber&from=default";
    }

    function clock() view public override(Governor) returns (uint48) {
        return uint48(block.timestamp);
    }

    function quorum(uint256 /*timepoint*/) public pure override returns (uint256) {
        // Для совместимости с интерфейсом, возвращаем минимальное значение
        return 1;
    }

    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 block delay
    }

    function votingPeriod() pure public override returns (uint256) {
        return 150; // ~5 min in blocks
    }

    function _getVotes(
        address account,
        uint256 timepoint,
        bytes memory /* params */
    ) internal view override(Governor) returns (uint256) {
        return Professional.getPastVotes(account, timepoint);
    }

    // Обновляем _countVote
    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight,
        bytes memory
    ) internal override returns(uint256) {
        Voting storage voting = votings[proposalId];
        require(!hasVoted(proposalId, account), "Already voted");
        
        if (support == 1) { // For
            voting.votesFor += weight / 3;
        } else if (support == 0) { // Against
            voting.votesAgainst += weight / 3;
        }
        
        voting.totalVotes += weight;
        votes[proposalId][account] = weight;
        
        return weight;
    }

    function _quorumReached(uint256 proposalId) internal view override returns (bool) {
        Voting storage voting = votings[proposalId];
        uint256 totalMembers = 0; // You should track total members dynamically
        return voting.votesFor + voting.votesAgainst >= totalMembers / 2 + 1;
    }

    function _voteSucceeded(uint256 proposalId) internal view override returns (bool) {
        Voting storage voting = votings[proposalId];
        return voting.votesFor > voting.votesAgainst;
    }

    function hasVoted(uint256 proposalId, address account) public view override returns (bool) {
        // Check if the account has already voted by looking at the `votes` mapping
        return votes[proposalId][account] > 0;
    }
}