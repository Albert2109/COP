import { Player } from '../Player.js';

/**
 * Base Bot class for the Connect Four game.
 * Analyzes the current board state and uses basic heuristic evaluation
 * to block the opponent or choose the most advantageous position.
 * @class
 * @extends Player
 */
export class Bot extends Player {
  /**
   * Creates an instance of the base Bot.
   * @param {string} color - The color of the bot's pieces ('red' or 'yellow').
   * @param {number} rows - The number of rows on the game board.
   * @param {number} columns - The number of columns on the game board.
   */
  constructor(color, rows, columns) {
    super('Бот', 'bot', color, rows, columns);
  }

  /**
   * Asynchronously calculates the best move for the bot.
   * First, it checks for an immediate winning move, then it attempts to block
   * the opponent's winning move. If neither, it chooses the move with the highest heuristic score.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @returns {Promise<number|null>} A promise that resolves to the index of the chosen column, or null if no moves are available.
   */
  async chooseMove(board) {
    const available = this.getAvailableMoves(board);
    if (available.length === 0) return null;

    // 1. Try to find a winning move for the bot
    for (const col of available) {
      const testBoard = this.makeMove(board, col);
      if (testBoard && this.checkWinner(testBoard) === this.symbol) {
        return Promise.resolve(col); 
      }
    }

    // 2. Try to block the opponent's winning move
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

    // 3. Evaluate positions to find the best alternative move
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
  
  /**
   * Returns a list of available columns where a move can be made.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @returns {Array<number>} An array of available column indices.
   */
  getAvailableMoves(board) {
    return board[0]
      .map((cell, col) => cell === null ? col : null)
      .filter(col => col !== null);
  }

  /**
   * Checks for a horizontal win condition.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if no winner.
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
   * Checks for a vertical win condition.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if no winner.
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
   * Checks for a diagonal win condition (top-left to bottom-right).
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if no winner.
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
   * Checks for a diagonal win condition (bottom-left to top-right).
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if no winner.
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
   * Checks if there is a winner on the given board.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if the game continues.
   */
  checkWinner(board) {
    return this.checkHorizontal(board) || this.checkVertical(board) || 
           this.checkDiagonalDown(board) || this.checkDiagonalUp(board);
  }

  /**
   * Evaluates the desirability of a specific cell position based on potential winning lines.
   * Awards points for consecutive pieces of the given symbol.
   * @param {Array<Array<string|null>>} board - The current state of the board.
   * @param {number} col - The column index to evaluate.
   * @param {string} symbol - The symbol of the player/bot to evaluate for.
   * @returns {number} A heuristic score representing the strength of the position.
   */
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