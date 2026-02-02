import { useEffect } from "react"
import { Button } from "react-bootstrap"

export default function FetchAccounts() {
  useEffect(() => {
    const saveAccount = (accounts) => {
      localStorage.setItem("currentAccount", accounts[0])
      location.reload()
    }

    if (!localStorage.getItem("currentAccount")) {
      window.ethereum.request({method: "eth_requestAccounts"}).then(saveAccount)
    }
    window.ethereum.on("accountsChanged", saveAccount)
    
  }, [])

  return (
    <Button style={{marginTop: "15px"}} variant="outline-dark">Ровчак Матвей Сергеевич | Профессионалы 2026</Button>
  )
}
