import { useState, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { useData } from "../../../data/DataProvider";

export default function VotingForm() {
  const [votingAmount, setVotingAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState("profi");
  const { smartContract } = useData();

  const votingId = useRef();
  const addressRef = useRef();

  const sendVoteFor = async () => {
    if (!votingId.current.value || !votingAmount) {
      alert("Заполните все поля!");
      return;
    }
    await smartContract.castVote(votingId.current.value, true, votingAmount);
  };

  const sendVoteAgainst = async () => {
    if (!votingId.current.value || !addressRef.current.value || !votingAmount) {
      alert("Заполните все поля!");
      return;
    }
    await smartContract.castVote(votingId.current.value, false, votingAmount);
  };

  const supportVote = async () => {
    if (!votingId.current.value || !addressRef.current.value || !votingAmount) {
      alert("Заполните все поля!");
      return;
    }
    if (votingAmount <= 0) {
      alert("Введите положительное значение!");
      return;
    }
    await smartContract.supportVote(votingId.current.value, addressRef.current.value, votingAmount);
  };

  return (
    <>
      <h2>{selectedToken == "profi" ? "Проголосовать" : "Поддержать"}</h2>
      <Form.Control type="number" placeholder="ID голосования" ref={votingId} />
      {selectedToken == "wrap" && (
        <input type="text" placeholder="Адрес пользователя" ref={addressRef} />
      )}
      <Stack direction="horizontal" style={{ justifyContent: "center" }}>
        <Form.Select
          style={{ width: "100px" }}
          className="flex-shrink-0"
          onChange={(e) => setSelectedToken(e.target.value)}
        >
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
      {selectedToken == "profi" ? (
        <Stack
          direction="horizontal"
          gap={3}
          style={{ justifyContent: "center", marginTop: "20px" }}
        >
          <Button variant="success" onClick={sendVoteFor}>
            За
          </Button>
          <Button variant="danger" onClick={sendVoteAgainst}>
            Против
          </Button>
        </Stack>
      ) : (
        <Button variant="secondary" onClick={supportVote} style={{ marginTop: "10px" }}>
          Поддержать
        </Button>
      )}
    </>
  );
}
