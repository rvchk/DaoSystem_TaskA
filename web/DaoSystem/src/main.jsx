import { Route, Routes, BrowserRouter } from "react-router-dom";
import AcceptedProposals from "./pages/acceptedProposals.jsx";
import { DataProvider } from "./data/DataProvider.jsx";
import { createRoot } from "react-dom/client";
import Profile from "./pages/Profile.jsx";
import Propose from "./pages/Propose.jsx";
import Voting from "./pages/Voting.jsx";
import App from "./App.jsx";
import "./index.css";

const routes = [
  { path: "/", component: App },
  { path: "/voting", component: Voting },
  { path: "/profile", component: Profile },
  { path: "/propose", component: Propose },
  { path: "/acceptedProposals", component: AcceptedProposals },
  { path: "*", component: App }
];

createRoot(document.getElementById("root")).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} Component={route.component} />
        ))}
      </Routes>
    </BrowserRouter>
  </DataProvider>
);
