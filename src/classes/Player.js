export class Player {
  constructor(name, symbol, color, rows, columns) {
    this.name = name;
    this.symbol = symbol;
    this.color = color || null;
    this.rows = rows || 6;
    this.columns = columns || 7;
  }

  makeMove(board, col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = this.symbol;
        return newBoard;
      }
    }
    return null;
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

}