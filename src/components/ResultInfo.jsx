
export default function ResultInfo({winner,time}){
    return(
        <>
         <p className="fs-3">Гра закінчилась</p>
      <p className="fs-3">Переміг:{winner}</p>
      <p className="fs-3">Час гри:{time}</p>
        </>
    )
}