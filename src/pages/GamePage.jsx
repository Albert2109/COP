import { useState, useEffect } from 'react';
import Board from '../components/Board';
import GameEndPortal from '../components/GameEndPortal';
import { useGame } from '../hooks/useGame';
import { useGameTimer } from '../hooks/useGameTimer';
import { formatTime } from '../helper/formatTime';
import '../styles/GamePage.css';

export default function GamePage({ settings, onEnd }) {
  const { board, currentPlayer, winner, playerMove, botMove, resetGame, forceTimeout } = useGame(settings);
  const [time, setTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.moveTimeLimit ? parseInt(settings.moveTimeLimit, 10) : null);
  const [showEndPortal, setShowEndPortal] = useState(false);

  useGameTimer(!winner, setTime);

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


  const handleColumnClick = (col) => {
    if (currentPlayer === 'player' && !winner) {
      playerMove(col);

      if (settings.moveTimeLimit) {
        setTimeLeft(settings.moveTimeLimit);
      }
    }
  };

  const handleGameEnd = () => {
    setShowEndPortal(true);
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
    onEnd();
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
            <strong>{formatTime(time)}</strong>
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

      {winner && (
        <button className="btn btn-danger mt-3" onClick={handleGameEnd}>
          Завершити гру
        </button>
      )}

      <GameEndPortal
        isOpen={showEndPortal}
        winner={winner}
        time={formatTime(time)}
        botLevel={settings.LevelBot}
        onPlayAgain={handlePlayAgain}
        onChangeSettings={handleChangeSettings}
      />
    </div>
  );
}