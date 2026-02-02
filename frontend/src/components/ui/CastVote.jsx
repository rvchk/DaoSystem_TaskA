import { useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useData } from "../useData";

export default function CastVote({ show, onClose, id }) {
  const { smartContract } = useData();
  const [isSupport, setIsSupport] = useState(false);

  const amount = useRef();
  const address = useRef();

  const handleSubmit = async (support) => {
    if (!smartContract || !amount.current?.value) return;

    try {
      if (isSupport) {
        if (!address.current?.value) return;
        await smartContract.supportVote(
          id,
          amount.current.value,
          address.current.value
        );
      } else {
        console.log(id, support, amount.current.value)
        await smartContract.castVote(id, support, amount.current.value);
      }
      location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <h5>Голосовать</h5>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="number"
          placeholder="Кол-во токенов"
          ref={amount}
          className="mb-3"
        />
        {isSupport && (
          <Form.Control
            type="string"
            placeholder="Адрес"
            ref={address}
            className="mb-3"
          />
        )}
        <Form.Select
          onChange={(e) => setIsSupport(e.target.value === "support")}
          className="mb-3"
        >
          <option value="vote">Голос</option>
          <option value="support">Поддержка</option>
        </Form.Select>

        <div className="d-grid gap-2">
          <Button variant="success" onClick={() => handleSubmit(1)}>
            За
          </Button>
          <Button variant="danger" onClick={() => handleSubmit(0)}>
            Против
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
