import { Player } from "./Player";

import { Bot } from "./Bot";

export class Game {
  constructor() {
    this.board = Array(6).fill(null).map(() => Array(7).fill(null));
    this.currentPlayer = 'player';
    this.winner = null;
    this.players = {
      player: new Player('Гравець', 'player'),
      bot: new Bot()
    };
  }

  isValidMove(col) {
    return col >= 0 && col < 7 && this.board[0][col] === null;
  }

  getAvailableMoves() {
    return this.board[0]
      .map((cell, col) => cell === null ? col : null)
      .filter(col => col !== null);
  }

  playerMove(col) {
    if (this.winner) return false;
    if (!this.isValidMove(col)) return false;

    this.board = this.players.player.makeMove(this.board, col);

    if (this.checkWinner()) {
      this.winner = this.players.player.symbol;
      return true;
    }

    this.currentPlayer = 'bot';
    return true;
  }

  botMove() {
    if (this.winner) return false;

    const col = this.players.bot.chooseMove(this.board);
    if (col === null) return false;

    this.board = this.players.bot.makeMove(this.board, col);

    if (this.checkWinner()) {
      this.winner = this.players.bot.symbol;
      return true;
    }

    this.currentPlayer = 'player';
    return true;
  }

  checkHorizontal() {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        const cells = [this.board[row][col], this.board[row][col+1], 
                       this.board[row][col+2], this.board[row][col+3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkVertical() {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= 2; row++) {
        const cells = [this.board[row][col], this.board[row+1][col], 
                       this.board[row+2][col], this.board[row+3][col]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkDiagonalDown() {
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 3; col++) {
        const cells = [this.board[row][col], this.board[row+1][col+1], 
                       this.board[row+2][col+2], this.board[row+3][col+3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkDiagonalUp() {
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        const cells = [this.board[row][col], this.board[row-1][col+1], 
                       this.board[row-2][col+2], this.board[row-3][col+3]];
        if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
          return cells[0];
        }
      }
    }
    return null;
  }

  checkWinner() {
    this.winner = this.checkHorizontal() || this.checkVertical() || 
                  this.checkDiagonalDown() || this.checkDiagonalUp();
    return this.winner;
  }

  reset() {
    this.board = Array(6).fill(null).map(() => Array(7).fill(null));
    this.currentPlayer = 'player';
    this.winner = null;
  }

  getState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      availableMoves: this.getAvailableMoves()
    };
  }
}