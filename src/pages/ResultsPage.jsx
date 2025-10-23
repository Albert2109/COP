export default function ResultsPage({ onRestart, winner, time }) {
  return (
    <>
      <div className="alert alert-info text-center">
        <h2>Гра закінчилась</h2>
        <p className="fs-4">Переміг: <strong>{winner}</strong></p>
        <p className="fs-4">Час гри: <strong>{time}</strong></p>
      </div>
      <div className="text-center">
        <button className="btn btn-primary btn-lg" onClick={onRestart}>
          Почати заново
        </button>
      </div>
    </>
  );
}