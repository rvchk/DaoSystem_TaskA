import { useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { useData } from "../../../data/DataProvider";

export default function StartVotingForm() {
  const proposeIdRef = useRef();
  const votingTimeRef = useRef();
  const { smartContract } = useData();

  function timeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + seconds;
  }

  const startVoting = () => {
    if (proposeIdRef.current.value == 0 || !votingTimeRef.current.value) {
      alert("Заполните все поля");
      return;
    }
    const timeForVoting = timeToSeconds(votingTimeRef.current.value);
    try {
      smartContract.startVoting(proposeIdRef.current.value, timeForVoting);
      proposeIdRef.current.value = "";
      votingTimeRef.current.value = "";
    } catch (e) {
      console.log(e);
      alert("Неправильное id предложения");
    }
  };

  return (
    <>
      <h2>Вынести на голосование</h2>
      <Form.Control
        type="text"
        placeholder="ID предложения"
        ref={proposeIdRef}
      />
      <Form.Control type="time" ref={votingTimeRef} />
      <Button onClick={startVoting} variant="secondary">
        Вынести
      </Button>
    </>
  );
}
