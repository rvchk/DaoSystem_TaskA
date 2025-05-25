import React from 'react'
import VotingCard from './votingCard'

export default function AllCurrentVotings({ votings }) {
  return (
    <div className='AllVotings'>
      {
        votings?.map((voting) => (
          <VotingCard voting={voting} key={voting.id} />
        ))
      }
    </div>
  )
}