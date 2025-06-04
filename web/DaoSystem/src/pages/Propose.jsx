import { useState, useEffect } from "react";
import { useData } from "../data/DataProvider";
import AllUserProposals from "../components/proposal/AllUserProposals";
import FetchAccounts from "../components/shared/FetchAccounts";
import { GoBackButton } from "../components/shared/goBackButton";
import StartVotingForm from "../components/proposal/forms/startVotingForm";
import CreateProposalForm from "../components/proposal/forms/createProposalForm";

function Propose() {
  const { smartContract, selectedAccount, user } = useData();
  const [userProposals, setUserProposals] = useState("");

  useEffect(() => {
    console.log(user?.status);
    if (user?.status != "1" && user?.status != undefined) {
      alert("Вы не участник DAO");
      window.history.go(-1);
    }
    if (smartContract) {
      fetchProposalDetails();
    }
  }, [smartContract, selectedAccount]);

  async function fetchProposalDetails() {
    let currentProposals = [];
    const pastProposals = await smartContract.getUserPastProposals();
    for (let i = 0; i < pastProposals.length; i++) {
      currentProposals.push(
        await smartContract.getProposalInfo(pastProposals[i].returnValues.id),
      );
    }
    const filteredProposals = currentProposals.filter(
      (proposal) => proposal.id != 0,
    );
    setUserProposals(filteredProposals);
  }

  return (
    <>
      <h1>Предложения</h1>
      <StartVotingForm />
      <CreateProposalForm />
      {userProposals.length > 0 && (
        <>
          <h2>Ваши предложения</h2>
          <AllUserProposals userProposals={userProposals} />
        </>
      )}
      <FetchAccounts />
      <GoBackButton />
    </>
  );
}

export default Propose;
