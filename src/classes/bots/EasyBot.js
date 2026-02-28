import { Player } from "../Player";

/**
 * Class representing an easy-level bot (Beginner).
 * It primarily makes random moves but has a small probability
 * of noticing and executing a winning move or blocking the opponent.
 * @class
 * @extends Player
 */
export class EasyBot extends Player {
  /**
   * Creates an instance of the easy bot.
   * @param {string} color - The color of the bot's pieces ('red' or 'yellow').
   * @param {number} rows - The number of rows on the game board.
   * @param {number} columns - The number of columns on the game board.
   */
  constructor(color, rows, columns) {
    super('Простий Бот', 'bot', color, rows, columns);
  }

  /**
   * Asynchronously chooses a move based on simple probabilities.
   * - 30% chance to attempt blocking the opponent's winning move.
   * - 20% chance to attempt a winning move if available.
   * - Otherwise, it picks a completely random available column.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @returns {Promise<number|null>} A promise that resolves to the index of the chosen column, or null if no moves are available.
   */
  async chooseMove(board) {
    const available = this.getAvailableMoves(board);
    if (available.length === 0) return Promise.resolve(null); 

    // 30% chance to play defensively
    if (Math.random() < 0.3) {
      const defendCol = this.findDefensiveMove(board, available);
      if (defendCol !== null) return Promise.resolve(defendCol); 
    }

    // 20% chance to play offensively (go for the win)
    if (Math.random() < 0.2) {
      const winCol = this.findWinningMove(board, available);
      if (winCol !== null) return Promise.resolve(winCol); 
    }
    
    // Fallback: completely random move
    return Promise.resolve(available[Math.floor(Math.random() * available.length)]);
  }
  
  /**
   * Scans available columns to find a move that results in an immediate win for the bot.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @param {Array<number>} available - An array of available column indices.
   * @returns {number|null} The column index that leads to a win, or null if none exists.
   */
  findWinningMove(board, available) {
    for (const col of available) {
      const testBoard = this.makeMove(board, col);
      if (testBoard && this.checkWinner(testBoard) === this.symbol) {
        return col;
      }
    }
    return null;
  }

  /**
   * Scans available columns to find a move that would block the opponent from winning on their next turn.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @param {Array<number>} available - An array of available column indices.
   * @returns {number|null} The column index required to block the opponent, or null if not applicable.
   */
  findDefensiveMove(board, available) {
    for (const col of available) {
      const testBoard = board.map(r => [...r]);
      for (let row = this.rows - 1; row >= 0; row--) {
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

  /**
   * Retrieves all columns that are not completely full.
   * @param {Array<Array<string|null>>} board - The current game board.
   * @returns {Array<number>} An array of indices representing available columns.
   */
  getAvailableMoves(board) {
    return board[0]
      .map((cell, col) => cell === null ? col : null)
      .filter(col => col !== null);
  }

  /**
   * Checks the board for four consecutive pieces in a horizontal row.
   * @param {Array<Array<string|null>>} board - The board to evaluate.
   * @returns {string|null} The symbol of the winner, or null.
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
   * Checks the board for four consecutive pieces in a vertical column.
   * @param {Array<Array<string|null>>} board - The board to evaluate.
   * @returns {string|null} The symbol of the winner, or null.
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
   * Checks the board for four consecutive pieces in a diagonal line (top-left to bottom-right).
   * @param {Array<Array<string|null>>} board - The board to evaluate.
   * @returns {string|null} The symbol of the winner, or null.
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
   * Checks the board for four consecutive pieces in a diagonal line (bottom-left to top-right).
   * @param {Array<Array<string|null>>} board - The board to evaluate.
   * @returns {string|null} The symbol of the winner, or null.
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
   * Evaluates the entire board to determine if a winning condition has been met.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winning player, or null if the game is still ongoing.
   */
  checkWinner(board) {
    return this.checkHorizontal(board) || this.checkVertical(board) || 
           this.checkDiagonalDown(board) || this.checkDiagonalUp(board);
  }
}