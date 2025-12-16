import { useCallback, useEffect, useState } from "react";
import { useData } from "../../data/DataProvider";
import { CardBody } from "react-bootstrap";

export const ProposalDetails = ({ proposal }) => {
  const { smartContract } = useData();
  const [user, setUser] = useState();

  const shortAddress = proposal.targetAddress.toString().slice(0, 8);

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
    <CardBody className='proposal-details'>
      {(proposal.proposalType == "0" || proposal.proposalType == "1") && (
        <div>
          <p>Количество инвестиций: {proposal.targetAmount} ETH</p>
          <span>
            Адрес: {shortAddress}...
            <a onClick={copyUserAddress} className='copyButton'>
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
              Адрес: {shortAddress}...
              <a onClick={copyUserAddress} className='copyButton'>
                Копировать
              </a>
            </span>
          </>
        ))}
      {proposal.proposalType == "4" && (
        <div>
          <p>
            Новая цена: <strong>{proposal.targetAmount}</strong>
          </p>
          <span>
            Адрес: {shortAddress}...
            <a onClick={copyUserAddress} className='copyButton'>
              Копировать
            </a>
          </span>
        </div>
      )}
    </CardBody>
  );
};
