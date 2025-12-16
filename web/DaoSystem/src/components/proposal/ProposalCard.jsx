import { Card } from "react-bootstrap";
import { useData } from "../../data/DataProvider";

export default function ProposalCard({ proposal }) {
  const { smartContract, user } = useData();

  const deleteProposal = async () => {
    await smartContract.deleteProposal(proposal.id);
    location.reload();
  };

  const copyText = (text, message) => {
    navigator.clipboard.writeText(text);
    alert(message || "Скопировано!");
  };

  const proposalTypes = [
    "Добавление новых инвестиций",
    "Добавление инвестиций",
    "Добавление пользователя",
    "Исключение пользователя",
    "Изменение токена Wrap"
  ];

  // Статусы из ProposalState
  const proposalStatuses = [
    "Ожидает",
    "Активно",
    "Отменено",
    "Отклонено",
    "Успешно",
    "В очереди",
    "Просрочено",
    "Выполнено"
  ];

  return (
    <Card>
      <h4>{proposalTypes[proposal?.proposalType]}</h4>

      <span>
        ID: {proposal.id.toString().slice(0, 8)}...
        <strong onClick={() => copyText(proposal.id, "ID скопирован")}>
          Копировать
        </strong>
      </span>

      <span>Статус: {proposalStatuses[proposal?.status]}</span>

      <span>Описание: {proposal?.description}</span>

      {proposal?.onVoting && <span>Активно</span>}
      {proposal?.executed && <span>Выполнено</span>}

      <span>Создатель: {user?.name}</span>
      <span>
        Адрес создателя: {proposal?.proposer?.toString().slice(0, 8)}...
        <strong onClick={() => copyText(proposal?.proposer, "Адрес создателя скопирован")}>
          Копировать
        </strong>
      </span>

      <span>Голосов за: {proposal?.forVotes}</span>
      <span>Голосов против: {proposal?.againstVotes}</span>

      <span>Заданное кол-во: {proposal.targetAmount} ETH</span>
      <span>
        Заданный адрес: {proposal.targetAddress.toString().slice(0, 8)}...
        <strong onClick={() => copyText(proposal.targetAddress, "Адрес скопирован")}>
          Копировать
        </strong>
      </span>

      <span>Выполнено: {proposal?.executed ? 'Да' : 'Нет'}</span>

      {proposal?.proposer == user.userAddress && (
        <button onClick={deleteProposal}>Удалить</button>
      )}
    </Card>
  );
}