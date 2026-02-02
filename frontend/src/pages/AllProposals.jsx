import { useEffect, useState } from "react";
import { useData } from "../components/useData";
import ProposalCard from "../components/ui/ProposalCard";

export default function AllProposals() {
  const { smartContract } = useData();
  const [decisions, setDecisions] = useState();

  useEffect(() => {
    const loadDecisions = async () => {
      if (!smartContract) return;

      try {
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
      } catch (err) {
        console.error("Error:", err);
      }
    };

    loadDecisions();
  }, [smartContract]);

  return (
    <>
      <h1>Журнал решений</h1>
      {decisions?.map((decision) => (
        <ProposalCard key={decision.id} proposal={decision} />
      ))}
      {decisions?.length == 0 && <p>Нету принятых решений</p>}
    </>
  );
}
