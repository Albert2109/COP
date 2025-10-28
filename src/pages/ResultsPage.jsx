import ResultInfo from "../components/ResultInfo";

export default function ResultsPage({ onRestart, history }) {
  
  if (!history || history.length === 0) {
    return (
      <>
        <div className="alert alert-info text-center">
          <h2>Історія сесії порожня</h2>
          <p>Результати з'являться тут, коли ви зіграєте партію.</p>
        </div>
        <div className="text-center">
          <button className="btn btn-primary btn-lg" onClick={onRestart}>
            На головну
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-4">
        <h2>Результати поточної сесії</h2>
        <p>Історія очиститься, коли ви почнете нову гру з головного меню.</p>
      </div>
      
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
        {history.map((game) => (
          <div key={game.id} className="alert alert-light border shadow-sm mb-3">
            <ResultInfo
              winner={game.winner}
              time={game.time}
              botLevel={game.botLevel}
              mode={game.mode}
            />
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <button className="btn btn-primary btn-lg" onClick={onRestart}>
          На головну
        </button>
      </div>
    </>
  );
}