import { ProposalDetails } from "./ProposalDetails";
import { useData } from "../../data/DataProvider";
import { CloseButton } from "react-bootstrap";

export default function ProposalCard({ proposal }) {
  const { smartContract, user } = useData();
  console.log(proposal);

  const deleteProposal = async () => {
    await smartContract.deleteProposal(proposal.id);
    location.reload();
  };

  const copyProposeId = () => {
    navigator.clipboard.writeText(proposal.id);
  };

  const proposalTypes = [
    "Добавление новых инвестиций",
    "Добавление инвестиций",
    "Добавление пользователя",
    "Исключение пользователя",
    "Изменение токена Wrap"
  ];

  return (
    <div className='ProposalCard'>
      <h3 className="d-flex align-items-center justify-content-between">
        {proposalTypes[proposal?.proposalType]}
        <CloseButton className='right' onClick={deleteProposal} />
      </h3>
      <p>Описание: {proposal?.description}</p>
      {proposal?.onVoting && <p>На голосовании</p>}
      <p>Выполнено: {proposal?.executed ? <p>Да</p> : <p>Нет</p>}</p>
      <span>
        ID: {proposal.id.toString().slice(0, 8)}...
        <a onClick={copyProposeId} className='copyButton'>
          Копировать
        </a>
      </span>
      <div>
        <p>
          Создатель: <strong>{user?.name}</strong>
        </p>
      </div>
      <ProposalDetails proposal={proposal} />
    </div>
  );
}
