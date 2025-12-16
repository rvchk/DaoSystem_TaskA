import { useState, useEffect } from "react";
import { useData } from "../../data/DataProvider";
import { Link } from "react-router-dom";

export const UserInfo = () => {
  const { smartContract, selectedAccount, user } = useData();
  const [balance, setBalance] = useState({
    profi: 0,
    rtk: 0
  })
  
  async function getUserBalance() {
    const balance = await smartContract.getUserBalance(selectedAccount);
    setBalance({
      profi: String(balance.profi).slice(0, -12) || 0,
      rtk: String(balance.rtk).slice(0, -12) || 0
    });
  }

  useEffect(() => {
    if (smartContract) {
      getUserBalance();
    }
  }, [smartContract, selectedAccount]);

  return (
    <div className='userInfoBlock'>
      <Link to={"/profile"} className='userInfoName'>
        {user?.name}
      </Link>
      <div className='userInfoBalances'>
        <p>Profi: {balance.profi}</p>
        <p>RTK: {balance.rtk}</p>
      </div>
    </div>
  );
};
