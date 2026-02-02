import FetchAccounts from './components/FetchAccounts.jsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import DataProvider from './components/DataProvider.jsx'
import AllProposals from './pages/AllProposals.jsx'
import { createRoot } from 'react-dom/client'
import Voting from './pages/Voting.jsx'
import Profile from './pages/Profile.jsx'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

export const routes = [
  { path: "*", component: App },
  { path: "/profile", component: Profile, title: "Профиль" },
  { path: "/voting", component: Voting, title: "Голосование" },
  { path: "/allProposals", component: AllProposals, title: "Журнал решений" }
]

createRoot(document.getElementById('root')).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} Component={route.component} />
        ))}
      </Routes>
      <FetchAccounts />
    </BrowserRouter>
  </DataProvider>
)
