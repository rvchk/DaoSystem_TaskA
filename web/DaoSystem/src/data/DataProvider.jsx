import { createContext, useContext, useState, useEffect } from "react";
import contractABI from "../data/contractData/daoSystem/daoABI.json";
import { daoByteCode } from "../data/contractData/daoSystem/daoByteCode";
import SmartContract from "../transactions/SmartContract";
import Web3 from "web3";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [factory, setFactory] = useState();
  const [smartContract, setSmartContract] = useState();
  const [user, setUser] = useState();
  const selectedAccount = localStorage.getItem("selectedAcc") || "";
  const ownerAddress = "0xD6f9EDa37aC1445755F3ec3c5Fa51660Ca40678C";
  const otherContractAddress = "0x9017C521b6Fd18f1cfB1c90fBdaa43fA55CFCF78"; // замените на нужный адрес

  useEffect(() => {
    initializeContract();
  }, []);

  async function initializeContract() {
    try {
      if (!localStorage.getItem("contractId")) {
        await handleDeploy();
      } else {
        await handleContract();
      }
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  async function handleDeploy() {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI);
    
    const deployedTransaction = contract.deploy({
      data: daoByteCode,
      arguments: [otherContractAddress]
    });
    
    const gasPrice = await web3.eth.getGasPrice();
    const options = {
      from: ownerAddress,
      gas: "9986871",
      gasPrice: gasPrice.toString()
    };
    
    const deployedContract = await deployedTransaction.send(options);
    localStorage.setItem("contractId", deployedContract.options.address);
    
    // После деплоя сразу инициализируем контракт
    await handleContract();
  }

  async function handleContract() {
    const web3 = new Web3(window.ethereum);
    const contractAddress = localStorage.getItem("contractId");
    
    if (!contractAddress) {
      console.error("No contract address found");
      return;
    }

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    setFactory(contract);
    
    // Сразу создаем SmartContract экземпляр
    if (selectedAccount) {
      const smartContractTemp = new SmartContract(selectedAccount, contract);
      setSmartContract(smartContractTemp);
      await getUser(smartContractTemp);
    }
  }

  useEffect(() => {
    // Обновляем smartContract при изменении selectedAccount или factory
    if (selectedAccount && factory) {
      const smartContractTemp = new SmartContract(selectedAccount, factory);
      setSmartContract(smartContractTemp);
      getUser(smartContractTemp);
    }
  }, [selectedAccount, factory]);

  const getUser = async (smartContractInstance) => {
    if (!smartContractInstance || !selectedAccount) {
      console.error("SmartContract instance or selectedAccount is undefined");
      return;
    }

    try {
      const currentUser = await smartContractInstance.getUserObject(selectedAccount);
      setUser(currentUser);
    } catch (error) {
      console.error("Error getting user:", error);
    }
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