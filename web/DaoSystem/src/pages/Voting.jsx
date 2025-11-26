import { useEffect, useState } from "react";
import { useData } from "../data/DataProvider";
import { UserInfo } from "../components/shared/userInfo";
import VotingForm from "../components/voting/forms/votingForm";
import VotingCard from "../components/voting/votingCard";

export default function Voting() {
  const [votings, setVotings] = useState();
  const { smartContract } = useData();

  async function fetchVotingDetails() {
    let currentProposals = [];
    const pastProposals = await smartContract.getUserPastProposals();
    for (let i = 0; i < pastProposals.length; i++) {
      const proposalId = pastProposals[i].returnValues.proposalId;
      const proposalInfo = await smartContract.getProposalInfo(proposalId);
      if (proposalInfo.status > 0) {
        currentProposals.push({
          id: proposalId,
          ...proposalInfo
        });
      }
    }

    setVotings(currentProposals);
  }

  useEffect(() => {
    if (smartContract) {
      fetchVotingDetails();
    }
  }, [smartContract]);

  return (
    <>
      <h1>Голосование</h1>
      <VotingForm />
      <h2>Все предложения на голосовании</h2>
      <div className='AllVotings'>
        {votings?.map((voting) => (
          <VotingCard voting={voting} key={voting.id} />
        ))}
      </div>
      <UserInfo />
    </>
  );
}
