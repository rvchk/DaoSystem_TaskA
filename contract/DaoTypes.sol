// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;    

// Статусы пользователей
enum UserStatus {
    NOT_MEMBER, // Не является участником DAO
    MEMBER // Участник DAO
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
    bool onVoting;
    ProposalType proposalType;
    address targetAddress;
    uint256 targetAmount;
}