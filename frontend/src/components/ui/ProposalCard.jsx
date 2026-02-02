import { Card, Badge, Button } from 'react-bootstrap'
import { useData } from '../useData';
import { useState } from 'react';
import CastVote from './CastVote';

export default function ProposalCard({ proposal }) {
  const { account, smartContract } = useData()
  const [showModal, setShowModal] = useState(false)

  const isProposalCreator = proposal.proposer.toLowerCase() === account?.toLowerCase();
  const TYPES = ['Инвестиции в стартап', 'Добавить инвестиции', 'Добавить участника', 'Удалить участника', 'Управление токеном', 'Системный токен'];
  const QUORUM = ['Простое большинство', 'Супер большинство', 'Токенами'];
  const STATES = ['Ожидает', 'Активно', 'Отменено', 'Провалено', 'Успешно', 'В очереди', 'Истекло', 'Исполнено'];

  const deleteProposal = async () => {
    await smartContract.closeVoting(proposal.id)
  }
  const executeProposal = async () => {
    await smartContract.executeProposal(proposal.id)
  }

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between">
            <span>{proposal.description}</span>
            <Badge bg="secondary">Тип: {TYPES[proposal.proposalType]}</Badge>
          </Card.Title>

          <div className="mb-2">
            <small className="text-muted">От:</small>
            <div>{proposal.proposer}</div>
          </div>

          <div className="mb-2">
            <small className="text-muted">Для адреса:</small>
            <div>{proposal.targetAddress}</div>
          </div>

          <div className="row mb-2">
            <div className="col">
              <small className="text-muted">Сумма:</small>
              <div>{Number(proposal.targetAmount)}</div>
            </div>
            <div className="col">
              <small className="text-muted">Кворум:</small>
              <div>{QUORUM[proposal.quorumType]}</div>
            </div>
            <div className="col">
              <small className="text-muted">До:</small>
              <div>{new Date(Number(proposal.endTime) * 1000).toLocaleTimeString('ru-RU').slice(0, -3)}</div>
            </div>
          </div>

          <small>Статус:</small> {STATES[proposal.state]}

          <div className="d-flex justify-content-between">
            <div>
              <Badge bg="success" className="me-2">
                За: {Number(proposal.votesFor)}
              </Badge>
              <Badge bg="danger">
                Против: {Number(proposal.votesAgainst)}
              </Badge>
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
        {proposal.state == 1 && isProposalCreator && (
          <Button onClick={deleteProposal} variant="danger">
            Удалить
          </Button>
        )}
        {proposal.state == 1 && (
          <Button onClick={() => setShowModal(true)} variant="primary">
            Проголосовать
          </Button>
        )}
        {proposal.state == 4 && isProposalCreator && (
          <Button onClick={executeProposal} variant="success">
            Исполнить
          </Button>
        )}
      </Card.Footer>
      </Card>
      <CastVote id={proposal.id} show={showModal} onClose={() => setShowModal(false)}/>
    </>
  )
}