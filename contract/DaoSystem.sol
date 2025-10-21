// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DaoTypes.sol";
import { Token } from "./Token.sol";

contract DaoSystem {
    address internal Tom = 0x990221C5080023298D2abE4C43e07d7D844894a9;
    address internal Ben = 0xD6f9EDa37aC1445755F3ec3c5Fa51660Ca40678C;
    address internal Rick = 0x2cE921Bff1c951914B062f2557d6914521bb8E77;
    address internal Jack = 0xb7ec4240d2A4e5bfB8c398F13e7c47c4138b1A44;
    address internal Fond = 0x942aB5420dBd2838D89da4cfdDfE7c7D3C59BFC2;

    Token internal Professional;
    Token internal RTKCoin;

    // Отношение к Profi для обмена
    uint256 public RtkExchangeRate = 2;
    uint256 internal VoteTokenRate = 3; // 1 голос = 3 системных токена
    uint256 public WrapTokenPrice = 1; // Цена wrap token = 1 ETH
    uint256 public proposalCount = 0; // Счетчик предложений, вместо рандомного числа через super.propose

    // indexed нужен, чтобы можно было отфильтровать ивенты на Фронтенде, например Создание Предложения, только от определенного адреса
    event VoteSupported(address indexed supporter, address indexed voter, uint256 indexed proposalId, uint256 additionalVotes);
    event VoteCast(address indexed voter,uint256 indexed proposalId,bool support,uint256 votingPower,uint256 profiAmount);
    event ProposalCreated(address indexed creator, uint256 id, ProposalType proposalType, string description, address targetAddress, uint256 targetAmount, bool indexed executed);
    event VotingStarted(uint256 indexed id, uint256 startTime, uint256 endTime, address indexed initiator, uint256 votesFor, uint256 votesAgainst, VotingStatus indexed votingStatus, string description);
    event ProposalExecuted(uint256 indexed proposalId, VotingStatus indexed status);
    event NewStartupInvestment(address indexed startup, uint256 amount);
    event StartupInvestment(address indexed startup, uint256 amount);

    // Все mapping
    mapping(uint256 => mapping(address => VoteSupport)) public voteSupports;
    mapping(uint256 => mapping(address => uint256)) public votes;
    mapping(VotingStatus => uint256[]) public votingProposals;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Voting) public votings;
    mapping(address => User) public users;

    constructor() {
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

    // При инициализации Mapping, солидити сам создает функцию, для получения этого поля, тоесть эта функция не нужна
    // Функция для получения данных о пользователе, принимает адрес пользователя
    // function getUser(address userAddress) public view returns(User memory) {
    //     return users[userAddress];
    // }

    // Вспомогательная функция, принимает адрес пользователя, возвращает его баланс Profi
    function getBalanceProfi(address user) public view returns(uint256) {
        return Professional.balanceOf(user);
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

    // Функция создания предложения
    function propose(
        string memory description,
        QuorumType quorumType,
        ProposalType proposalType,
        address targetAddress, // Адрес участника или стартапа
        uint256 targetAmount // Сумма инвестиций или новый параметр
    ) public returns (uint256) {
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposalType: proposalType,
            proposer: msg.sender,
            description: description,
            votingId: proposalId, // В Governor proposalId == votingId
            executed: false,
            onVoting: false,
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
            voters: new address[](0) // Инициализация пустого массива voters
        });  

        emit ProposalCreated(msg.sender, proposalId, proposalType, description, targetAddress, targetAmount, proposals[proposalId].executed);
        return proposalId;
    }

    function deleteProposal(uint256 id) public {
        delete proposals[id];
    }

    // Функция для начала голосования по предложению
    function startVoting(uint256 proposalId, uint256 timeForVoting) public {
        Proposal storage proposal = proposals[proposalId];
        proposal.onVoting = true;

        Voting storage voting = votings[proposalId];
        voting.startTime = block.timestamp; // Set startTime to current timestamp
        voting.endTime = block.timestamp + timeForVoting; // Set endTime
        voting.status = VotingStatus.ACTIVE; // Update status to ACTIVE
        votingProposals[VotingStatus.ACTIVE].push(proposalId);

        emit VotingStarted(proposalId, voting.startTime, voting.endTime, msg.sender, voting.votesFor, voting.votesAgainst, voting.status, voting.description);
    }

    function castVote(uint256 proposalId, bool support, uint256 tokenAmount) public onlyMember {
        Voting storage voting = votings[proposalId];

        require(voting.status == VotingStatus.ACTIVE, "Voting is not active");
        require(!hasVoted(proposalId, msg.sender), "Already voted");

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

        countVote(proposalId, msg.sender, support ? 1 : 0, votingPower);
        voting.voters.push(msg.sender);

        emit VoteCast(msg.sender, proposalId, support, votingPower, Professional.balanceOf(msg.sender));
    }

    function supportVote(uint256 proposalId, address voter, uint256 wrapTokenAmount) public {
        Voting storage voting = votings[proposalId];

        require(voting.status == VotingStatus.ACTIVE, "Voting is not active");

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
        voterSupport
            ? voting.votesFor += additionalVotes 
            : voting.votesAgainst += additionalVotes;

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

        // Возвращаем токены всем проголосовавшим участникам
        for (uint i = 0; i < voting.voters.length; i++) {
            address voter = voting.voters[i];
            uint256 voteAmount = votes[proposalId][voter];
            
            if (voteAmount > 0) {
                Professional.transferFrom(voting.initiator, voter, voteAmount);
            }
        }
    
        voting.status = VotingStatus.DELETED;
        proposals[proposalId].onVoting = false;        
    }

    // Функция для завершения голосования и выполнения предложения
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        Voting storage voting = votings[proposalId];
        
        if (quorumReached(proposalId) && voteSucceeded(proposalId)) {
            voting.status = VotingStatus.APPROVED;
            proposal.executed = true;
            execute(proposalId);
            emit ProposalExecuted(proposalId, voting.status);
        } else {
            voting.status = VotingStatus.REJECTED;
        }
    }

    // Внутренняя функция выполнения предложения
    function execute(uint256 proposalId) internal {
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
                return voting.votesFor > voting.votesAgainst;
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

    function countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight
    ) internal returns(uint256) {
        Voting storage voting = votings[proposalId];
        require(!hasVoted(proposalId, account), "Already voted");
        
        if (support == 1) {
            voting.votesFor += weight / 3;
        } else {
            voting.votesAgainst += weight / 3;
        }
        
        votes[proposalId][account] = weight;
        return weight;
    }

    function voteSucceeded(uint256 proposalId) internal view returns (bool) {
        Voting storage voting = votings[proposalId];
        return voting.votesFor > voting.votesAgainst;
    }

    function hasVoted(uint256 proposalId, address account) public view returns (bool) {
        return votes[proposalId][account] > 0;
    }
}