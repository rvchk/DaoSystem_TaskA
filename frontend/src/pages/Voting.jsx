import { useEffect, useState } from "react";
import ProposalCard from "../components/ui/ProposalCard";
import { useData } from "../components/useData";

export default function Voting() {
  const { smartContract } = useData()
  const [proposals, setProposals] = useState()
  const [decisions, setDecisions] = useState();

  // const decisions = proposals.filter(x => x.state == 1)

  useEffect(() => {
    const loadDecisions = async () => {
      if (!smartContract) return;

      const ids = (await smartContract.getProposals()).map(
        (x) => x.returnValues.proposalId
      );

      const data = await Promise.all(
        ids.map(async (id) => ({
          id: id,
          ...(await smartContract.proposals(id)),
          state: await smartContract.state(id),
        }))
      );

      setDecisions(data.filter(x => x.state >= 2));
    };

    loadDecisions();
  }, [smartContract]);

  return (
    <>
      <h1>Активные голосования</h1>
      {decisions?.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
      {decisions?.length == 0 && (
        <p>Пока нету предложений на голосовании</p>
      )}
    </>
  );
}
