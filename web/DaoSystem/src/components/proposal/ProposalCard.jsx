import React, { useEffect, useState } from "react";
import { ProposalDetails } from "./ProposalDetails";
import { useData } from "../../data/DataProvider";

export default function ProposalCard({ proposal }) {
  const { smartContract } = useData();
  const [name, setName] = useState();
  const [proposalInfo, setProposalInfo] = useState();
  const copyProposeId = () => {
    navigator.clipboard.writeText(proposal.id);
    alert("ID предложения скопирован");
  };

  const getUserName = async () => {
    const user = await smartContract.getUserObject(proposal.proposer);
    setName(user.name);
  };

  const getProposalInfo = async () => {
    const proposalInfo = await smartContract.getProposalInfo(proposal.id);
    setProposalInfo(proposalInfo);
  };

  const deleteProposal = async () => {
    await smartContract.deleteProposal(proposal.id);
    getProposalInfo();
  };

  const proposalTypes = [
    "Добавление новых инвестиций",
    "Добавление инвестиций",
    "Добавление пользователя",
    "Исключение пользователя",
    "Изменение токена Wrap"
  ];

  useEffect(() => {
    if (smartContract) {
      getUserName();
      getProposalInfo();
    }
  }, [smartContract]);

  return (
    <>
      {proposalInfo?.votingId != 0 && (
        <div className='ProposalCard'>
          <button className='deleteIcon' onClick={deleteProposal}>
            <img src='/delete-icon.png' alt='#' />
          </button>
          <h3>{proposalTypes[proposal.proposalType]}</h3>
          <p>Описание: {proposal.description}</p>
          {proposalInfo?.onVoting && <p>На голосовании</p>}
          {proposal.executed && <p>Выполнено</p>}
          <span>
            ID: {proposal.id.toString().slice(0, 8)}...
            <a onClick={copyProposeId} className='copyButton'>
              Копировать
            </a>
          </span>
          <div>
            <p>
              Создатель: <strong>{name}</strong>
            </p>
          </div>
          <ProposalDetails proposal={proposal} />
        </div>
      )}
    </>
  );
}
