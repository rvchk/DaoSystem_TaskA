import { useEffect, useState } from "react"
import { useData } from "../data/DataProvider"
import { UserInfo } from "../components/userInfo"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/FetchAccounts"
import { GoBackButton } from "../components/goBackButton"

export default function Votings() {
  const [votings, setVotings] = useState()
  const { smartContract } = useData()

  async function fetchVotingDetails() {
    let details = []
    const currentVotings = await smartContract.getCurrentVotings()
    for (let i = 0; i < currentVotings.length; i++) {
      details.push(currentVotings[i].returnValues);
    }
    setVotings(details)
    return details;
  }

  useEffect(() => {
    if (smartContract) {
      fetchVotingDetails()
    }
  }, [smartContract])

  return (
    <>
      <h1>Все голосования</h1>
      <h2>Все предложения вынесенные на голосование</h2>
      {
        !votings == []
          ? <h3> Нету голосований</h3>
          : <AllCurrentVotings votings={votings} />
      }
      <FetchAccounts />
      <GoBackButton />
    </>
  )
}