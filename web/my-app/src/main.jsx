import { createRoot } from 'react-dom/client'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { DataProvider } from './data/DataProvider.jsx'
import './index.css'
import App from './App.jsx'
import Voting from './pages/Voting.jsx'
import Profile from './pages/Profile.jsx'
import Propose from './pages/Propose.jsx'
import AcceptedProposals from './pages/acceptedProposals.jsx'

const routes = [
  { path: '/', component: App },
  { path: '/voting', component: Voting },
  { path: '/profile', component: Profile },
  { path: '/propose', component: Propose },
  { path: '/acceptedProposals', component: AcceptedProposals },
  { path: '*', component: App }
];

createRoot(document.getElementById('root')).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} Component={route.component}/>
        ))}
      </Routes>
    </BrowserRouter>
  </DataProvider>,
)
