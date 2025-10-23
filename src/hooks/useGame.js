import { useState, useCallback } from 'react';
import { Player } from '../classes/Player.js';
import { Bot } from '../classes/Bot.js';

// Створюємо екземпляри гравців один раз
const player = new Player('Гравець', 'player');
const bot = new Bot();

// Початковий стан дошки
const createInitialBoard = () => Array(6).fill(null).map(() => Array(7).fill(null));

export function useGame() {
  const [board, setBoard] = useState(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState('player');
  const [winner, setWinner] = useState(null);

  // Bot.js вже має всі методи перевірки, тож будемо використовувати їх
  const checkWinner = useCallback((currentBoard) => {
    return bot.checkWinner(currentBoard);
  }, []);

  const playerMove = useCallback((col) => {
    // Запобігаємо ходу, якщо гра закінчена, ходить бот, або колонка повна
    if (winner || currentPlayer !== 'player' || board[0][col] !== null) {
      return;
    }

    // 1. Отримуємо нову дошку від гравця
    const newBoard = player.makeMove(board, col);
    if (!newBoard) return; // Хід не вдався

    // 2. Перевіряємо переможця
    const newWinner = checkWinner(newBoard);

    // 3. Оновлюємо стан
    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      setCurrentPlayer('bot'); // Передаємо хід боту
    }
  }, [board, currentPlayer, winner, checkWinner]); // Додаємо залежності

  const botMove = useCallback(() => {
    if (winner || currentPlayer !== 'bot') {
      return;
    }

    // 1. Бот обирає колонку
    const col = bot.chooseMove(board);
    if (col === null) return; // Нічия або немає ходів

    // 2. Отримуємо нову дошку від бота
    const newBoard = bot.makeMove(board, col);

    // 3. Перевіряємо переможця
    const newWinner = checkWinner(newBoard);

    // 4. Оновлюємо стан
    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      setCurrentPlayer('player'); // Передаємо хід гравцю
    }
  }, [board, currentPlayer, winner, checkWinner]); // Додаємо залежності

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('player');
    setWinner(null);
  }, []);

  return {
    board,
    currentPlayer,
    winner,
    playerMove,
    botMove,
    resetGame
  };
}