import { ethers } from "ethers";

export default class SmartContract {
  constructor(selectedAccount, contract) {
    if (!selectedAccount || !contract) {
      alert("Вы не можете пользоваться функционалом, авторизуйтесь");
    }
    this.selectedAccount = selectedAccount;
    this.contract = contract;
    this.func = contract.methods;
    this.events = contract.getPastEvents.bind(contract);
  }


  // Методы call()
  getBalanceProfi = async (address) => this.func.getBalanceProfi(address).call();
  getUserObject = async (address) => this.func.users(address).call();
  fetchUserProposals = async () => this.func.getUserProposals(this.selectedAccount).call();
  getProposal = async (id) => this.func.getProposal(id).call();
  getWrapExchange = async () => this.func.RtkExchangeRate().call();
  getVotes = async (id) => this.func.votings(id).call();
  getProposalInfo = async (id) => this.func.proposals(id).call();


  // Методы send()
  sendTransaction = async (func, ...params) => {
    await this.func[func](...params).send({
      from: this.selectedAccount
    })
  }

  buyWrapTokensByProfi = async (amount) => this.sendTransaction("buyWrapWithProfi", amount)
  supportVote = async (id, voter, amount) => this.sendTransaction("supportVote", id, voter, amount)
  startVoting = async (id, votingTime) => this.sendTransaction("startVoting", id, votingTime)
  cancelVoting = async (id) => this.sendTransaction("cancelVoting", id)
  castVote = async (id, support, tokenAmount) => this.sendTransaction("castVote", id, support, tokenAmount)
  deleteProposal = async (id) => this.sendTransaction("deleteProposal", id)
  executeProposal = async (id, creator) => this.sendTransaction("executeProposal", id, creator)

  createPropose = async (description, quorumType, currentPropose, memberOrStartup, amountOrParameter) => {
    return this.sendTransaction("propose", description, (currentPropose <= 1 ? 2 : quorumType), currentPropose, memberOrStartup, amountOrParameter)
  }

  buyWrapTokensByEth = async (amount) => {
    return this.func.buyWrapWithEth(amount).send({
      from: this.selectedAccount,
      value: ethers.parseEther(amount.toString())
    });
  }


  // Методы PastEvents, обработка ивентов
  getPastEvents = async (func, filter) => this.events(func, { filter: filter, fromBlock: 0, toBlock: "latest" });

  getUserPastProposals = async () => this.getPastEvents("ProposalCreated", { creator: this.selectedAccount, executed: "false" })
  getCurrentVotings = async () => this.getPastEvents("VotingStarted", { votingStatus: "3" })
  getAllVotings = async () => this.getPastEvents("VotingStarted", {})
  getInvestment = async () => this.getPastEvents("NewStartupInvestment", {})
  getAcceptedProposals = async () => this.getPastEvents("ProposalExecuted", {})
}