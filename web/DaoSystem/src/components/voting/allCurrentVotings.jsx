import React from "react";
import VotingCard from "./votingCard";

export default function AllCurrentVotings({ votings, showAll }) {
  return (
    <div className="AllVotings">
      {votings?.map((voting) => (
        <VotingCard voting={voting} showAll={showAll} key={voting.id} />
      ))}
    </div>
  );
}
