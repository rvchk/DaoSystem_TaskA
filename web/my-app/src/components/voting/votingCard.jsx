import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useData } from '../../data/DataProvider'

export default function VotingCard({ voting }) {
  const [name, setName] = useState()
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const { smartContract } = useData()

  async function getUser() {
    const user = await smartContract.getUserObject(voting.initiator)
    setName(user.name)
  }

  useEffect(() => {
    if (smartContract) {
      getUser()
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

  return (
    <div className='ProposalCard'>
      <h3>Описание: {voting.description}</h3>
      <p>
        ID голосования: {voting?.id.toString().slice(0, 8)}
        ...
        <a onClick={copyProposeId} className='copyButton'>Копировать</a>
      </p>

      Создатель: <button className='copyButton' onClick={copyUserAddress}>{name}</button>
      <p>Выполнено: {voting?.executed ? "Да" : "Нет"}</p>
      <p>Голоса за: {voting?.votesFor}</p>
      <p>Голоса против: {voting?.votesFor}</p>
      <p>Статус голосования: {voting?.votingStatus}</p>

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