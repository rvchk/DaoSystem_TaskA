import { createContext, useEffect } from 'react'
import { useState } from 'react'
import daoAbi from "../contractData/daoAbi"
import tokenAbi from "../contractData/tokenAbi"
import { daoBytecode } from "../contractData/daoBytecode"
import { tokenBytecode } from "../contractData/tokenBytecode"
import { createSmartContract } from './SmartContract'
import Web3 from 'web3'

export const DataContext = createContext()

export default function DataProvider({ children }) {
  const [user, setUser] = useState(null)
  const [smartContract, setSmartContract] = useState(null)
  const account = localStorage.getItem("currentAccount") || "";
  const address = localStorage.getItem("daoContract") || "";

  const createContract = async (abi, bytecode, args) => {
    const web3 = new Web3(window.ethereum)
    const contract = new web3.eth.Contract(abi)

    const deployTx = contract.deploy({
      data: bytecode,
      arguments: args
    })

    return await deployTx.send({
      from: account,
      gasPrice: await web3.eth.getGasPrice(),
      gas: await deployTx.estimateGas()
    })
  }

  const deployContract = async () => {
    const Professional = await createContract(tokenAbi, tokenBytecode, ["Professional", "PROFI", 100000])
    localStorage.setItem("tokenContract", Professional.options.address)

    setTimeout(async () => {
      const DaoSystem = await createContract(daoAbi, daoBytecode, [Professional.options.address])
      localStorage.setItem("daoContract", DaoSystem.options.address)
    }, 3000)

    await loadContract()
  }

  const loadContract = async () => {
    const web3 = new Web3(window.ethereum)
    const contract = new web3.eth.Contract(daoAbi, address)

    const smartContract = createSmartContract(account, contract)
    setSmartContract(smartContract)

    if (smartContract) {
      const userData = await smartContract.getUser(account)
      setUser(userData)
    }
  }

  useEffect(() => {
    address ? loadContract() : deployContract();
  }, []);

  return (
    <DataContext.Provider value={{
      user,
      smartContract,
      account
    }}>{children}</DataContext.Provider>
  )
}