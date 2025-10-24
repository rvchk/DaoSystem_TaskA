import { useState, useEffect } from "react";
import { useData } from "../../data/DataProvider";
import { Link } from "react-router-dom";

export const UserInfo = () => {
  const { smartContract, selectedAccount, user } = useData();
  const [balance, setBalance] = useState({
    profi: 0,
    wrap: 0
  })
  
  async function getUserBalance() {
    const balance = await smartContract.getUserBalance(selectedAccount);
    setBalance({
      profi: balance.profi || 0,
      wrap: balance.wrap || 0
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
        <p>Wrap: {balance.wrap}</p>
      </div>
    </div>
  );
};
