import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useData } from '../../data/DataProvider'
import { Button } from 'react-bootstrap'

export default function VotingCard({ voting, showAll }) {
  const [name, setName] = useState()
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const [votingInfo, setVotingInfo] = useState()
  const { smartContract } = useData()

  async function getUser() {
    const user = await smartContract.getUserObject(voting.initiator)
    setName(user.name)
  }

  const votingStatus = [
    "Ожидает начала",
    "Не принято",
    "Принято",
    "Активно",
    "Удалено",
  ]

  const getVotings = async () => {
    const votingInfo = await smartContract.getVotes(voting.id)
    console.log(votingInfo)
    setVotingInfo(votingInfo)
  }

  async function test() {
    await smartContract.executeProposal(voting.id, voting.initiator)
  }

  useEffect(() => {
    if (smartContract) {
      getUser()
      getVotings()
    }

    const interval = setInterval(async () => {
      const time = Date.now();
      let timeLeft = String(voting.endTime) - time.toString().slice(0, 10)
      setMinutes(Math.floor(timeLeft / 60))
      setSeconds(timeLeft % 60)
      if (timeLeft <= 0) {
        clearInterval(interval)
        setMinutes(0)
        setSeconds(0)
        // if (!showAll) {
        //   setVotingInfo((prev) => prev.status = 1)
        // }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [smartContract]);

  const copyProposeId = () => {
    navigator.clipboard.writeText(voting?.id)
    alert("ID предложения скопирован")
  }

  const copyUserAddress = () => {
    navigator.clipboard.writeText(voting.initiator)
    alert("Адрес пользователя скопирован")
  }

  if (votingInfo?.status == 3) return (
    <div className='ProposalCard'>
      <Button variant="secondary" onClick={test}>Инициализировать</Button>
      <h3>Описание: {votingInfo?.description}</h3>
      <p>
        ID голосования: {voting?.id.toString().slice(0, 8)}
        ...
        <a onClick={copyProposeId} className='copyButton'>Копировать</a>
      </p>

      Создатель: <button className='copyButton' onClick={copyUserAddress}>{name}</button>
      <p>Выполнено: {voting?.executed ? "Да" : "Нет"}</p>
      <p>Голоса за: {votingInfo?.votesFor}</p>
      <p>Голоса против: {votingInfo?.votesAgainst}</p>
      <p>Статус голосования: {votingStatus[voting?.votingStatus]}</p>

      <div>
        <h3 style={{ marginTop: "15px" }}>Обратный таймер</h3>
        {(seconds == 0 && minutes == 0) ? (
          <p>Время завершилось!</p>
        ) : (
          <p>{`${minutes ? minutes + ":" : ""}${seconds < 10 ? '0' : ''}${seconds}`}</p>
        )}
      </div>
    </div >
  )
}