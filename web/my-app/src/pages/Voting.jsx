import { useEffect, useState, useRef } from "react";
import { useData } from "../data/DataProvider";
import { UserInfo } from "../components/shared/userInfo";
import AllCurrentVotings from "../components/voting/allCurrentVotings";
import FetchAccounts from "../components/shared/FetchAccounts";
import { GoBackButton } from "../components/shared/goBackButton";
import { Button, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";

export default function Voting() {
  const [selectedCheckbox, setSelectedCheckbox] = useState(true);
  const [votingAmount, setVotingAmount] = useState("");
  const [votings, setVotings] = useState();
  const [error, setError] = useState("");

  const { smartContract } = useData();
  const votingId = useRef();

  async function fetchVotingDetails() {
    let details = [];
    try {
      const currentVotings = await smartContract.getCurrentVotings();
      for (let i = 0; i < currentVotings.length; i++) {
        details.push(currentVotings[i].returnValues);
      }
      setVotings(details);
    } catch (err) {
      console.error("Ошибка загрузки голосований:", err);
    }
  }

  useEffect(() => {
    if (smartContract) {
      fetchVotingDetails();
    }
  }, [smartContract]);

  const sendVote = async () => {
    const id = votingId.current?.value;
    const amount = parseFloat(votingAmount);

    if (!id || isNaN(id) || id <= 0) {
      setError("Введите корректный ID голосования");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError("Укажите положительное количество токенов");
      return;
    }

    setError("");

    try {
      await smartContract.castVote(id, selectedCheckbox, amount);
      alert("Голос учтён!");
    } catch (err) {
      console.error("Ошибка голосования:", err);
      setError("Не удалось проголосовать. Проверьте MetaMask.");
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Голосование</h1>
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-white">Проголосовать</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="votingId">
                <Form.Label>ID голосования</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Например: 123"
                  ref={votingId}
                  min="1"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="tokenAmount">
                <Form.Label>Сколько токенов</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Количество токенов"
                  value={votingAmount}
                  onChange={(e) => setVotingAmount(e.target.value)}
                  min="0"
                  step="1"
                />
                <Form.Text muted>
                  {(votingAmount ? (votingAmount / 3).toFixed(1) : 0)} голосов
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="d-flex gap-4 align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  id="checkbox-true"
                  label="За"
                  checked={selectedCheckbox}
                  onChange={() => setSelectedCheckbox(true)}
                  style={{ cursor: "pointer" }}
                />
                <Form.Check
                  type="checkbox"
                  id="checkbox-false"
                  label="Против"
                  checked={!selectedCheckbox}
                  onChange={() => setSelectedCheckbox(false)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </Col>

            <Col xs={12}>
              <Button variant="primary" onClick={sendVote} className="w-100">
                Проголосовать
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <h2 className="mb-3">Все предложения на голосовании</h2>
      <AllCurrentVotings votings={votings} />
      <UserInfo />
      <FetchAccounts />
      <GoBackButton />
    </Container>
  );
}