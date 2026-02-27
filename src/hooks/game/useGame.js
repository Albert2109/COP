import { useState, useCallback, useMemo } from 'react';
import { Player } from '../../classes/Player.js';
import { EasyBot } from '../../classes/bots/EasyBot.js';
import { Bot } from '../../classes/bots/Bot.js';
import { HardBot } from '../../classes/bots/HardBot.js';

/**
 * The core game logic hook that manages the Connect Four state engine.
 * This hook handles the game board state, turn switching, win/draw detection, 
 * and orchestrates both human and automated (bot) moves.
 * * 
 * * @hook
 * @param {Object} settings - Configuration for the current game session.
 * @param {string} settings.mode - The game mode ('bot' or 'online').
 * @param {string} settings.LevelBot - Difficulty level for the AI ('easy', 'medium', 'hard').
 * @param {string} settings.playerColor - Hex color for the human player.
 * @param {string} settings.botColor - Hex color for the bot/opponent.
 * @param {string} settings.firstPlayer - Determines who starts ('player', 'bot', or 'random').
 * @param {number|string} settings.rows - The vertical size of the board.
 * @param {number|string} settings.columns - The horizontal size of the board.
 * * @returns {Object} Game state and action handlers.
 * @property {Array<Array<string|null>>} board - 2D array representing the current grid.
 * @property {string|null} currentPlayer - The ID of the player whose turn it is ('player' or 'bot').
 * @property {string|null} winner - The result of the game ('player', 'bot', 'draw', or null).
 * @property {Function} playerMove - Handler for processing a human player's move in a specific column.
 * @property {Function} botMove - Asynchronous handler for processing the AI's move or an online opponent's forced move.
 * @property {Function} resetGame - Resets the board and state for a new match.
 * @property {Function} forceTimeout - Ends the game immediately (e.g., when the turn timer expires).
 */
export function useGame(settings) {
  const {
    LevelBot, playerColor, botColor, firstPlayer,
    rows: settingsRows,
    columns: settingsCols
  } = settings;

  const rows = parseInt(settingsRows, 10) || 6;
  const columns = parseInt(settingsCols, 10) || 7;

  /**
   * Generates a clean board based on the row and column settings.
   */
  const createInitialBoard = useCallback(() => {
    return Array(rows).fill(null).map(() => Array(columns).fill(null));
  }, [rows, columns]);

  const [board, setBoard] = useState(createInitialBoard);
  const [winner, setWinner] = useState(null);

  /**
   * Memoized human player instance.
   */
  const player = useMemo(() => {
    return new Player('Гравець', 'player', playerColor || '#FF0000', rows, columns);
  }, [playerColor, rows, columns]);

  /**
   * Memoized bot/opponent instance. 
   * Acts as a factory creating the appropriate Bot class based on difficulty settings.
   */
  const bot = useMemo(() => {
    const color = botColor || '#FFFF00';
    const botArgs = [color, rows, columns];

    if (settings.mode === 'online') {
      return new Player('Опонент', 'bot', color, rows, columns);
    }

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
  }, [LevelBot, botColor, rows, columns, settings.mode]);

  const [currentPlayer, setCurrentPlayer] = useState(() => {
    if (settings.mode === 'online') {
      return settings.firstPlayer; 
    }
    if (firstPlayer === 'random') {
      return Math.random() > 0.5 ? 'player' : 'bot';
    }
    return firstPlayer || 'player';
  }); 

  /**
   * Checks for a winner using the Player class logic.
   */
  const checkWinner = useCallback((currentBoard) => {
    return player.checkWinner(currentBoard); 
  }, [player]); 

  /**
   * Logic for a human player dropping a piece.
   * Checks for validity, updates the board, and evaluates win/draw conditions.
   * @param {number} col - Column index.
   */
  const playerMove = useCallback((col) => {
    if (winner || currentPlayer !== 'player' || !board[0] || board[0][col] !== null) {
      return;
    }
    const newBoard = player.makeMove(board, col);
    if (!newBoard) return;

    const newWinner = checkWinner(newBoard);
    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      const isDraw = newBoard[0]?.every(cell => cell !== null); 
      if (isDraw) {
        setWinner('draw');
      } else {
        setCurrentPlayer('bot');
      }
    }
  }, [board, currentPlayer, winner, checkWinner, player]);

  /**
   * Logic for the AI or Online Opponent move.
   * @param {number|null} [forcedCol=null] - If provided (e.g. from SignalR), forces the move to this column.
   */
  const botMove = useCallback(async (forcedCol = null) => {
    if (winner || currentPlayer !== 'bot') {
      return;
    }

    let col = forcedCol;
    if (col === null && settings.mode !== 'online') { 
      col = await bot.chooseMove(board);
    }
    
    if (col === null) return; 

    const newBoard = bot.makeMove(board, col);
    if (!newBoard) return; 

    const newWinner = checkWinner(newBoard);

    setBoard(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      const isDraw = newBoard[0]?.every(cell => cell !== null); 
      if (isDraw) {
        setWinner('draw');
      } else {
        setCurrentPlayer('player');
      }
    }
  }, [board, currentPlayer, winner, checkWinner, bot, settings.mode]); 

  /**
   * Resets the game to initial state using current settings.
   */
  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    if (settings.mode === 'online') {
        setCurrentPlayer('player'); 
    } else if (firstPlayer === 'random') {
      setCurrentPlayer(Math.random() > 0.5 ? 'player' : 'bot');
    } else {
      setCurrentPlayer(firstPlayer || 'player');
    }
    setWinner(null);
  }, [settings.mode, firstPlayer, createInitialBoard]);

  /**
   * Forcibly declares a bot victory if a timeout occurs.
   */
  const forceTimeout = useCallback(() => {
    if (winner) return;
    if (settings.mode === 'bot') {
        setWinner('bot'); 
        setCurrentPlayer(null);
    }
  }, [winner, settings.mode]);

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