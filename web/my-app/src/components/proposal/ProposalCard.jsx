import React, { useEffect, useState } from 'react'
import { ProposalDetails } from "./ProposalDetails"
import { useData } from '../../data/DataProvider'

export default function ProposalCard({ proposal }) {
  const { smartContract } = useData()
  const [name, setName] = useState()
  const copyProposeId = () => {
    navigator.clipboard.writeText(proposal.id)
    alert("ID предложения скопирован")
  }

  const getUserName = async () => {
    const user = await smartContract.getUserObject(proposal.creator)
    setName(user.name)
  }

  const proposalTypes = [
    "Новые инвестиции",
    "Добавление инвестиций",
    "Добавить пользователя",
    "Исключить пользователя",
    "Изменить токен wrap"
  ]

  useEffect(() => {
    if (smartContract) {
      getUserName()
    }
  }, [smartContract])

  return (
    <div className='ProposalCard'>
      <h3>Описание: {proposal.description}</h3>
      <span>
        ID предложения: {proposal.id.toString().slice(0, 8)}...
        <a onClick={copyProposeId} className='copyButton'>Копировать</a>
      </span>
      <p>Создатель: {name}</p>
      <p>Выполнено: {proposal.executed ? "Да" : "Нет"}</p>
      <p>Тип предложения: {proposalTypes[proposal.proposalType]}</p>
      <ProposalDetails proposal={proposal} />
    </div>
  )
}
