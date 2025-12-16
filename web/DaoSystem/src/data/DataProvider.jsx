import { createContext, useContext, useState, useEffect } from "react";
import contractABI from "../data/contractData/daoSystem/daoABI.json";
import tokenABI from "../data/contractData/token/tokenABI.json";
import { tokenByteCode } from "../data/contractData/token/tokenByteCode";
import { daoByteCode } from "../data/contractData/daoSystem/daoByteCode";
import SmartContract from "../transactions/SmartContract";
import Web3 from "web3";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [factory, setFactory] = useState();
  const [smartContract, setSmartContract] = useState();
  const [user, setUser] = useState();
  const selectedAccount = localStorage.getItem("selectedAcc") || "";
  const ownerAddress = "0xda82d8e188e355c380d77616b2b63b0267aa68ed";

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

  async function createContract(abi, bytecode, args) {
    const web3 = new Web3(window.ethereum);
    const tokenContract = new web3.eth.Contract(abi);

    const deployedTransaction = tokenContract.deploy({
      data: bytecode,
      arguments: args
    });

    const gasPrice = await web3.eth.getGasPrice();
    const options = {
      from: ownerAddress,
      gas: "9986871",
      gasPrice: gasPrice.toString()
    };

    const deployedContract = await deployedTransaction.send(options);
    return deployedContract.options.address
  }

  // Автодеплой двух контрактов, связанных между собой
  async function handleDeploy() {
    const tokenContract = await createContract(tokenABI, tokenByteCode, ["Test", "T", 10000])
    localStorage.setItem("tokenContract", tokenContract);

    setTimeout(async () => {
      const token = localStorage.getItem("tokenContract", tokenContract);
      const daoContract = await createContract(contractABI, daoByteCode, [token])

      localStorage.setItem("contractId", daoContract);
    }, 5000)

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
    const currentUser = await smartContractInstance.getUserObject(selectedAccount);
    console.log(currentUser)
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