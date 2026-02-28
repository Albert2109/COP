import { useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';

import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/settings/GameSettingsForm';
import ResultsPage from './pages/ResultsPage';
import OnlineGamePage from './pages/OnlineGamePage';

import PrivacyPolicy from './pages/PrivacyPolicy'; 
import CookieConsent from './components/CookieConsent'; 
import PrivacyFooter from './components/PrivacyFooter'; 

import './App.css';

/**
 * The root component of the Connect Four application.
 * * Responsibilities:
 * - Orchestrates top-level routing using React Router.
 * - Connects the UI to the global Zustand `useGameStore`.
 * - Manages the transition logic between settings, active gameplay, and results history.
 * - Global injection of GDPR-related components (CookieConsent, PrivacyFooter).
 * * 
 * * @component
 * @category Core
 */
function App() {
  /** * Hook to programmatically trigger navigation between routes.
   */
  const navigate = useNavigate();

  // --- Store State & Actions ---
  const gameSettings = useGameStore((state) => state.gameSettings);
  const lockedMode = useGameStore((state) => state.lockedMode);
  const clearSession = useGameStore((state) => state.clearSession);
  const setGameSession = useGameStore((state) => state.setGameSession);
  const addGameToHistoryFromStore = useGameStore((state) => state.addGameToHistory);

  /**
   * Resets the current session and directs the user to the initial setup.
   * Clears all temporary game data from the store.
   * @function
   */
  const handleStartClick = () => {
    clearSession(); 
    navigate('/settings');
  };

  /**
   * Processes the settings form submission.
   * Determines the final game mode (Bot or Online), updates the store,
   * and navigates to the appropriate route.
   * @function
   * @param {Object} settings - Validated form data from GameSettingsForm.
   */
  const handleSettingsSubmit = (settings) => {
    let mode = lockedMode;
    if (!mode) {
      mode = settings.mode;
    }

    const currentSettings = { ...settings, mode };
    setGameSession(currentSettings, mode); 

    if (mode === 'bot') {
      navigate('/game');
    } else if (mode === 'online') {
      const roomCodeForUrl = settings.roomCode || 'new';
      navigate(`/online-game/${roomCodeForUrl}`);
    } else {
      console.warn("Invalid mode selected, returning to settings.");
      navigate('/settings');
    }
  };

  /**
   * Memoized callback to record match results into the global history.
   * Enriches raw result data with current session metadata (mode, bot difficulty, grid size)
   * before persisting it to the store.
   * @function
   * @param {Object} result - Result object containing winner and elapsed time.
   */
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

    addGameToHistoryFromStore(gameResult); 
  }, [gameSettings, addGameToHistoryFromStore]); 

  // --- Navigation Handlers ---
  const handleGoToSettings = () => navigate('/settings');
  const handleGoToResults = () => navigate('/results');
  const handleRestart = () => navigate('/');

  /**
   * HOC-like wrapper for the Settings Page to handle optional URL room codes.
   * Extracts roomCode from URL parameters and passes it to the form.
   * @returns {JSX.Element}
   */
  function SettingsPageWrapper() {
    const { roomCode } = useParams();
    return (
      <GameSettingsForm
        onSubmit={handleSettingsSubmit}
        lockedMode={lockedMode}
        currentSettings={gameSettings}
        initialRoomCode={roomCode}
      />
    );
  }

  /**
   * Safeguard wrapper for the Online Game Page.
   * Ensures that game settings exist and mode is 'online' before rendering.
   * Redirects back to settings if the state is invalid or missing to prevent runtime errors.
   * @returns {JSX.Element}
   */
  function OnlineGamePageWrapper() {
    const { roomCode } = useParams();

    return gameSettings && gameSettings.mode === 'online' ? (
      <OnlineGamePage
        settings={gameSettings}
        onGoToSettings={handleGoToSettings}
        onGoToResults={handleGoToResults}
        onGameFinished={addGameToHistory}
      />
    ) : (
      <Navigate to={`/settings/${roomCode || ''}`} replace />
    );
  }

  return (
    <div className="container mt-5">
      <Routes>
        {/* Entrance Route */}
        <Route path="/" element={<StartPage onStart={handleStartClick} />} />

        {/* Configuration Routes */}
        <Route path="/settings" element={<SettingsPageWrapper />} />
        <Route path="/settings/:roomCode" element={<SettingsPageWrapper />} />

        {/* Local Gameplay Route (Player vs Bot) */}
        <Route
          path="/game"
          element={
            gameSettings && gameSettings.mode === 'bot' ? (
              <GamePage
                settings={gameSettings}
                onGoToSettings={handleGoToSettings}
                onGoToResults={handleGoToResults}
                onGameFinished={addGameToHistory}
              />
            ) : (
              <Navigate to="/settings" replace />
            )
          }
        />

        {/* Multiplayer Gameplay Route (SignalR) */}
        <Route
          path="/online-game/:roomCode"
          element={<OnlineGamePageWrapper />}
        />

        {/* Session Results & Privacy Routes */}
        <Route
          path="/results"
          element={<ResultsPage onRestart={handleRestart} />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Fallback 404 Handling */}
        <Route
          path="*"
          element={
            <div className="text-center">
              <h2>404 - Сторінку не знайдено</h2>
              <button className="btn btn-primary" onClick={handleRestart}>
                На головну
              </button>
            </div>
          }
        />
      </Routes>

      {/* Persistent Overlay Components */}
      <CookieConsent />
      <PrivacyFooter />
    </div>
  );
}

export default App;