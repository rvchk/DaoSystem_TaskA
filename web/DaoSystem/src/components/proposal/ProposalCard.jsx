import { ProposalDetails } from "./ProposalDetails";
import { useData } from "../../data/DataProvider";

export default function ProposalCard({ proposal }) {
  const { smartContract, user } = useData();

  const deleteProposal = async () => {
    await smartContract.deleteProposal(proposal.id);
    location.reload();
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
      <button className='deleteIcon' onClick={deleteProposal}>
        <img src='/delete-icon.png' alt='#' />
      </button>
      <h3>{proposalTypes[proposal?.proposalType]}</h3>
      <p>Описание: {proposal?.description}</p>
      {proposal?.onVoting && <p>На голосовании</p>}
      {proposal?.executed && <p>Выполнено</p>}
      <span>ID: {proposal?.id}</span>
      <div>
        <p>
          Создатель: <strong>{user?.name}</strong>
        </p>
      </div>
      <ProposalDetails proposal={proposal} />
    </div>
  );
}
