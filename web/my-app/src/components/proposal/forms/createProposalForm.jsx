import { useState, useRef } from "react";
import { Button } from "react-bootstrap";
import { useData } from "../../../data/DataProvider";

export default function CreateProposalForm() {
  const [quorumType, setQuorumType] = useState(0);
  const [currentPropose, setCurrentPropose] = useState("default");
  const { smartContract } = useData();

  const descriptionRef = useRef();
  const addressRef = useRef();
  const amountRef = useRef();

  const handleChangeProposeCreation = (event) => {
    setCurrentPropose(event.target.value);
  };

  const createPropose = async (event) => {
    event.preventDefault();
    let amount = 0;
    if (currentPropose == "default") {
      alert("Выберите тип предложения");
      return;
    }
    if (
      !descriptionRef.current.value ||
      !addressRef.current.value ||
      amount < 0
    ) {
      alert("Заполните все поля");
      return;
    }
    if (currentPropose != "2" && currentPropose != "3") {
      amount = amountRef.current.value;
    }

    await smartContract.createPropose(
      currentPropose,
      descriptionRef.current.value,
      quorumType || 2,
      addressRef.current.value,
      amount,
    );
    descriptionRef.current.value = "";
    addressRef.current.value = "";
    location.reload();
  };

  return (
    <>
      <h2>Создание предложения</h2>
      <select value={currentPropose} onChange={handleChangeProposeCreation}>
        <option value="default" disabled>
          Выбрать тип предложения
        </option>
        <option value="0">Новые инвестиции</option>
        <option value="1">Инвестировать</option>
        <option value="2">Добавить пользователя</option>
        <option value="3">Исключить пользователя</option>
        <option value="4">Изменить токен wrap</option>
      </select>

      <input
        type="text"
        placeholder="Описание предложения"
        ref={descriptionRef}
      />
      <input type="test" placeholder="Нужный адрес" ref={addressRef} />
      {currentPropose != 2 && currentPropose != 3 && (
        <input type="number" placeholder="Нужное количество" ref={amountRef} />
      )}
      {currentPropose != 0 && currentPropose != 1 && (
        <div style={{ marginBottom: "15px" }}>
          <span>Тип кворума: </span>
          <select
            value={quorumType}
            onChange={(e) => setQuorumType(e.target.value)}
          >
            <option value="0">50% + 1</option>
            <option value="1">2/3</option>
          </select>
        </div>
      )}
      <Button variant="secondary" onClick={createPropose}>
        Создать
      </Button>
    </>
  );
}
