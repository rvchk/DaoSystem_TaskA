import { useState, useEffect } from "react";
import { useData } from "../../data/DataProvider";
import { Link } from "react-router-dom";

export const UserInfo = () => {
  const { smartContract, selectedAccount, user } = useData();
  const [profi, setProfi] = useState();

  async function getBalances() {
    const profiBalance = await smartContract.getBalanceProfi(selectedAccount);
    setProfi(profiBalance);
  }

  useEffect(() => {
    if (smartContract) {
      getBalances();
    }
  }, [smartContract, selectedAccount]);

  return (
    <div className='userInfoBlock'>
      <Link to={"/profile"} className='userInfoName'>
        {user?.name}
      </Link>
      <div className='userInfoBalances'>
        <p>Profi: {profi?.toString().slice(0, -12)}</p>
        <p>Wrap: {user?.wrapTokenBalance}</p>
      </div>
    </div>
  );
};
