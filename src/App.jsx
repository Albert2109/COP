import { useState } from 'react';
import GameSettingsProvider from './context/GameSettingsProvider';
import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/GameSettingsForm';
import ResultsPage from './pages/ResultsPage';
import './App.css';

const loadHistory = () => {
  const saved = localStorage.getItem('gameSessionHistory');
  return saved ? JSON.parse(saved) : [];
};

function App() {
  const [page, setPage] = useState('start');
  const [gameSettings, setGameSettings] = useState(null);
  

  const [history, setHistory] = useState(loadHistory);
  

  const [lockedMode, setLockedMode] = useState(
    history.length > 0 ? history[0].mode : null
  );
  const handleStartClick = () => {
    setHistory([]);
    setLockedMode(null);
    setGameSettings(null); 
    localStorage.removeItem('gameSessionHistory');
    
    setPage('settings'); 
  };


  const handleSettingsSubmit = (settings) => {

    if (!lockedMode) {
      setLockedMode(settings.mode);
    }
    

    setGameSettings({ ...settings, mode: lockedMode || settings.mode });
    setPage('game');
  };


  const addGameToHistory = (result) => {
    const gameResult = {
      ...result,
      id: new Date().toISOString(),
      mode: gameSettings.mode,
      botLevel: gameSettings.LevelBot,
    };
    

    const newHistory = [gameResult, ...history];
    setHistory(newHistory);
    localStorage.setItem('gameSessionHistory', JSON.stringify(newHistory));
  };

  const handleGoToSettings = () => {
    setPage('settings'); 
  };

  const handleGoToResults = () => {
    setPage('results'); 
  };

  const handleRestart = () => {
    setPage('start');
  };

  return (
    <GameSettingsProvider>
      <div className="container mt-5">
        {page === 'start' && <StartPage onStart={handleStartClick} />}

        {page === 'settings' && (
          <GameSettingsForm 
            onSubmit={handleSettingsSubmit} 
            lockedMode={lockedMode} 
            currentSettings={gameSettings}
          />
        )}

        {page === 'game' && gameSettings && (
          <GamePage 
            settings={gameSettings} 
            onGoToSettings={handleGoToSettings}
            onGoToResults={handleGoToResults}
            onGameFinished={addGameToHistory} 
          />
        )}
        
        {page === 'results' && (
          <ResultsPage
            history={history}
            onRestart={handleRestart}
          />
        )}
      </div>
    </GameSettingsProvider>
  );
}

export default App;