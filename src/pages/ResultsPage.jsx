import ResultInfo from "../components/ResultInfo";
export default function ResultsPage({ onRestart, winner, time }) {
  return (
    <>
      <div className="alert alert-info text-center">
        <h2>Гра закінчилась</h2>
      <ResultInfo winner={winner} time={time} />
      </div>
      <div className="text-center">
        <button className="btn btn-primary btn-lg" onClick={onRestart}>
          Почати заново
        </button>
      </div>
    </>
  );
}