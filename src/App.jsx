import { useState } from 'react';
import GameSettingsProvider from './context/GameSettingsProvider';
import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/GameSettingsForm';
import ResultsPage from './pages/ResultsPage';
import OnlineGamePage from './pages/OnlineGamePage'; // 1. Імпортуємо нову сторінку
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
    let mode = lockedMode;
    if (!mode) {
      mode = settings.mode;
      setLockedMode(mode); // Блокуємо режим на сесію
    }
    
    // Зберігаємо налаштування для наступної гри
    const currentSettings = { ...settings, mode: mode };
    setGameSettings(currentSettings);

    // 2. Визначаємо, яку сторінку показати
    if (mode === 'bot') {
      setPage('game'); 
    } else if (mode === 'online') {
      setPage('online_game'); 
    } else {
      // Якщо режим не вибрано (не мало б статися через валідацію)
      setPage('settings'); 
    }
  };

  const addGameToHistory = (result) => {
    // Переконуємось, що gameSettings існують
    if (!gameSettings) return; 

    const gameResult = {
      ...result,
      id: new Date().toISOString(),
      mode: gameSettings.mode,
      botLevel: gameSettings.mode === 'bot' ? gameSettings.LevelBot : null, // Зберігаємо рівень тільки для бота
      // Можна додати інші деталі, наприклад, розмір дошки
      rows: gameSettings.rows,
      columns: gameSettings.columns,
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
        {/* Сторінка Старту */}
        {page === 'start' && <StartPage onStart={handleStartClick} />}

        {/* Сторінка Налаштувань */}
        {page === 'settings' && (
          <GameSettingsForm 
            onSubmit={handleSettingsSubmit} 
            lockedMode={lockedMode} 
            currentSettings={gameSettings}
          />
        )}

        {/* Сторінка Гри проти Бота */}
        {page === 'game' && gameSettings && gameSettings.mode === 'bot' && (
          <GamePage 
            settings={gameSettings} 
            onGoToSettings={handleGoToSettings}
            onGoToResults={handleGoToResults}
            onGameFinished={addGameToHistory} 
          />
        )}
        
        {/* Сторінка Гри Онлайн */}
        {page === 'online_game' && gameSettings && gameSettings.mode === 'online' && (
          <OnlineGamePage 
            settings={gameSettings}
            onGoToSettings={handleGoToSettings}
            onGoToResults={handleGoToResults}
            onGameFinished={addGameToHistory} 
          />
        )}
        
        {/* Сторінка Результатів Сесії */}
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