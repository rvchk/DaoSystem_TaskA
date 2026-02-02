import { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useData } from '../useData'

export default function CreateProposal({ show, onClose }) {
  const { smartContract } = useData()
  console.log(smartContract)
  const [type, setType] = useState("0")

  const desc = useRef()
  const quorumType = useRef()
  const targetAddress = useRef()
  const amount = useRef()
  const votingTime = useRef()

  const createProposal = async () => {
    await smartContract.createProposal(
      desc.current.value, 
      quorumType.current?.value || "2",
      type,
      targetAddress.current.value, 
      amount.current.value, 
      votingTime.current.value
    )
    targetAddress.current.value = ""
    amount.current.value = ""
    votingTime.current.value  = ""

    location.reload()
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton><h5>Новое предложение</h5></Modal.Header>
      <Modal.Body>
        <Form.Control className="mb-2" placeholder="Описание" ref={desc} />

        <Form.Select className="mb-2" value={type} onChange={e => setType(e.target.value)}>
          <option value="0">Новые инвестиции</option>
          <option value="1">Добавить инвестиций</option>
          <option value="2">Добавить пользователя</option>
          <option value="3">Исключить пользователя</option>
          <option value="4">Изменить Врап</option>
          <option value="5">Изменить Профи</option>
        </Form.Select>

        {type > 1 && (
          <Form.Select className="mb-2" ref={quorumType} required>
            <option value="0">Простое большинство</option>
            <option value="1">Супер большинство</option>
          </Form.Select>
        )}

        <Form.Control className="mb-2" placeholder="Адрес" ref={targetAddress} />
        <Form.Control className="mb-2" type="number" placeholder="Сумма" ref={amount} />
        <Form.Control type="number" placeholder="Голосование в минутах" ref={votingTime} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={createProposal}>Создать</Button>
      </Modal.Footer>
    </Modal>
  )
}
