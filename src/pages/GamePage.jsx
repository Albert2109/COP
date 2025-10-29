import { useState, useEffect } from 'react';
import Board from '../components/game/Board';
import GameEndPortal from '../components/game/GameEndPortal/GameEndPortal';
import { useGame } from '../hooks/game/useGame';
import { useGameTimer } from '../hooks/game/useGameTimer';
import { formatTime } from '../helper/formatTime';
import '../styles/GamePage.css';

import GameHeader from '../components/game/GameHeader';
import MoveTimer from '../components/game/MoveTimer';


export default function GamePage({ settings, onGoToSettings, onGoToResults, onGameFinished }) {
  const { board, currentPlayer, winner, playerMove, botMove, resetGame, forceTimeout } = useGame(settings);
  const [time, setTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.moveTimeLimit ? parseInt(settings.moveTimeLimit, 10) : null);
  const [showEndPortal, setShowEndPortal] = useState(false);

  useGameTimer(!winner, setTime);
  const formattedTime = formatTime(time);

  useEffect(() => {
 if (currentPlayer === 'bot' && !winner) {
 const timer = setTimeout(() => {
   botMove();
 if (settings.moveTimeLimit) {
 setTimeLeft(settings.moveTimeLimit);
 }
 }, 500); 
 return () => clearTimeout(timer);
 }
 }, [currentPlayer, winner, botMove, settings.moveTimeLimit]);

 useEffect(() => {
 if (!timeLeft || winner || currentPlayer === 'bot') {
 return;
 }
 const interval = setInterval(() => {
setTimeLeft(prev => {
 if (prev <= 1) {
   clearInterval(interval); 
 forceTimeout(); 
 return 0;
 }
 return prev - 1; 
 });
 }, 1000);
 return () => clearInterval(interval);
 }, [currentPlayer, winner, timeLeft, forceTimeout]);

 useEffect(() => {
 if (winner) {
 onGameFinished({
 winner: winner,
 time: formattedTime 
 });
setShowEndPortal(true);
}
}, [winner, onGameFinished, formattedTime]); 

 const handleColumnClick = (col) => {
 if (currentPlayer === 'player' && !winner) {
 playerMove(col);
if (settings.moveTimeLimit) {
 setTimeLeft(settings.moveTimeLimit);
 }
 }
};

 const handlePlayAgain = () => {
resetGame();
setShowEndPortal(false);
 setTime(0);
if (settings.moveTimeLimit) {
setTimeLeft(settings.moveTimeLimit);
}
};

const handleChangeSettings = () => {
setShowEndPortal(false);
onGoToSettings(); 
};

const handleEndGame = () => {
setShowEndPortal(false);
onGoToResults(); 
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex flex-col">
      {/* Header */}
      <div className="w-full">
        <GameHeader 
          currentPlayer={currentPlayer}
          formattedTime={formattedTime}
        />
      </div>

      {/* Main Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-auto">
        {/* Timer - shown only if time limit exists */}
        {settings.moveTimeLimit && (
          <div className="w-full mb-4 md:mb-6">
            <MoveTimer 
              timeLeft={timeLeft}
              moveTimeLimit={parseInt(settings.moveTimeLimit, 10)}
            />
          </div>
        )}

        {/* Winner Alert */}
        {winner && (
          <div className={`mb-4 md:mb-6 w-full max-w-md px-6 py-4 rounded-2xl text-center font-bold text-lg shadow-2xl border-2 ${
            winner === 'player' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-600 text-white' 
              : winner === 'draw'
              ? 'bg-gradient-to-r from-blue-400 to-cyan-500 border-blue-600 text-white'
              : 'bg-gradient-to-r from-orange-400 to-red-500 border-red-600 text-white'
          }`}>
            {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Бот переміг!'}
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center items-center">
          <Board 
            board={board} 
            onColumnClick={handleColumnClick} 
            playerColor={settings.playerColor}
            botColor={settings.botColor}
          />
        </div>
      </div>

      {/* Game End Portal */}
      <GameEndPortal
        isOpen={showEndPortal}
        winner={winner}
        time={formattedTime}
        botLevel={settings.LevelBot}
        onPlayAgain={handlePlayAgain}
        onChangeSettings={handleChangeSettings}
        EndGame={handleEndGame} 
      />
    </div>
  );
}