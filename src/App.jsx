import { useState } from 'react';
import GameSettingsProvider from './context/GameSettingsProvider';
import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/GameSettingsForm';
import './App.css';

function App() {
  const [page, setPage] = useState('start');
  const [gameSettings, setGameSettings] = useState(null);

  const handleStartClick = () => {
    setPage('settings');
  };

  const handleSettingsSubmit = (settings) => {
    setGameSettings(settings);
    setPage('game');
  };

  const handleGameEnd = () => {
    setPage('start');
  };

  return (
    <GameSettingsProvider>
      <div className="container mt-5">
        {page === 'start' && <StartPage onStart={handleStartClick} />}
        {page === 'settings' && (
          <GameSettingsForm onSubmit={handleSettingsSubmit} />
        )}
        {page === 'game' && gameSettings && (
          <GamePage settings={gameSettings} onEnd={handleGameEnd} />
        )}
      </div>
    </GameSettingsProvider>
  );
}

export default App;