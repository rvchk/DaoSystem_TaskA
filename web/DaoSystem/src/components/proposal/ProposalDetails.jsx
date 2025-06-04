import { useCallback, useEffect, useState } from "react";
import { useData } from "../../data/DataProvider";

export const ProposalDetails = ({ proposal }) => {
  const [user, setUser] = useState();
  const { smartContract } = useData();

  const getUser = useCallback(async () => {
    const user = await smartContract.getUserObject(proposal.targetAddress);
    setUser(user);
  }, [proposal.targetAddress, smartContract]);

  const copyUserAddress = () => {
    navigator.clipboard.writeText(proposal.targetAddress);
    alert("Адрес пользователя скопирован");
  };

  useEffect(() => {
    if (smartContract) {
      getUser();
    }
  }, [smartContract, getUser]);

  return (
    <div className="proposal-details">
      {(proposal.proposalType == "0" || proposal.proposalType == "1") && (
        <div>
          <p>Количество инвестиций: {proposal.targetAmount} ETH</p>
          <span>
            Адрес: {proposal.targetAddress.toString().slice(0, 8)}...
            <a onClick={copyUserAddress} className="copyButton">
              Копировать
            </a>
          </span>
        </div>
      )}
      {proposal.proposalType == "2" ||
        (proposal.proposalType == "3" && (
          <>
            <p>
              Имя пользователя: <strong>{user?.name}</strong>
            </p>
            <span>
              Адрес: {proposal.targetAddress.toString().slice(0, 8)}...
              <a onClick={copyUserAddress} className="copyButton">
                Копировать
              </a>
            </span>
          </>
        ))}
      {proposal.proposalType == "4" && (
        <div>
          <p>Адрес токена: {proposal.targetAddress}</p>
          <p>
            Новая цена: <strong>{proposal.targetAmount}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
