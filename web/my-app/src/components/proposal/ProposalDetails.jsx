import { useEffect, useState } from "react";
import { useData } from "../../data/DataProvider";

export const ProposalDetails = ({ proposal }) => {
  const [user, setUser] = useState()
  const { smartContract } = useData()
  async function getUser() {
    const user = await smartContract.getUserObject(proposal.targetAddress)
    setUser(user)
  }

  useEffect(() => {
    if (smartContract) {
      getUser()
    }
  }, [smartContract])

  return (
    <div className="proposal-details">
      {proposal.proposalType == "0" || proposal.proposalType == "1" && (
        <div>
          <p>Адрес стартапа: {proposal.targetAddress}</p>
          <p>Количество инвестиций: {proposal.targetAmount} ETH</p>
        </div>
      )}
      {proposal.proposalType == "2" || proposal.proposalType == "3" && (
        <>
          <p>Адрес пользователя: {proposal.targetAddress}</p>
          <p>Имя пользователя: {user?.name}</p>
        </>
      )}
      {proposal.proposalType == "4" && (
        <div>
          <p>Адрес токена: {proposal.targetAddress}</p>
          <p>Новая цена: {proposal.targetAmount}</p>
        </div>
      )}
    </div>
  );
};