import React from 'react'
import ProposalCard from './ProposalCard'

export default function AllUserProposals({ userProposals }) {
  return (
    <div className='AllProposals'>
      {
        userProposals.map((proposal) => (
          <ProposalCard proposal={proposal} key={proposal.id} />
        ))
      }
    </div>
  )
}
