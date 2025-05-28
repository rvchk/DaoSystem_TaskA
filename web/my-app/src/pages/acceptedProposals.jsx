import { useEffect, useState } from "react"
import { useData } from "../data/DataProvider"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/shared/FetchAccounts"
import { GoBackButton } from "../components/shared/goBackButton"

export default function AcceptedProposals() {
  const [votings, setVotings] = useState()
  const { smartContract } = useData()

  async function fetchVotingDetails() {
    let details = []
    const currentVotings = await smartContract.getAllVotings()
    for (let i = 0; i < currentVotings.length; i++) {
      details.push(currentVotings[i].returnValues);
    }
    setVotings(details.filter(item => item.status == "APPROVED"))
    return details;
  }

  useEffect(() => {
    if (smartContract) {
      fetchVotingDetails()
    }
  }, [smartContract])
  console.log(votings)

  return (
    <>
      <h1>Все голосования</h1>
      <h2>Все предложения вынесенные на голосование</h2>
      {
        votings == []
          ? <h3> Нету голосований</h3>
          : <AllCurrentVotings votings={votings} showAll={true} />
      }
      <FetchAccounts />
      <GoBackButton />
    </>
  )
}