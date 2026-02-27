import { Player } from "../Player";

/**
 * Class representing a hard-level bot (Expert).
 * Utilizes the Minimax algorithm with Alpha-Beta pruning to foresee
 * multiple moves ahead and calculate the optimal strategy.
 * @class
 * @extends Player
 */
export class HardBot extends Player {
  /**
   * Creates an instance of the hard bot.
   * @param {string} color - The color of the bot's pieces.
   * @param {number} rows - The number of rows on the board.
   * @param {number} columns - The number of columns on the board.
   */
  constructor(color, rows, columns) {
    super('Складний Бот', 'bot', color, rows, columns);
    /**
     * The maximum depth of the Minimax search tree.
     * Higher values increase difficulty but reduce performance.
     * @type {number}
     */
    this.maxDepth = 6; 
  }

  /**
   * Asynchronously calculates the best move using the Minimax algorithm.
   * Wrapped in a setTimeout to prevent blocking the main UI thread during heavy computation.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @returns {Promise<number|null>} A promise that resolves to the optimal column index.
   */
  async chooseMove(board) {
    return new Promise(resolve => {
      setTimeout(() => {
        const available = this.getAvailableMoves(board);
        if (available.length === 0) {
          resolve(null);
          return;
        }

        let bestCol = available[0];
        let bestScore = -Infinity;
        const playerSymbol = 'player'; 

        for (const col of available) {
          const testBoard = this.makeMove(board, col);
          if (!testBoard) continue;

          const score = this.minimax(testBoard, this.maxDepth, -Infinity, Infinity, false, playerSymbol);
          
          if (score > bestScore) {
            bestScore = score;
            bestCol = col;
          }
        }
        resolve(bestCol);
      }, 20); 
    });
  }

  /**
   * Recursive Minimax algorithm with Alpha-Beta pruning.
   * Evaluates the game tree to minimize the possible loss for a worst-case scenario.
   * @param {Array<Array<string|null>>} board - The simulated board state.
   * @param {number} depth - Current depth in the game tree.
   * @param {number} alpha - The best value that the maximizer currently can guarantee at that level or above.
   * @param {number} beta - The best value that the minimizer currently can guarantee at that level or above.
   * @param {boolean} isMaximizing - True if it's the bot's turn to maximize score, false for the opponent.
   * @param {string} playerSymbol - The opponent's symbol.
   * @returns {number} The evaluated score of the board state.
   */
  minimax(board, depth, alpha, beta, isMaximizing, playerSymbol) {
    const winner = this.checkWinner(board);
    
    if (winner === this.symbol) return 10000 - (this.maxDepth - depth);
    if (winner === playerSymbol) return -10000 + (this.maxDepth - depth);
    if (depth === 0 || this.isBoardFull(board)) return this.evaluateBoard(board, playerSymbol);

    const available = this.getAvailableMoves(board);

    if (isMaximizing) { 
      let maxScore = -Infinity;
      for (const col of available) {
        const testBoard = this.makeMove(board, col);
        if (!testBoard) continue;
        
        const score = this.minimax(testBoard, depth - 1, alpha, beta, false, playerSymbol);
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return maxScore;
    } else { 
      let minScore = Infinity;
      
      for (const col of available) {
        const testBoard = board.map(r => [...r]); 
        let row = -1;
        
        for (let r = this.rows - 1; r >= 0; r--) {
          if (testBoard[r][col] === null) {
            row = r;
            break;
          }
        }
        if (row === -1) continue;
        testBoard[row][col] = playerSymbol; 
        
        const score = this.minimax(testBoard, depth - 1, alpha, beta, true, playerSymbol);
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return minScore;
    }
  }

  /**
   * Statically evaluates the board state without looking ahead.
   * Used when the Minimax algorithm reaches its maximum depth.
   * @param {Array<Array<string|null>>} board - The board to evaluate.
   * @param {string} playerSymbol - The opponent's symbol.
   * @returns {number} A heuristic score representing the board's advantage for the bot.
   */
  evaluateBoard(board, playerSymbol) {
    let score = 0;
    const botSymbol = this.symbol; 

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        score += this.evaluateCell(board, row, col, botSymbol) * 2;
        score -= this.evaluateCell(board, row, col, playerSymbol);
      }
    }
    return score;
  }

  /**
   * Evaluates a specific cell by checking all possible lines (horizontal, vertical, diagonal) passing through it.
   * Assigns weights based on the number of consecutive pieces and unblocked paths.
   * @param {Array<Array<string|null>>} board - The current board state.
   * @param {number} r - The row index of the cell.
   * @param {number} c - The column index of the cell.
   * @param {string} symbol - The symbol being evaluated for potential lines.
   * @returns {number} The calculated weight/score for this specific cell.
   */
  evaluateCell(board, r, c, symbol) {
    let score = 0;
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1], 
    ];

    for (const [dr, dc] of directions) {
      let count = 0;
      let blocked = 0;

      for (let i = -3; i <= 3; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;

        if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.columns) {
          blocked++;
          continue;
        }

        if (board[nr][nc] === symbol) {
          count++;
        } else if (board[nr][nc] !== null) {
          blocked++;
        }
      }

      if (blocked === 0) {
        if (count === 1) score += 2;
        if (count === 2) score += 15;
        if (count === 3) score += 700;
        if (count === 4) score += 10000;
      } else if (blocked === 1) {
        if (count === 2) score += 5;
        if (count === 3) score += 100;
      }
    }
    return score;
  }

  /**
   * Returns a list of available columns where a move can be made.
   * @param {Array<Array<string|null>>} board - The current state of the game board.
   * @returns {Array<number>} An array of available column indices.
   */
  getAvailableMoves(board) {
    return board[0]
      .map((cell, col) => (cell === null ? col : null))
      .filter(col => col !== null);
  }

  /**
   * Checks if the board is completely full, resulting in a draw.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {boolean} True if the board is full, false otherwise.
   */
  isBoardFull(board) {
    return board[0].every(cell => cell !== null);
  }

  /**
   * Checks for a horizontal win condition.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if no winner.
   */
  checkHorizontal(board) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col <= this.columns - 4; col++) {
        const cells = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
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
        const cells = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
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
        const cells = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
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
        const cells = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  /**
   * Checks if there is a winner on the given board by evaluating all possible directions.
   * @param {Array<Array<string|null>>} board - The board to check.
   * @returns {string|null} The symbol of the winner, or null if the game continues.
   */
  checkWinner(board) {
    return (
      this.checkHorizontal(board) ||
      this.checkVertical(board) ||
      this.checkDiagonalDown(board) ||
      this.checkDiagonalUp(board)
    );
  }
}