import React, { useState, useEffect } from 'react';
import Board from '../components/game/Board';
import GameEndPortal from '../components/game/GameEndPortal/GameEndPortal';
import { useGame } from '../hooks/game/useGame';
import { useGameTimer } from '../hooks/game/useGameTimer';
import { formatTime } from '../helper/formatTime';
import '../styles/GamePage.css';

import GameHeader from '../components/game/GameHeader';
import MoveTimer from '../components/game/MoveTimer';

/**
 * The primary container component for the local game mode (Player vs. Bot).
 * It orchestrates the game flow by managing the session timer, turn-based move timers,
 * and bot execution timing. It also handles navigation callbacks for settings and results.
 * * 
 * * @component
 * @param {Object} props - The component properties.
 * @param {Object} props.settings - The configuration object for the match (difficulty, colors, time limits).
 * @param {Function} props.onGoToSettings - Callback to return to the configuration screen.
 * @param {Function} props.onGoToResults - Callback to navigate to the session statistics/history.
 * @param {Function} props.onGameFinished - Callback triggered when a winner is declared to save session data.
 * @returns {JSX.Element} The rendered game page including header, timer, board, and portals.
 */
export default function GamePage({ settings, onGoToSettings, onGoToResults, onGameFinished }) {
  /**
   * Destructured game state and actions from the core game hook.
   */
  const { board, currentPlayer, winner, playerMove, botMove, resetGame, forceTimeout } = useGame(settings);
  
  /** * Local state for tracking the total session duration in seconds.
   * @type {[number, function]} 
   */
  const [time, setTime] = useState(0);

  /** * Local state for the countdown timer of the current move.
   * @type {[number|null, function]} 
   */
  const [timeLeft, setTimeLeft] = useState(settings.moveTimeLimit ? parseInt(settings.moveTimeLimit, 10) : null);

  /** * Visibility state for the game result modal.
   * @type {[boolean, function]} 
   */
  const [showEndPortal, setShowEndPortal] = useState(false);

  /**
   * Primary session timer hook. Increments 'time' state every second while no winner exists.
   */
  useGameTimer(!winner, setTime);
  const formattedTime = formatTime(time);

  /**
   * Effect: Handles the Bot's move delay.
   * Introduces a 500ms artificial delay to make the bot's actions feel natural.
   */
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

  /**
   * Effect: Handles the move countdown (Turn Timer).
   * Decrements 'timeLeft' and triggers 'forceTimeout' if it reaches zero.
   */
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

  /**
   * Effect: Handles game termination.
   * Triggers the finish callback and displays the results portal.
   */
  useEffect(() => {
    if (winner) {
      onGameFinished({
        winner: winner,
        time: formattedTime 
      });
      setShowEndPortal(true);
    }
  }, [winner, onGameFinished, formattedTime]); 

  /**
   * Processes a column click for the human player.
   * Resets the move timer upon a valid move.
   * @param {number} col - The column index selected by the user.
   */
  const handleColumnClick = (col) => {
    if (currentPlayer === 'player' && !winner) {
      playerMove(col);
      if (settings.moveTimeLimit) {
        setTimeLeft(settings.moveTimeLimit);
      }
    }
  };

  /**
   * Resets the game state and local timers for a rematch.
   */
  const handlePlayAgain = () => {
    resetGame();
    setShowEndPortal(false);
    setTime(0);
    if (settings.moveTimeLimit) {
      setTimeLeft(settings.moveTimeLimit);
    }
  };

  /**
   * Closes portal and triggers settings navigation.
   */
  const handleChangeSettings = () => {
    setShowEndPortal(false);
    onGoToSettings(); 
  };

  /**
   * Closes portal and triggers results navigation.
   */
  const handleEndGame = () => {
    setShowEndPortal(false);
    onGoToResults(); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex flex-col">
      <div className="w-full">
        <GameHeader 
          currentPlayer={currentPlayer}
          formattedTime={formattedTime}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-auto">
        {settings.moveTimeLimit && (
          <div className="w-full mb-4 md:mb-6">
            <MoveTimer 
              timeLeft={timeLeft}
              moveTimeLimit={parseInt(settings.moveTimeLimit, 10)}
            />
          </div>
        )}

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

        <div className="flex justify-center items-center">
          <Board 
            board={board} 
            onColumnClick={handleColumnClick} 
            playerColor={settings.playerColor}
            botColor={settings.botColor}
          />
        </div>
      </div>

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