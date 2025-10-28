export class Player {
  // 1. Приймаємо 'rows' та 'columns'
  constructor(name, symbol, color, rows, columns) {
    this.name = name;
    this.symbol = symbol;
    this.color = color || null;
    // 2. Зберігаємо їх
    this.rows = rows || 6;
    this.columns = columns || 7;
  }

  makeMove(board, col) {
    // 3. Використовуємо 'this.rows - 1' (індекс останнього рядка) замість '5'
    for (let row = this.rows - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = this.symbol;
        return newBoard;
      }
    }
    return null;
  }
}