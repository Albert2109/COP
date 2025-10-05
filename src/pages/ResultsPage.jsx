
import ResultInfo from "../components/ResultInfo";
export default function ResultsPage({ onRestart,winner,time }) {
  return (
    <>
      <ResultInfo winner={winner} time = {time}/>
      <button onClick={onRestart}>Почати заново</button>
    </>
  );
}
