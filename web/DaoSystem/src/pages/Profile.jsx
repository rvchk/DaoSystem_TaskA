import { useEffect, useState } from "react";
import { useData } from "../data/DataProvider";
import Button from "react-bootstrap/Button";
import { Container, Form, Image, InputGroup, Stack } from "react-bootstrap";

export default function Profile() {
  const { smartContract, selectedAccount, user } = useData();
  const [selectedValue, setSelectedValue] = useState();
  const [exchange, setExchange] = useState(0);
  const [currentAmount, setCurrentAmount] = useState("");
  const [balance, setBalance] = useState({
    profi: 0,
    wrap: 0
  })
  
  async function getUserBalance() {
    const balance = await smartContract.getUserBalance(selectedAccount);
    setBalance({
      profi: balance.profi || 0,
      wrap: balance.wrap || 0
    });
  }

  useEffect(() => {
    if (smartContract) {
      getUserBalance();
      getExchange();
    }
  }, [smartContract]);

  async function getExchange() {
    const result = await smartContract.getWrapExchange();
    setExchange(result);
  }

  const buyWrap = async () => {
    if (selectedValue == "eth") {
      await smartContract.buyWrapTokensByEth(currentAmount);
    } else {
      await smartContract.buyWrapTokensByProfi(currentAmount);
    }
    await getUserBalance()
  };

  return (
    <>
      <Stack direction='horizontal' className='userCard'>
        <Image src='/user.png' width={"150px"} />
        <Container>
          <h1>{user?.name}</h1>
          <h2>{user?.status == 1 ? "Участник DAO" : "Не участник DAO"} </h2>
          <h2>Профи: {balance.profi}</h2>
          <h2>Врап: {balance.wrap}</h2>
        </Container>
      </Stack>
      <h2>Купить врап токены</h2>
      <Stack direction='horizontal' gap={3}>
        <Form.Select style={{ width: "150px" }} onChange={(e) => setSelectedValue(e.target.value)}>
          <option value='profi'>За PROFI</option>
          <option value='eth'>За ETH</option>
        </Form.Select>
        <InputGroup>
          <InputGroup.Text>{currentAmount * Number(exchange)}</InputGroup.Text>
          <Form.Control
            placeholder='Сколько врап?'
            onChange={(e) => setCurrentAmount(e.target.value)}
            value={currentAmount}
            type='number'
            required
          />
          <InputGroup.Text>1/{exchange}</InputGroup.Text>
        </InputGroup>
        <Button variant='secondary' onClick={buyWrap}>
          Купить
        </Button>
      </Stack>
    </>
  );
}
