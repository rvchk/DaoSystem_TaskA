import React, { useEffect, useState } from 'react'
import { useData } from '../../data/DataProvider'

export default function VotingCard({ voting }) {
  const [name, setName] = useState()
  const { smartContract } = useData()
  const [currentTime, setCurrentTime] = useState(null);

  async function getUser() {
    const user = await smartContract.getUserObject(voting.initiator)
    setName(user.name)
  }

  useEffect(() => {
    if (smartContract) {
      getUser()
    }
  }, [smartContract])

  const copyProposeId = () => {
    navigator.clipboard.writeText(voting?.id)
    alert("ID предложения скопирован")
  }

  const copyUserAddress = () => {
    navigator.clipboard.writeText(voting.initiator)
    alert("Адрес пользователя скопирован")
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const time = Date.now();
      setCurrentTime(time);
    }, 1000);
    return () => clearInterval(interval);
  }, [smartContract]);

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
      <p>{currentTime?.toString().slice(0, 10)}</p>
      <p>{voting?.endTime}</p>
    </div >
  )
}