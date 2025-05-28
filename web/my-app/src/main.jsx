import { createRoot } from 'react-dom/client'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { DataProvider } from './data/DataProvider.jsx'
import './index.css'
import App from './App.jsx'
import Voting from './pages/Voting.jsx'
import Profile from './pages/Profile.jsx'
import Propose from './pages/Propose.jsx'
import AcceptedProposals from './pages/acceptedProposals.jsx'

createRoot(document.getElementById('root')).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        <Route path='*' Component={App} />
        <Route path='/' Component={App} />
        <Route path='/voting' Component={Voting} />
        <Route path='/profile' Component={Profile} />
        <Route path='/propose' Component={Propose} />
        <Route path='/acceptedProposals' Component={AcceptedProposals} />
      </Routes>
    </BrowserRouter>
  </DataProvider>,
)
