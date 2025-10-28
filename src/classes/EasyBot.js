import { Player } from "./Player";

export class EasyBot extends Player {

  constructor(color) {
    super('Простий Бот', 'bot', color);
  }


  async chooseMove(board) {
    const available = this.getAvailableMoves(board);
    if (available.length === 0) return Promise.resolve(null); 

    if (Math.random() < 0.3) {
      const defendCol = this.findDefensiveMove(board, available);
      if (defendCol !== null) return Promise.resolve(defendCol); 
    }

    if (Math.random() < 0.2) {
      const winCol = this.findWinningMove(board, available);
      if (winCol !== null) return Promise.resolve(winCol); 
    }
    

    return Promise.resolve(available[Math.floor(Math.random() * available.length)]);
  }

  
  
  findWinningMove(board, available) {
for (const col of available) {
 const testBoard = this.makeMove(board, col);
 if (testBoard && this.checkWinner(testBoard) === this.symbol) {
 return col;
 }
 }
 return null;
 }

 findDefensiveMove(board, available) {
 for (const col of available) {
 const testBoard = board.map(r => [...r]);
 for (let row = 5; row >= 0; row--) {
 if (testBoard[row][col] === null) {
 testBoard[row][col] = 'player';
 if (this.checkWinner(testBoard) === 'player') {
 return col;
 }
 break;
 }
 }
 }
 return null;
 }

 getAvailableMoves(board) {
 return board[0]
 .map((cell, col) => cell === null ? col : null)
 .filter(col => col !== null);
 }

 checkHorizontal(board) {
 for (let row = 0; row < 6; row++) {
 for (let col = 0; col <= 3; col++) {
 const cells = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
 if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
 return cells[0];
 }
 }
 }
 return null;
 }

 checkVertical(board) {
 for (let col = 0; col < 7; col++) {
 for (let row = 0; row <= 2; row++) {
 const cells = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
 if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
 return cells[0];
 }
 }
}
 return null;
 }

 checkDiagonalDown(board) {
 for (let row = 0; row <= 2; row++) {
 for (let col = 0; col <= 3; col++) {
 const cells = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
 if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
 return cells[0];
 }
 }
 }
 return null;
 }

 checkDiagonalUp(board) {
 for (let row = 3; row < 6; row++) {
 for (let col = 0; col <= 3; col++) {
 const cells = [board[row][col], board[row-1][col+1], board[row-2][col+2], board[row-3][col+3]];
 if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
 return cells[0];
  }
 }
}
return null;
}
checkWinner(board) {
 return this.checkHorizontal(board) || this.checkVertical(board) || 
this.checkDiagonalDown(board) || this.checkDiagonalUp(board);
}
}