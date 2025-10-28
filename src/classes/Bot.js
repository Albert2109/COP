import { Player } from './Player.js';

export class Bot extends Player {
  constructor(color, rows, columns) {
    super('Бот', 'bot', color, rows, columns);
  }

  async chooseMove(board) {
    const available = this.getAvailableMoves(board);
    if (available.length === 0) return null;

    for (const col of available) {
      const testBoard = this.makeMove(board, col);
      if (testBoard && this.checkWinner(testBoard) === this.symbol) {
        return Promise.resolve(col); 
      }
    }

    for (const col of available) {
      const testBoard = board.map(r => [...r]);
      for (let row = this.rows - 1; row >= 0; row--) {
        if (testBoard[row][col] === null) {
          testBoard[row][col] = 'player'; 
          if (this.checkWinner(testBoard) === 'player') {
            return Promise.resolve(col); 
          }
          break;
        }
      }
    }

    let bestCol = available[0];
    let bestScore = -Infinity;

    for (const col of available) {
      const score = this.evaluatePosition(board, col, this.symbol);
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }
    return Promise.resolve(bestCol); 
  }
  
  getAvailableMoves(board) {
    return board[0]
      .map((cell, col) => cell === null ? col : null)
      .filter(col => col !== null);
  }

  checkHorizontal(board) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col <= this.columns - 4; col++) {
        const cells = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkVertical(board) {
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row <= this.rows - 4; row++) {
        const cells = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkDiagonalDown(board) {
    for (let row = 0; row <= this.rows - 4; row++) {
      for (let col = 0; col <= this.columns - 4; col++) {
        const cells = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkDiagonalUp(board) {
    for (let row = 3; row < this.rows; row++) {
      for (let col = 0; col <= this.columns - 4; col++) {
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

  evaluatePosition(board, col, symbol) {
    let score = 0;
    const testBoard = board.map(r => [...r]);

    let row = -1;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (testBoard[r][col] === null) {
        row = r;
        break;
      }
    }

    if (row === -1) return -Infinity;

    testBoard[row][col] = symbol;

    if (this.checkWinner(testBoard) === symbol) {
      return 10000;
    }

    const countSequence = (board, r, c, dr, dc) => {
      let count = 0;
      let pos = 1;
      while (pos < 4 && 
             r + dr * pos >= 0 && r + dr * pos < this.rows && 
             c + dc * pos >= 0 && c + dc * pos < this.columns && 
             board[r + dr * pos][c + dc * pos] === symbol) {
        count++;
        pos++;
      }
      return count;
    };

    score += countSequence(testBoard, row, col, 0, 1) * 10;
    score += countSequence(testBoard, row, col, 0, -1) * 10;
    score += countSequence(testBoard, row, col, 1, 0) * 15;
    score += countSequence(testBoard, row, col, -1, 0) * 15;
    score += countSequence(testBoard, row, col, 1, 1) * 12;
    score += countSequence(testBoard, row, col, -1, -1) * 12;
    score += countSequence(testBoard, row, col, 1, -1) * 12;
    score += countSequence(testBoard, row, col, -1, 1) * 12;

    return score;
  }
}