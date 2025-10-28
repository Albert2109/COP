import { useState, useCallback } from 'react';
// 1. Виправляємо шляхи імпорту. Припускаємо, що App.jsx знаходиться в src/
import GameSettingsProvider from './context/GameSettingsProvider';
import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/GameSettingsForm';
import ResultsPage from './pages/ResultsPage';
import OnlineGamePage from './pages/OnlineGamePage';
import './App.css'; // Припускаємо, що App.css теж у src/

// Завантаження історії з localStorage
const loadHistory = () => {
  const saved = localStorage.getItem('gameSessionHistory');
  // Додамо try-catch на випадок пошкоджених даних у localStorage
  try {
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to parse game history from localStorage:", e);
    localStorage.removeItem('gameSessionHistory'); // Очистимо пошкоджені дані
    return [];
  }
};

function App() {
  const [page, setPage] = useState('start');
  const [gameSettings, setGameSettings] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [lockedMode, setLockedMode] = useState(
    history.length > 0 ? history[0].mode : null
  );

  // Обробник старту нової сесії
  const handleStartClick = () => {
    setHistory([]);
    setLockedMode(null);
    setGameSettings(null);
    localStorage.removeItem('gameSessionHistory');
    setPage('settings');
  };

  // Обробник відправки налаштувань
  const handleSettingsSubmit = (settings) => {
    let mode = lockedMode;
    if (!mode) {
      mode = settings.mode;
      setLockedMode(mode);
    }
    const currentSettings = { ...settings, mode: mode };
    setGameSettings(currentSettings);

    if (mode === 'bot') {
      setPage('game');
    } else if (mode === 'online') {
      setPage('online_game');
    } else {
      console.warn("Invalid mode selected, returning to settings.");
      setPage('settings');
    }
  };

  // Додавання гри в історію (стабілізовано з useCallback)
  const addGameToHistory = useCallback((result) => {
    if (!gameSettings) {
        console.error("Cannot add game to history: gameSettings is null.");
        return;
    }

    const gameResult = {
      ...result,
      id: new Date().toISOString(),
      mode: gameSettings.mode,
      botLevel: gameSettings.mode === 'bot' ? gameSettings.LevelBot : null,
      rows: gameSettings.rows,
      columns: gameSettings.columns,
    };

    setHistory(prevHistory => {
        const newHistory = [gameResult, ...prevHistory];
        try {
            localStorage.setItem('gameSessionHistory', JSON.stringify(newHistory));
        } catch (e) {
            console.error("Failed to save game history to localStorage:", e);
            // Можливо, localStorage переповнений
            alert("Не вдалося зберегти історію гри. Можливо, сховище переповнене.");
        }
        return newHistory;
    });
  }, [gameSettings]); // Залежить тільки від gameSettings

  // Перехід до налаштувань
  const handleGoToSettings = () => {
    setPage('settings');
  };

  // Перехід до результатів
  const handleGoToResults = () => {
    setPage('results');
  };

  // Повернення на головну зі сторінки результатів
  const handleRestart = () => {
    setPage('start');
  };

  // --- Рендеринг ---
  return (
    <GameSettingsProvider>
      <div className="container mt-5">
        {/* Умовний рендеринг сторінок */}
        {page === 'start' && <StartPage onStart={handleStartClick} />}

        {page === 'settings' && (
          <GameSettingsForm
            onSubmit={handleSettingsSubmit}
            lockedMode={lockedMode}
            currentSettings={gameSettings}
          />
        )}

        {page === 'game' && gameSettings && gameSettings.mode === 'bot' && (
          <GamePage
            settings={gameSettings}
            onGoToSettings={handleGoToSettings}
            onGoToResults={handleGoToResults}
            onGameFinished={addGameToHistory}
          />
        )}

        {page === 'online_game' && gameSettings && gameSettings.mode === 'online' && (
          <OnlineGamePage
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

