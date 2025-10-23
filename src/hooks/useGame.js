

import { useState, useCallback } from 'react';
import { Player } from '../classes/Player.js';
import { Bot } from '../classes/Bot.js';

const player = new Player('Гравець', 'player');
const bot = new Bot();

const createInitialBoard = () => Array(6).fill(null).map(() => Array(7).fill(null));

export function useGame() {
const [board, setBoard] = useState(createInitialBoard);
const [currentPlayer, setCurrentPlayer] = useState('player');
const [winner, setWinner] = useState(null);

const checkWinner = useCallback((currentBoard) => {
return bot.checkWinner(currentBoard);
 }, []);
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
 }, [board, currentPlayer, winner, checkWinner]); 

 const botMove = useCallback(() => {
if (winner || currentPlayer !== 'bot') {
 return;
 }

 const col = bot.chooseMove(board);
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
} else { setCurrentPlayer('player'); 
}

}
}, [board, currentPlayer, winner, checkWinner]); 
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