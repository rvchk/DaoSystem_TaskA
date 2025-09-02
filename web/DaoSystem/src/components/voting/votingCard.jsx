import React, { useEffect, useState } from "react";
import { useData } from "../../data/DataProvider";
import { Button } from "react-bootstrap";

export default function VotingCard({ voting }) {
  const [name, setName] = useState();
  const [seconds, setSeconds] = useState("Загрузка...");
  const [minutes, setMinutes] = useState("");
  const [votingInfo, setVotingInfo] = useState();
  const { smartContract, user } = useData();

  async function getUser() {
    const creator = await smartContract.getUserObject(voting.initiator);
    setName(creator.name);
  }

  const votingStatus = ["Ожидает начала", "Не принято", "Принято", "Активно", "Удалено"];

  const getVotings = async () => {
    const votingInfo = await smartContract.getVotes(voting.id);
    setVotingInfo(votingInfo);
  };

  async function executeProposal() {
    await smartContract.executeProposal(voting.id, voting.initiator);
  }

  const cancelVoting = async () => {
    await smartContract.cancelVoting(voting.id);
    alert("Голосование закрыто");
  };

  useEffect(() => {
    if (smartContract) {
      getUser();
      getVotings();
    }

    const interval = setInterval(async () => {
      const time = Date.now();
      let timeLeft = String(voting.endTime) - time.toString().slice(0, 10);
      setMinutes(Math.floor(timeLeft / 60));
      setSeconds(timeLeft % 60);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setMinutes(0);
        setSeconds(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [smartContract]);

  const copyProposeId = () => {
    navigator.clipboard.writeText(voting?.id);
    alert("ID предложения скопирован");
  };

  const copyUserAddress = () => {
    navigator.clipboard.writeText(voting.initiator);
    alert("Адрес пользователя скопирован");
  };

  if (votingInfo?.status != 1 && votingInfo?.status != 4)
    return (
      <div className='ProposalCard'>
        {user.name == name && minutes != 0 && seconds != 0 && (
          <button className='deleteIcon' onClick={cancelVoting}>
            <img src='/delete-icon.png' alt='#' />
          </button>
        )}
        <h3>Описание: {votingInfo?.description}</h3>
        <p>
          ID голосования: {voting?.id.toString().slice(0, 8)}...
          <a onClick={copyProposeId} className='copyButton'>
            Копировать
          </a>
        </p>
        Создатель:{" "}
        <button className='copyButton' onClick={copyUserAddress}>
          {name}
        </button>
        <p>Выполнено: {voting?.executed ? "Да" : "Нет"}</p>
        <p>Голоса за: {votingInfo?.votesFor}</p>
        <p>Голоса против: {votingInfo?.votesAgainst}</p>
        <p>Статус голосования: {votingStatus[votingInfo?.status]}</p>
        <div>
          <h3 style={{ marginTop: "15px" }}>Обратный таймер</h3>
          <p className='votingTimer'>
            {seconds == 0 && minutes == 0
              ? "Время завершилось!"
              : `${minutes ? minutes + ":" : ""}${seconds < 10 ? "0" : ""}${seconds}`}
          </p>
          {seconds == 0 && minutes == 0 && user.name == name && (
            <Button style={{ display: "flex" }} variant='secondary' onClick={executeProposal}>
              Инициализировать
            </Button>
          )}
        </div>
      </div>
    );
}
