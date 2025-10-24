import { useState, useEffect } from "react";
import { useData } from "../data/DataProvider";
import StartVotingForm from "../components/proposal/forms/startVotingForm";
import CreateProposalForm from "../components/proposal/forms/createProposalForm";
import ProposalCard from "../components/proposal/ProposalCard";

function Propose() {
  const { smartContract, selectedAccount, user } = useData();
  const [userProposals, setUserProposals] = useState("");

  useEffect(() => {
    if (user?.status != "1" && user?.status != undefined) {
      alert("Вы не участник DAO");
      window.history.go(-1);
    }
    if (smartContract) {
      fetchProposalDetails();
    }
  }, [smartContract, selectedAccount]);

  async function fetchProposalDetails() {
    let currentProposals = [];
    const pastProposals = await smartContract.getUserPastProposals();
    for (let i = 0; i < pastProposals.length; i++) {
      currentProposals.push(
        await smartContract.getProposalInfo(pastProposals[i].returnValues.id)
      );
    }

    setUserProposals(currentProposals);
  }

  return (
    <>
      <h1>Предложения</h1>
      <StartVotingForm />
      <CreateProposalForm />
      {userProposals.length > 0 && (
        <>
          <h2>Ваши предложения</h2>
          <div className='AllProposals'>
            {userProposals.map((proposal) => (
              <ProposalCard proposal={proposal} key={proposal.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default Propose;
