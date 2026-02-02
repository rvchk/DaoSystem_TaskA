import { Link } from "react-router"
import { routes } from "./main"
import { Button } from "react-bootstrap"
import { useState } from "react"
import CreateProposal from "./components/ui/CreateProposal"

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <h1>Интерфейс DaoSystem</h1>
      {routes.map((route, index) => (
        route.title && <Link to={route.path} key={index}>
          <Button variant="primary" style={{ margin: "5px" }}>
            {route.title}
          </Button>
        </Link>
      ))}

      <Button onClick={() => setShowModal(true)} variant="primary" style={{ margin: "5px" }}>
        Создать предложение
      </Button>
      <CreateProposal show={showModal} onClose={() => setShowModal(false)}/>

      <p>Изменение аккаунтон через МетаМаск</p>
    </>
  )
}

export default App
