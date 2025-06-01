import { useData } from "./data/DataProvider";
import FetchAccounts from "./components/shared/FetchAccounts";
import { Link } from "react-router-dom";

function App() {
  const { user } = useData();

  return (
    <div>
      <h1>Интерфейс приложения</h1>
      <div className="links">
        <Link className="routeLink" to="/profile">
          Профиль {user?.name}
        </Link>
        {user?.status == "1" && (
          <Link className="routeLink" to="/propose">
            Предложения
          </Link>
        )}
        <Link className="routeLink" to="/voting">
          Голосования
        </Link>
        <Link className="routeLink" to="/acceptedProposals">
          Журнал принятых решений
        </Link>
      </div>
      <p>Изменение аккаунтов происходит через МетаМаск</p>
      <FetchAccounts />
    </div>
  );
}

export default App;
