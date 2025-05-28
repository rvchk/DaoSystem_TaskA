import backArrow from "/back.png"

export const GoBackButton = () => {

    const returnToPrev = () => {
        window.history.go(-1);
    }

    return (
        <button className="backButton" onClick={returnToPrev}>
            <img src={backArrow} alt="backArrow" />
        </button>
    )
}