import { useState } from 'react';
import './App.css';

import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [page, setPage] = useState("start");
  const [gameResult, setGameResult] = useState({ winner: '', time: '' });

  const handleEndGame = (result) => {
    setGameResult(result);
    setPage("results");
  };

  const handleRestart = () => {
    setPage("start");
  };

  return (
    <div className="container mt-5">
      {page === "start" && <StartPage onStart={() => setPage("game")} />}
      {page === "game" && <GamePage onEnd={handleEndGame} />}
      {page === "results" && (
        <ResultsPage
          onRestart={handleRestart}
          winner={gameResult.winner}
          time={gameResult.time}
        />
      )}
    </div>
  );
}

export default App;