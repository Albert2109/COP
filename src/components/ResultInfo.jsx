
export default function ResultInfo({winner,time}){
    return(
        <>
         {winner === "Нічия"? (
            <p className="fs-4">Результат <strong>Нічия</strong> </p>
         ):(
            <p className="fs-4">Результат <strong>{winner}</strong> </p>
         )}
         <p className="fs-4">Час гри: <strong>{time}</strong></p>
        </>
    )
}