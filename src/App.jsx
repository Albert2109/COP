import { useState } from 'react';
import './App.css';

import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [page, setPage] = useState("start");

  return (
    <>  
      {page === "start" && <StartPage onStart={() => setPage("game")} />}
      {page === "game" && <GamePage onEnd={() => setPage("results")} />}
      {page === "results" && (
        <ResultsPage
          onRestart={() => setPage("start")}
          winner="Червоний"
          time="02:15"
        />
      )}
    </>
  );
}

export default App;
