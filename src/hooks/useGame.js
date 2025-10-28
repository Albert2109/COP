import { useState, useCallback, useMemo } from 'react';
import { Player } from '../classes/Player.js';
import { EasyBot } from '../classes/EasyBot.js';
import { Bot } from '../classes/Bot.js'; 
import { HardBot } from '../classes/HardBot.js';

export function useGame(settings) {

  const { 
    LevelBot, playerColor, botColor, firstPlayer,
    rows: settingsRows, 
    columns: settingsCols 
  } = settings;


  const rows = parseInt(settingsRows, 10) || 6;
  const columns = parseInt(settingsCols, 10) || 7;


  const createInitialBoard = useCallback(() => {
    return Array(rows).fill(null).map(() => Array(columns).fill(null));
  }, [rows, columns]); 

  const [board, setBoard] = useState(createInitialBoard);
  const [winner, setWinner] = useState(null);


  const player = useMemo(() => {
    return new Player('Гравець', 'player', playerColor || '#FF0000', rows, columns);
  }, [playerColor, rows, columns]);


  const bot = useMemo(() => {
    const color = botColor || '#FFFF00';

    const botArgs = [color, rows, columns];
    
    switch (LevelBot) {
      case 'easy':
        return new EasyBot(...botArgs);
      case 'medium':
        return new Bot(...botArgs);
      case 'hard':
        return new HardBot(...botArgs);
      default:
        return new EasyBot(...botArgs);
    }
  }, [LevelBot, botColor, rows, columns]);
  
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
  }, [firstPlayer, createInitialBoard]); 

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