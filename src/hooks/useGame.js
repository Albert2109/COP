import { useState, useCallback } from 'react';
import { Game } from '../classes/Game';

export function useGame() {
  const [gameState, setGameState] = useState(() => {
    const game = new Game();
    return {
      game,
      ...game.getState()
    };
  });

  const playerMove = useCallback((col) => {
    setGameState(prev => {
      const { game } = prev;
      game.playerMove(col);
      return {
        game,
        ...game.getState()
      };
    });
  }, []);

  const botMove = useCallback(() => {
    setGameState(prev => {
      const { game } = prev;
      game.botMove();
      return {
        game,
        ...game.getState()
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => {
      const { game } = prev;
      game.reset();
      return {
        game,
        ...game.getState()
      };
    });
  }, []);

  return {
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    winner: gameState.winner,
    playerMove,
    botMove,
    resetGame
  };
}