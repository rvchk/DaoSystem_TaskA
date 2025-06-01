import { ethers } from "ethers";

export default class SmartContract {
  constructor(selectedAccount, contract) {
    if (!selectedAccount || !contract) {
      alert("Вы не можете пользоваться функционалом, авторизуйтесь");
    }
    this.selectedAccount = selectedAccount;
    this.contract = contract;
  }
  // Метод получения Профи баланса пользователя
  async getBalanceProfi(userAddress) {
    const result = await this.contract.methods
      .getBalanceProfi(userAddress)
      .call();
    return result;
  }

  async getUserObject(userAddress) {
    const result = await this.contract.methods.getUser(userAddress).call();
    return result;
  }

  async buyWrapTokensByProfi(amount) {
    const result = await this.contract.methods.buyWrapWithProfi(amount).send({
      from: this.selectedAccount,
    });
    return result;
  }

  async buyWrapTokensByEth(amount) {
    const result = await this.contract.methods.buyWrapWithEth(amount).send({
      from: this.selectedAccount,
      value: ethers.parseEther(amount.toString()),
    });
    return result;
  }

  async getUserPastProposals() {
    const result = await this.contract.getPastEvents("ProposalCreated", {
      filter: { creator: this.selectedAccount, executed: "false" },
      fromBlock: 0,
      toBlock: "latest",
    });
    return result;
  }

  async getCurrentVotings() {
    const result = await this.contract.getPastEvents("VotingStarted", {
      filter: { votingStatus: "3" },
      fromBlock: 0,
      toBlock: "latest",
    });
    return result;
  }

  async getAllVotings() {
    const result = await this.contract.getPastEvents("VotingStarted", {
      fromBlock: 0,
      toBlock: "latest",
    });
    console.log(result);
    return result;
  }

  async getInvestment() {
    const result = await this.contract.getPastEvents("NewStartupInvestment", {
      fromBlock: 0,
      toBlock: "latest",
    });
    console.log(result);
    return result;
  }

  async getAcceptedProposals() {
    const result = await this.contract.getPastEvents("ProposalExecuted", {
      fromBlock: 0,
      toBlock: "latest",
    });
    console.log(result);
    return result;
  }

  async supportVote(id, voter, amount) {
    await this.contract.methods
      .supportVote(id, voter, amount)
      .send({ from: this.selectedAccount });
  }

  async createPropose(
    currentPropose,
    description,
    quorumType,
    memberOrStartup,
    amountOrParameter,
  ) {
    // Здесь тип кворума weighted, потому что голосование токенами
    if (currentPropose == 0 || currentPropose == 1) {
      const result = await this.contract.methods
        .propose(
          currentPropose,
          description,
          2,
          memberOrStartup,
          amountOrParameter,
        )
        .send({ from: this.selectedAccount });
      return result.events.ProposalCreated.returnValues;
    }

    // Тут можно выбрать тип достижения кворума
    else {
      const result = await this.contract.methods
        .propose(
          currentPropose,
          description,
          quorumType,
          memberOrStartup,
          amountOrParameter,
        )
        .send({ from: this.selectedAccount });
      return result.events.ProposalCreated.returnValues;
    }
  }

  async fetchUserProposals() {
    try {
      const proposals = await this.contract.methods
        .getUserProposals(this.selectedAccount)
        .call();
      return proposals;
    } catch (error) {
      console.error("Error fetching user proposals:", error.message);
    }
  }

  async getProposal(proposalId) {
    const proposal = await this.contract.methods.getProposal(proposalId).call();
    return proposal;
  }

  async startVoting(proposalId, votingTime) {
    await this.contract.methods
      .startVoting(proposalId, votingTime)
      .send({ from: this.selectedAccount });
  }

  async getWrapExchange() {
    const result = await this.contract.methods.RtkExchangeRate().call();
    return result;
  }

  async cancelVoting(id) {
    try {
      await this.contract.methods
        .cancelVoting(id)
        .send({ from: this.selectedAccount });
    } catch (error) {
      console.error("Ошибка:", error.reason || error.message);
    }
  }

  async castVote(proposalId, support, tokenAmount) {
    await this.contract.methods
      .castVote(proposalId, support, tokenAmount)
      .send({ from: this.selectedAccount });
  }

  async getVotes(id) {
    const result = await this.contract.methods.votings(id).call();
    return result;
  }

  async getProposalInfo(id) {
    const result = await this.contract.methods.proposals(id).call();
    return result;
  }

  async deleteProposal(id) {
    await this.contract.methods
      .deleteProposal(id)
      .send({ from: this.selectedAccount });
    console.log("Предложение удалено");
  }

  async executeProposal(id, creator) {
    await this.contract.methods.executeProposal(id).send({ from: creator });
  }
}
