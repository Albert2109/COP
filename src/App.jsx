import { useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore'; // Імпортуємо хук

import StartPage from './pages/StartPage';
import GamePage from './pages/GamePage';
import GameSettingsForm from './components/settings/GameSettingsForm';
import ResultsPage from './pages/ResultsPage';
import OnlineGamePage from './pages/OnlineGamePage';
import './App.css';

function App() {
 const navigate = useNavigate();


 const gameSettings = useGameStore((state) => state.gameSettings);
 const lockedMode = useGameStore((state) => state.lockedMode);

 const clearSession = useGameStore((state) => state.clearSession);
 const setGameSession = useGameStore((state) => state.setGameSession);
 const addGameToHistoryFromStore = useGameStore((state) => state.addGameToHistory);


const handleStartClick = () => {
clearSession(); 
 navigate('/settings');
};

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

 const handleGoToSettings = () => {
 navigate('/settings');
 };
 const handleGoToResults = () => {
 navigate('/results');
 };

 const handleRestart = () => {
 navigate('/');
 };


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
 <Route path="/" element={<StartPage onStart={handleStartClick} />} />

 <Route path="/settings" element={<SettingsPageWrapper />} />
 <Route path="/settings/:roomCode" element={<SettingsPageWrapper />} />

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

 <Route
path="/online-game/:roomCode"
 element={<OnlineGamePageWrapper />}
 />

 <Route
 path="/results"
 element={
 <ResultsPage

 onRestart={handleRestart}
 />
 }
 />

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
 </div>
);
}

export default App;