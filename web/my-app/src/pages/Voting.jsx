import { useEffect, useState, useRef } from "react"
import { useData } from "../data/DataProvider"
import { UserInfo } from "../components/shared/userInfo"
import AllCurrentVotings from "../components/voting/allCurrentVotings"
import FetchAccounts from "../components/shared/FetchAccounts"
import { GoBackButton } from "../components/shared/goBackButton"
import { Button, Form, Stack } from "react-bootstrap"

export default function Voting() {
    const [votingAmount, setVotingAmount] = useState(0)
    const [selectedToken, setSelectedToken] = useState("profi")
    const [votings, setVotings] = useState()
    const { smartContract } = useData()

    const votingId = useRef()
    const addressRef = useRef()

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

    const sendVoteFor = async () => {
        await smartContract.castVote(
            votingId.current.value,
            true,
            votingAmount,
        )
    }

    const sendVoteAgainst = async () => {
        await smartContract.castVote(
            votingId.current.value,
            false,
            votingAmount,
        )
    }

    const supportVote = async () => {
        if (!votingId.current.value || !addressRef.current.value || !votingAmount) {
            alert("Заполните все поля!")
            return
        }
        if (votingAmount <= 0) {
            alert("Введите положительное значение!")
            return
        }
        await smartContract.supportVote(
            votingId.current.value,
            addressRef.current.value,
            votingAmount
        )
    }

    return (
        <>
            <h1>Голосование</h1>
            <h2>{selectedToken == "profi" ? "Проголосовать" : "Поддержать"}</h2>
            <input type="number" placeholder="ID голосования" ref={votingId} />
            {
                selectedToken == "wrap" && (
                    <input type="text" placeholder="Адрес пользователя" ref={addressRef} />
                )
            }
            <Stack direction="horizontal" style={{ justifyContent: "center" }}>
                <Form.Select
                    style={{ width: '100px' }}
                    className="flex-shrink-0"
                    onChange={(e) => setSelectedToken(e.target.value)}>
                    <option value="profi">PROFI</option>
                    <option value="wrap">WRAP</option>
                </Form.Select>
                <Form.Control
                    type="number"
                    placeholder="Сколько токенов..."
                    value={votingAmount}
                    onChange={(e) => setVotingAmount(e.target.value)}
                    style={{ margin: "0" }}
                />
            </Stack>
            {
                selectedToken == "profi" ? (
                    <Stack direction="horizontal" gap={3} style={{ justifyContent: "center", marginTop: "20px" }}>
                        <Button variant="success" onClick={sendVoteFor}>За</Button>
                        <Button variant="danger" onClick={sendVoteAgainst}>Против</Button>
                    </Stack>
                ) : <Button variant="secondary" onClick={supportVote} style={{ marginTop: "10px" }}>Поддержать</Button>
            }

            <h2>Все предложения на голосовании</h2>
            <AllCurrentVotings votings={votings} />
            <UserInfo />
            <FetchAccounts />
            <GoBackButton />
        </>
    );
}