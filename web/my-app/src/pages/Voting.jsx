import { useEffect, useState, useRef } from "react"
import { useData } from "../data/DataProvider"
import { UserInfo } from "../components/shared/userInfo"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/shared/FetchAccounts"
import { GoBackButton } from "../components/shared/goBackButton"
import { Button, Form, FormControl, InputGroup, Stack } from "react-bootstrap"

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
        <Stack direction="horizontal">
            <Form.Select style={{ width: '100px' }} className="flex-shrink-0">
                <option value="profi">PROFI</option>
                <option value="wrap">WRAP</option>
            </Form.Select>
            <Form.Control type="text" placeholder="Введите значение" className="rounded-start-0" />
        </Stack>
        <Stack direction="horizontal" gap={3} style={{justifyContent: "center"}}>
            <Button variant="secondary" onClick={sendVote}>Голосовать за</Button>
            <Button variant="secondary" onClick={sendVote}>Голосовать против</Button>
        </Stack>

        <h2>Все предложения на голосовании</h2>
        <AllCurrentVotings votings={votings} />
        <UserInfo />
        <FetchAccounts />
        <GoBackButton />
      </>
    );
}