import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useData } from '../data/DataProvider'
import AllUserProposals from '../components/proposal/AllUserProposals';
import FetchAccounts from '../components/shared/FetchAccounts';
import { GoBackButton } from '../components/shared/goBackButton';
import Background from './Background';

function Propose() {
  const { smartContract, selectedAccount, user } = useData()
  const [currentPropose, setCurrentPropose] = useState("default");
  const [userProposals, setUserProposals] = useState('')
  const [quorumType, setQuorumType] = useState(0)

  const descriptionRef = useRef()
  const addressRef = useRef()
  const amountRef = useRef()
  const proposeIdRef = useRef()
  const votingTimeRef = useRef()

  useEffect(() => {
    if (smartContract) {
      fetchProposalDetails()
    }
  }, [smartContract, selectedAccount])

  async function fetchProposalDetails() {
    let currentProposals = []
    const pastProposals = await smartContract.getUserPastProposals()
    for (let i = 0; i < pastProposals.length; i++) {
      currentProposals.push(await smartContract.getProposalInfo(pastProposals[i].returnValues.id))
    }
    const filteredProposals = currentProposals.filter(proposal => proposal.id != 0)
    setUserProposals(filteredProposals)
  }

  function timeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + seconds;
  }

  const handleChangeProposeCreation = (event) => {
    setCurrentPropose(event.target.value);
  };

  const createPropose = async (event) => {
    event.preventDefault();
    let amount = 0
    if (currentPropose == "default") {
      alert("Выберите тип предложения")
    }
    if (currentPropose != "2" && currentPropose != "3") {
      amount = amountRef.current.value
    }
    if (!descriptionRef.current.value || !addressRef.current.value) {
      alert("Заполните все поля")
    }

    smartContract.createPropose(
      currentPropose,
      descriptionRef.current.value,
      quorumType || 2,
      addressRef.current.value,
      amount
    )
    descriptionRef.current.value = ""
    addressRef.current.value = ""
    fetchProposalDetails()
  };

  const startVoting = () => {
    console.log(votingTimeRef.current.value)
    const timeForVoting = timeToSeconds(votingTimeRef.current.value)
    console.log(timeForVoting)
    try {
      smartContract.startVoting(
        proposeIdRef.current.value,
        timeForVoting
      )
      proposeIdRef.current.value = ""
      votingTimeRef.current.value = ""
      alert("Предложение на голосовании")
    } catch (e) {
      console.log(e)
      alert("Неправильное id предложения")
    }
  }

  return (
    <>
      <h1>Предложения</h1>
      <h2>Вынести на голосование</h2>
      <input type="text" placeholder='ID предложения' ref={proposeIdRef} />
      <input type='time' ref={votingTimeRef} />
      <button onClick={startVoting}>Вынести</button>

      <h2>Создание предложения</h2>
      <select value={currentPropose} onChange={handleChangeProposeCreation}>
        <option value="default" disabled>
          Выбрать тип предложения
        </option>
        <option value="0">Новые инвестиции</option>
        <option value="1">Инвестировать</option>
        <option value="2">Добавить пользователя</option>
        <option value="3">Исключить пользователя</option>
        <option value="4">Изменить токен wrap</option>
      </select>

      <input type="text" placeholder='Описание предложения' ref={descriptionRef} />
      <input type="test" placeholder='Нужный адрес' ref={addressRef} />
      {
        currentPropose != 2 && currentPropose != 3
        &&
        <input type="number" placeholder='Нужное количество' ref={amountRef} />
      }
      {
        currentPropose != 0 && currentPropose != 1
        &&
        (
          <div style={{ marginBottom: "15px" }}>
            <span>Тип кворума: </span>
            <select value={quorumType} onChange={e => setQuorumType(e.target.value)}>
              <option value="0">50% + 1</option>
              <option value="1">2/3</option>
            </select>
          </div>
        )
      }
      <button onClick={createPropose}>Создать</button>
      {
        userProposals.length > 0
        &&
        <>
          <h2>Ваши предложения</h2>
          <AllUserProposals userProposals={userProposals} />
        </>
      }
      <FetchAccounts />
      <GoBackButton />
      <Background />
    </>
  );
}

export default Propose;