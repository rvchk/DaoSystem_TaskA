import { Badge, Button, Card, CardBody, CardHeader, CardText, CardTitle, Form, FormGroup, InputGroup } from "react-bootstrap"
import { useData } from "../components/useData"
import { useRef } from "react"

export default function Profile() {
  const { user, smartContract } = useData()

  const buyWrapExchange = useRef()
  const amount = useRef()
  const buyWrap = async () => {
    console.log(smartContract)

    if (buyWrapExchange.current.value == "profi") {
      await smartContract.buyWrapWithProfi(amount.current.value);
    } else await smartContract.buyWrapWithEth(amount.current.value);

    amount.current.value = ""
    location.reload()
  }

  return (
    <>
      <Card>
        <CardTitle>
          <h3>{user.name}</h3>
          <Badge bg={user.status == 0 ? "success" : "secondary"}>
            {user.status == 0 ? "Участник DAO" : "Не Участник DAO"}
          </Badge>
        </CardTitle>
        <CardBody>
          <h4>Профи: {user.profi}</h4>
          <h4>Врап: {user.rtk}</h4>
        </CardBody>
      </Card>

      <Form>
        <InputGroup>
          <Form.Select ref={buyWrapExchange}>
            <option value='profi'>За PROFI</option>
            <option value='eth'>За ETH</option>
          </Form.Select>
          <Form.Control placeholder="Введите число" required ref={amount} />
          <Button onClick={buyWrap}>Купить Wrap</Button>
        </InputGroup>
      </Form>
    </>
  )
}
