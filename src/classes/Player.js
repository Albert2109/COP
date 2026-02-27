/**
 * Base class representing a participant in the Connect Four game.
 * This can be a human player or a base for bot extensions.
 * Handles core mechanics like making moves and checking win conditions.
 * @class
 */
export class Player {
  /**
   * Creates a new player entity.
   * @param {string} name - The display name of the player (e.g., "Player 1", "Bot").
   * @param {string} symbol - The internal identifier/symbol for the player's pieces (e.g., 'player', 'bot').
   * @param {string} [color=null] - The visual color assigned to the player's pieces ('red' or 'yellow').
   * @param {number} [rows=6] - The number of rows on the game board. Defaults to standard 6.
   * @param {number} [columns=7] - The number of columns on the game board. Defaults to standard 7.
   */
  constructor(name, symbol, color, rows, columns) {
    this.name = name;
    this.symbol = symbol;
    this.color = color || null;
    this.rows = rows || 6;
    this.columns = columns || 7;
  }

  /**
   * Attempts to drop a piece into the specified column.
   * Creates a deep copy of the board to maintain immutability (useful for React state and Minimax simulation).
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @param {number} col - The zero-based index of the column to drop the piece into.
   * @returns {Array<Array<string|null>>|null} A new board array with the move applied, or null if the column is full.
   */
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

  /**
   * Scans the board for a horizontal win condition (4 consecutive pieces in a row).
   * @param {Array<Array<string|null>>} board - The board state to check.
   * @returns {string|null} The winning symbol if found, otherwise null.
   */
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

  /**
   * Scans the board for a vertical win condition (4 consecutive pieces in a column).
   * @param {Array<Array<string|null>>} board - The board state to check.
   * @returns {string|null} The winning symbol if found, otherwise null.
   */
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

  /**
   * Scans the board for a diagonal win condition extending downwards (top-left to bottom-right).
   * @param {Array<Array<string|null>>} board - The board state to check.
   * @returns {string|null} The winning symbol if found, otherwise null.
   */
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

  /**
   * Scans the board for a diagonal win condition extending upwards (bottom-left to top-right).
   * @param {Array<Array<string|null>>} board - The board state to check.
   * @returns {string|null} The winning symbol if found, otherwise null.
   */
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
  
  /**
   * Master check function that evaluates the board for any win condition.
   * Calls horizontal, vertical, and both diagonal checks.
   * @param {Array<Array<string|null>>} board - The board state to check.
   * @returns {string|null} The winning symbol if any condition is met, otherwise null.
   */
  checkWinner(board) {
    return this.checkHorizontal(board) || this.checkVertical(board) || 
           this.checkDiagonalDown(board) || this.checkDiagonalUp(board);
  }
}