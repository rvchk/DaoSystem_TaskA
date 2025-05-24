import { useEffect, useRef, useState } from "react"
import { useData } from "../data/DataProvider"
import FetchAccounts from "../components/FetchAccounts"
import { GoBackButton } from "../components/goBackButton"

export default function Profile() {
  const wrapAmountRef = useRef()
  const { smartContract, selectedAccount, user } = useData()
  const [profi, setProfi] = useState()

  useEffect(() => {
    if (smartContract) {
      getBalances()
    }
  }, [smartContract])

  async function getBalances() {
    const profiBalance = await smartContract.getBalanceProfi(selectedAccount)
    setProfi(profiBalance)
  }

  async function changeProfiToWrap() {
    const wrapAmount = wrapAmountRef.current.value
    if (!wrapAmount) {
      alert("Введите значение!")
      return
    }
    const result = await smartContract.buyWrapTokensByProfi(wrapAmount)
    location.reload()
    return result
  }

  async function changeEthToWrap() {
    const wrapAmount = wrapAmountRef.current.value
    if (!wrapAmount) {
      alert("Введите значение!")
      return
    }
    const result = await smartContract.buyWrapTokensByEth(wrapAmount)
    location.reload()
    return result
  }

  return (
    <>
      <h1>Профиль - {user?.name}</h1>
      <h2>Статус: {user?.status == 1 ? "Участник DAO" : "Не участник DAO"} </h2>
      <h2>Ваши Профи: {profi?.toString().slice(0, -12)}</h2>
      <h2>Ваши wrap: {user?.wrapTokenBalance}</h2>
      <h2>Купить wrap tokens</h2>
      <div>
        <input type="number" ref={wrapAmountRef} placeholder="Сколько wrap?" style={{ margin: "0 auto", marginBottom: "10px" }} />
        <button onClick={changeProfiToWrap}>Купить за PROFI</button >
        <button onClick={changeEthToWrap}>Купить за ETH</button >
      </div>
      <FetchAccounts />
      <GoBackButton />
    </>
  )
}