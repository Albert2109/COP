import { Player } from "./Player";

export class HardBot extends Player {
  constructor(color) {
    super('Складний Бот', 'bot', color);
    this.maxDepth = 6;
  }

 async chooseMove(board) {
    // Обгортаємо всю логіку в Promise
    return new Promise(resolve => {
      
      // setTimeout(..., 20) дає браузеру час оновити UI (таймер)
      // перед тим, як ми почнемо важкі розрахунки minimax
      setTimeout(() => {
        const available = this.getAvailableMoves(board);
        if (available.length === 0) {
          resolve(null);
          return;
        }

        let bestCol = available[0];
        let bestScore = -Infinity;

        // Символ 'player' тут жорстко заданий, це нормально,
        // оскільки ми знаємо, що наш опонент - це 'player'
        const playerSymbol = 'player'; 

        for (const col of available) {
          const testBoard = this.makeMove(board, col);
          if (!testBoard) continue;

          // 'false' означає, що наступний хід робить 'min' (гравець)
          const score = this.minimax(testBoard, this.maxDepth, -Infinity, Infinity, false, playerSymbol);
          
          if (score > bestScore) {
            bestScore = score;
            bestCol = col;
          }
        }
        
        // Вирішуємо Promise з найкращим ходом
        resolve(bestCol);
      }, 20); // Невелика затримка у 20мс
    });
  }

  minimax(board, depth, alpha, beta, isMaximizing, playerSymbol) {
    const winner = this.checkWinner(board);
    
    // 'this.symbol' - це символ нашого бота ('bot')
    if (winner === this.symbol) return 10000 - (this.maxDepth - depth);
    if (winner === playerSymbol) return -10000 + (this.maxDepth - depth);
    if (depth === 0 || this.isBoardFull(board)) return this.evaluateBoard(board, playerSymbol);

    const available = this.getAvailableMoves(board);

    if (isMaximizing) { // Хід Максимізатора (Бота)
      let maxScore = -Infinity;
      for (const col of available) {
       
        const testBoard = this.makeMove(board, col);
        if (!testBoard) continue;
        
        const score = this.minimax(testBoard, depth - 1, alpha, beta, false, playerSymbol);
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        
        if (beta <= alpha) break;
      }
      return maxScore;
    } else { 
      let minScore = Infinity;
      
      for (const col of available) {

        const testBoard = board.map(r => [...r]); 
        let row = -1;
        for (let r = 5; r >= 0; r--) {
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
        
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  evaluateBoard(board, botSymbol) {
    let score = 0;
    const playerSymbol = 'player';

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        score += this.evaluateCell(board, row, col, botSymbol) * 2;
        score -= this.evaluateCell(board, row, col, playerSymbol);
      }
    }

    return score;
  }

  evaluateCell(board, r, c, symbol) {
    let score = 0;
    const directions = [
      [0, 1],  
      [1, 0],  
      [1, 1],  
      [1, -1], 
    ];

    for (const [dr, dc] of directions) {
      let count = 0;
      let blocked = 0;

      for (let i = -3; i <= 3; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;

        if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7) {
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
      } 

      else if (blocked === 1) {
        if (count === 2) score += 5;
        if (count === 3) score += 100;
      }
    }

    return score;
  }

  getAvailableMoves(board) {
    return board[0]
      .map((cell, col) => (cell === null ? col : null))
      .filter(col => col !== null);
  }

  isBoardFull(board) {
    return board[0].every(cell => cell !== null);
  }

  checkHorizontal(board) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        const cells = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
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
        const cells = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
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
        const cells = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
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
        const cells = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkWinner(board) {
    return (
      this.checkHorizontal(board) ||
      this.checkVertical(board) ||
      this.checkDiagonalDown(board) ||
      this.checkDiagonalUp(board)
    );
  }
}
