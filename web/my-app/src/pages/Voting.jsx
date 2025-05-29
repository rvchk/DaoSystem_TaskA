import { useEffect, useState, useRef } from "react"
import { useData } from "../data/DataProvider"
import { UserInfo } from "../components/shared/userInfo"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/shared/FetchAccounts"
import { GoBackButton } from "../components/shared/goBackButton"
import { Button } from "react-bootstrap"

export default function Voting() {
    const [selectedCheckbox, setSelectedCheckbox] = useState(true);
    const [votingAmount, setVotingAmount] = useState(0)
    const [votings, setVotings] = useState()
    const { smartContract } = useData()

    const votingId = useRef()

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

    const sendVote = async () => {
        await smartContract.castVote(
            votingId.current.value,
            selectedCheckbox,
            votingAmount,
        )
    }

    return (
        <>
            <h1>Голосование</h1>
            <h2>Проголосовать</h2>
            <input type="number" placeholder="ID голосования" ref={votingId} />
            <input type="number" placeholder="Сколько токенов" onChange={(e) => setVotingAmount(e.target.value)} />
            <span>{(votingAmount / 3).toFixed(1)} Голосов</span>
            <div className="checkbox-block">
                <div>
                    <input
                        type="checkbox"
                        id="checkbox-true"
                        checked={selectedCheckbox}
                        onChange={() => setSelectedCheckbox(true)}
                    />
                    <label htmlFor="checkbox-true" style={{ cursor: 'pointer' }}>За</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        id="checkbox-false"
                        checked={!selectedCheckbox}
                        onChange={() => setSelectedCheckbox(false)}
                    />
                    <label htmlFor="checkbox-false" style={{ cursor: 'pointer' }}>Против</label>
                </div>
            </div>
            <button onClick={sendVote}>Проголосовать</button>

            <h2>Все предложения на голосовании</h2>
            <AllCurrentVotings votings={votings} />
            <UserInfo />
            <FetchAccounts />
            <GoBackButton />
        </>
    )
}