import { useData } from './data/DataProvider'
import FetchAccounts from "./components/FetchAccounts"
import { Link } from 'react-router-dom'
import { GoBackButton } from './components/goBackButton'

function App() {
  const { user } = useData()

  return (
    <div>
      <h1>Интерфейс приложения</h1>
      <div className="links">
        <Link className='routeLink' to="/profile">Профиль {user?.name}</Link>
        <Link className='routeLink' to="/voting">Голосования</Link>
        <Link className='routeLink' to="/votings">Все голосования</Link>
        <Link className='routeLink' to="/propose">Предложения</Link>
      </div>
      <p>Изменение аккаунтов происходит через МетаМаск</p>
      <FetchAccounts />
    </div>
  )
}

export default App