import { useEffect, useState } from "react";
import { useData } from "../data/DataProvider";

export default function AcceptedProposals() {
  const [votings, setVotings] = useState([]);
  const { smartContract } = useData();

  async function fetchVotingDetails() {
    let details = [];
    const currentVotings = await smartContract.getAcceptedProposals();
    for (let i = 0; i < currentVotings.length; i++) {
      details.push(currentVotings[i].returnValues);
    }
    setVotings(details)
  }

  useEffect(() => {
    if (smartContract) {
      fetchVotingDetails();
    }
  }, [smartContract]);

  return (
    <>
      <h1>Все голосования</h1>
      {votings.length == 0 ? <h3> Нету голосований</h3> : <AllCurrentVotings votings={votings} />}
    </>
  );
}
