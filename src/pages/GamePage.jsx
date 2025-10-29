import { useState, useEffect } from 'react';
import Board from '../components/game/Board';
import GameEndPortal from '../components/game/GameEndPortal';
import { useGame } from '../hooks/game/useGame';
import { useGameTimer } from '../hooks/game/useGameTimer';
import { formatTime } from '../helper/formatTime';
import '../styles/GamePage.css';


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
  }, [winner]);

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


  const timePercentage = timeLeft ? (timeLeft / settings.moveTimeLimit) * 100 : 100;
  const timeColor = timePercentage > 50 ? '#4CAF50' : timePercentage > 25 ? '#FFC107' : '#f44336';

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Гра йде...</h2>
        <div className="game-info">
          <div className="info-item">
            <span>Черга:</span>
            <strong>{currentPlayer === 'player' ? '👤 Ваша' : '🤖 Бота'}</strong>
          </div>
          <div className="info-item">
            <span>Час гри:</span>
            <strong>{formattedTime}</strong>
          </div>
        </div>
      </div>

      {settings.moveTimeLimit && (
        <div className="move-timer">
          <div 
            className="timer-bar" 
            style={{
              width: `${timePercentage}%`,
              backgroundColor: timeColor,
              transition: timeLeft === settings.moveTimeLimit ? 'none' : 'all 0.3s ease'
            }}
          />
          <span className="timer-text">{timeLeft}s</span>
        </div>
      )}

      {winner && (
        <div className={`alert ${winner === 'player' ? 'alert-success' : 'alert-danger'}`}>
          {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Бот переміг!'}
        </div>
      )}

      <Board 
        board={board} 
        onColumnClick={handleColumnClick} 
        playerColor={settings.playerColor}
        botColor={settings.botColor}
      />
      

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