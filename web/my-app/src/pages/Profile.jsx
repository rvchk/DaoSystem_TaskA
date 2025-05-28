import { useEffect, useRef, useState } from "react"
import { useData } from "../data/DataProvider"
import FetchAccounts from "../components/shared/FetchAccounts"
import { GoBackButton } from "../components/shared/goBackButton"
import Button from 'react-bootstrap/Button';
import { Container, Form, Image, Stack } from "react-bootstrap";

export default function Profile() {
  const wrapAmountRef = useRef()
  const { smartContract, selectedAccount, user } = useData()
  const [selectedValue, setSelectedValue] = useState()
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

  const buyWrap = async () => {
    const amount = wrapAmountRef.current.value
    if (!amount) {
      alert("Введите значение!")
      return
    }
    
    if (selectedValue == "eth") {
      await smartContract.buyWrapTokensByEth(amount)
      location.reload()
    }
    else {
      await smartContract.buyWrapTokensByProfi(amount)
      location.reload()
    }
  }

  return (
    <>
      <Stack direction="horizontal" className="userCard">
        <Image src="/user.png" width={"150px"} />
        <Container>
          <h1>{user?.name}</h1>
          <h2>{user?.status == 1 ? "Участник DAO" : "Не участник DAO"} </h2>
          <h2>Профи: {profi?.toString().slice(0, -12)}</h2>
          <h2>Врап: {user?.wrapTokenBalance}</h2>
        </Container>
      </Stack>
      <h2>Купить врап токены</h2>
      <Stack direction="horizontal" gap={3}>
        <Form.Select aria-label="Default select example" onChange={(e) => setSelectedValue(e.target.value)}>
          <option value="profi">За PROFI</option>
          <option value="eth">За ETH</option>
        </Form.Select>
        <Form.Control className="me-auto" placeholder="Сколько врап?" ref={wrapAmountRef} />
        <Button variant="secondary" onClick={buyWrap}>Купить</Button>
      </Stack>
      <FetchAccounts />
      <GoBackButton />
    </>
  )
}