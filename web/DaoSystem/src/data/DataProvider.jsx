import { createContext, useContext, useState, useEffect } from "react";
import contractABI from "./contractData/contractABI.json";
import { byteCode } from "./contractData/byteCode";
import SmartContract from "../transactions/SmartContract";
import Web3 from "web3";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [factory, setFactory] = useState();
  const [smartContract, setSmartContract] = useState();
  const [user, setUser] = useState();
  const selectedAccount = localStorage.getItem("selectedAcc") || "";
  const ownerAddress = "0xda82d8e188e355c380d77616B2b63b0267aA68eD";

  useEffect(() => {
    if (!localStorage.getItem("contractId")) {
      handleDeploy();
    }
    handleContract();
  }, []);

  async function handleDeploy() {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI);
    const deployedTransaction = contract.deploy({ data: byteCode });
    const gasPrice = await web3.eth.getGasPrice();
    const options = {
      from: ownerAddress,
      gas: "9986871",
      gasPrice: gasPrice.toString()
    };
    const deployedContract = await deployedTransaction.send(options);
    localStorage.setItem("contractId", deployedContract.options.address);
    location.reload();
  }

  function handleContract() {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI, localStorage.getItem("contractId"));
    setFactory(contract);
  }

  useEffect(() => {
    if (selectedAccount && factory) {
      const smartContractTemp = new SmartContract(selectedAccount, factory);
      setSmartContract(smartContractTemp);
      getUser(smartContractTemp);
    }
  }, [selectedAccount, factory]);

  const getUser = async (smartContract) => {
    const currentUser = await smartContract.getUserObject(selectedAccount);
    setUser(currentUser);
  };

  return (
    <DataContext.Provider
      value={{
        smartContract,
        selectedAccount,
        factory,
        user
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
