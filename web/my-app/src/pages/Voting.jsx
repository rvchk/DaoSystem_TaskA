import { useEffect, useState } from "react"
import { useData } from "../data/DataProvider"
import { UserInfo } from "../components/userInfo"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/FetchAccounts"
import { GoBackButton } from "../components/goBackButton"

export default function Voting() {
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
            <h1>Голосование</h1>
            <h2>Все предложения на голосовании</h2>
            <AllCurrentVotings votings={votings} />
            <UserInfo />
            <FetchAccounts />
            <GoBackButton />
        </>
    )
}