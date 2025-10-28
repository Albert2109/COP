import { useState, useCallback, useMemo } from 'react';
import { Player } from '../classes/Player.js';
import { EasyBot } from '../classes/EasyBot.js';
import { Bot } from '../classes/Bot.js'; 
import { HardBot } from '../classes/HardBot.js';

const createInitialBoard = () => Array(6).fill(null).map(() => Array(7).fill(null));

export function useGame(settings) {
  const [board, setBoard] = useState(createInitialBoard);
  const [winner, setWinner] = useState(null);

  const { LevelBot, playerColor, botColor, firstPlayer } = settings;

  const player = useMemo(() => {
    return new Player('Гравець', 'player', playerColor || '#FF0000');
  }, [playerColor]);

  const bot = useMemo(() => {
    const color = botColor || '#FFFF00';
    switch (LevelBot) {
      case 'easy':
        return new EasyBot(color);
      case 'medium':
        return new Bot(color);
      case 'hard':
        return new HardBot(color);
      default:
        return new EasyBot(color);
    }
  }, [LevelBot, botColor]);
  
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    if (firstPlayer === 'random') {
      return Math.random() > 0.5 ? 'player' : 'bot';
    }
    return firstPlayer || 'player';
  });

  const checkWinner = useCallback((currentBoard) => {
    return bot.checkWinner(currentBoard);
  }, [bot]); 

  const playerMove = useCallback((col) => {
    if (winner || currentPlayer !== 'player' || board[0][col] !== null) {
      return;
    }
    const newBoard = player.makeMove(board, col);
    if (!newBoard) return;

    const newWinner = checkWinner(newBoard);
    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      const isDraw = newBoard[0].every(cell => cell !== null);
      if (isDraw) {
        setWinner('draw');
      } else {
        setCurrentPlayer('bot');
      }
    }
  }, [board, currentPlayer, winner, checkWinner, player]); 

  const botMove = useCallback(async () => { 
    if (winner || currentPlayer !== 'bot') {
      return;
    }

    const col = await bot.chooseMove(board); 
    if (col === null) return; 

    const newBoard = bot.makeMove(board, col);
    const newWinner = checkWinner(newBoard);

    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      const isDraw = newBoard[0].every(cell => cell !== null);
      if (isDraw) {
        setWinner('draw'); 
      } else { 
        setCurrentPlayer('player'); 
      }
    }
  }, [board, currentPlayer, winner, checkWinner, bot]); 

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    if (firstPlayer === 'random') {
      setCurrentPlayer(Math.random() > 0.5 ? 'player' : 'bot');
    } else {
      setCurrentPlayer(firstPlayer || 'player');
    }
    setWinner(null);
  }, [firstPlayer]);

  const forceTimeout = useCallback(() => {
    if (winner) return; 
    setWinner('bot');
    setCurrentPlayer(null); 
  }, [winner]); 

  return {
    board,
    currentPlayer,
    winner,
    playerMove,
    botMove,
    resetGame,
    forceTimeout 
  };
}