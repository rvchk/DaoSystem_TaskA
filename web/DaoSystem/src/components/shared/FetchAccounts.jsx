import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FetchAccounts() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("selectedAcc")) {
      window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        localStorage.setItem("selectedAcc", accounts[0]);
        location.reload();
      });
    }
  }, []);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      localStorage.setItem("selectedAcc", accounts[0]);
      location.reload();
    });
  }, []);

  const navigateToMain = () => {
    navigate("/");
  };

  return (
    <Button variant="outline-secondary" onClick={navigateToMain} className="fetchAccountsBar">
      Профессионалы 2025 | Ровчак Матвей Сергеевич
    </Button>
  );
}
