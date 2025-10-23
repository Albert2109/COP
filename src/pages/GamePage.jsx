import { useState, useEffect } from 'react';
import Board from '../components/Board';
import { useGame } from '../hooks/useGame';
import { useGameTimer } from '../hooks/useGameTimer';
import { formatTime } from '../helper/formatTime';

export default function GamePage({ onEnd }) {
  const { board, currentPlayer, winner, playerMove, botMove } = useGame();
  const [time, setTime] = useState(0);

  useGameTimer(!winner, setTime);

  // Коли черга бота і немає переможця
  useEffect(() => {
    if (currentPlayer === 'bot' && !winner) {
      const timer = setTimeout(() => {
        botMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, botMove]);

  const handleColumnClick = (col) => {
    if (currentPlayer === 'player' && !winner) {
      playerMove(col);
    }
  };

  const handleEndGame = () => {
    const winnerName = winner === 'player' ? 'Ви' : winner === 'bot' ? 'Бот' : 'Нічия';
    onEnd({ winner: winnerName, time: formatTime(time) });
  };

  return (
    <>
      <h2>Гра йде...</h2>
      <p className="fs-5">
        Черга: <strong>{currentPlayer === 'player' ? 'Ваша' : 'Бота'}</strong>
      </p>
      <p className="fs-5">Час: <strong>{formatTime(time)}</strong></p>

      {winner && (
        <div className="alert alert-success" role="alert">
          Переміг: <strong>{winner === 'player' ? 'Ви' : 'Бот'}</strong>
        </div>
      )}

      <Board board={board} onColumnClick={handleColumnClick} />

      <button className='btn btn-danger mt-3' onClick={handleEndGame}>
        Закінчити гру
      </button>
    </>
  );
}