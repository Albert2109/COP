export class Player {

  constructor(name, symbol, color) {
    this.name = name;
    this.symbol = symbol;
    this.color = color || null; 
  }

  makeMove(board, col) {
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = this.symbol;
        return newBoard;
      }
    }
    return null;
  }
}