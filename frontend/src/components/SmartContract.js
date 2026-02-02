import {ethers} from "ethers"

export function createSmartContract(account, contract) {
  if (!account || !contract) return null;
  
  const send = (method, ...params) => 
    contract.methods[method](...params).send({ from: account });

  const getEvents = (name, filter) => 
      contract.getPastEvents(name, { filter, fromBlock: 0 })

  return {

    getUser: (address) => contract.methods.getUser(address).call(),
    state: (id) => contract.methods.state(id).call(),
    getWrapRate: () => contract.methods.rtkExchangeRate().call(),
    proposals: (id) => contract.methods.proposals(id).call(),
    
    buyWrapWithProfi: (amount) => send("buyWrapWithProfi", amount),
    supportVote: (id, voter, amount) => send("supportVote", id, voter, amount),
    castVote: (id, support, amount) => send("castVote", id, support, amount),
    closeVoting: (id) => send("closeVoting", id),
    executeProposal: (id, creator) => send("executeProposal", id, creator),
    
    createProposal: (desc, quorum, type, target, amount, time) => 
      send("propose", desc, target, amount, type, quorum, time),
    
    buyWrapWithEth: (amount) => 
      contract.methods.buyWrapWithEth(amount).send({
        from: account,
        value: ethers.parseEther(amount.toString())
      }),
    
    getProposals: () => getEvents("ProposalCreated", {}),
  };
}