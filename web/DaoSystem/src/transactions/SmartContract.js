import { ethers } from "ethers";

export default class SmartContract {
  constructor(selectedAccount, contract) {
    if (!selectedAccount || !contract) {
      alert("Вы не можете пользоваться функционалом, авторизуйтесь");
    }
    this.selectedAccount = selectedAccount;
    this.contract = contract;
  }

  async getBalanceProfi(userAddress) {
    return await this.contract.methods.getBalanceProfi(userAddress).call();
  }

  async getUserObject(userAddress) {
    return await this.contract.methods.getUser(userAddress).call();
  }

  async buyWrapTokensByProfi(amount) {
    return await this.contract.methods.buyWrapWithProfi(amount).send({
      from: this.selectedAccount
    });
  }

  async buyWrapTokensByEth(amount) {
    return await this.contract.methods.buyWrapWithEth(amount).send({
      from: this.selectedAccount,
      value: ethers.parseEther(amount.toString())
    });
  }

  async getUserPastProposals() {
    return await this.contract.getPastEvents("ProposalCreated", {
      filter: { creator: this.selectedAccount, executed: "false" },
      fromBlock: 0,
      toBlock: "latest"
    });
  }

  async getCurrentVotings() {
    return await this.contract.getPastEvents("VotingStarted", {
      filter: { votingStatus: "3" },
      fromBlock: 0,
      toBlock: "latest"
    });
  }

  async getAllVotings() {
    return await this.contract.getPastEvents("VotingStarted", {
      fromBlock: 0,
      toBlock: "latest"
    });
  }

  async getInvestment() {
    return await this.contract.getPastEvents("NewStartupInvestment", {
      fromBlock: 0,
      toBlock: "latest"
    });
  }

  async getAcceptedProposals() {
    return await this.contract.getPastEvents("ProposalExecuted", {
      fromBlock: 0,
      toBlock: "latest"
    });
  }

  async supportVote(id, voter, amount) {
    await this.contract.methods.supportVote(id, voter, amount).send({ from: this.selectedAccount });
  }

  async createPropose(currentPropose, description, quorumType, memberOrStartup, amountOrParameter) {
    // Здесь тип кворума weighted, потому что голосование токенами
    if (currentPropose == 0 || currentPropose == 1) {
      const result = await this.contract.methods
        .propose(description, 2, currentPropose, memberOrStartup, amountOrParameter)
        .send({ from: this.selectedAccount });
      return result.events.ProposalCreated.returnValues;
    }

    // Тут можно выбрать тип достижения кворума
    else {
      const result = await this.contract.methods
        .propose(currentPropose, description, quorumType, memberOrStartup, amountOrParameter)
        .send({ from: this.selectedAccount });
      return result.events.ProposalCreated.returnValues;
    }
  }

  async fetchUserProposals() {
    return await this.contract.methods.getUserProposals(this.selectedAccount).call();
  }

  async getProposal(proposalId) {
    return await this.contract.methods.getProposal(proposalId).call();
  }

  async startVoting(proposalId, votingTime) {
    await this.contract.methods
      .startVoting(proposalId, votingTime)
      .send({ from: this.selectedAccount });
  }

  async getWrapExchange() {
    return await this.contract.methods.RtkExchangeRate().call();
  }

  async cancelVoting(id) {
    await this.contract.methods.cancelVoting(id).send({ from: this.selectedAccount });
  }

  async castVote(proposalId, support, tokenAmount) {
    await this.contract.methods
      .castVote(proposalId, support, tokenAmount)
      .send({ from: this.selectedAccount });
  }

  async getVotes(id) {
    return await this.contract.methods.votings(id).call();
  }

  async getProposalInfo(id) {
    return await this.contract.methods.proposals(id).call();
  }

  async deleteProposal(id) {
    await this.contract.methods.deleteProposal(id).send({ from: this.selectedAccount });
  }

  async executeProposal(id, creator) {
    await this.contract.methods.executeProposal(id).send({ from: creator });
  }
}
