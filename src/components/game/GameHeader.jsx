import React from 'react';
export default function GameHeader({ currentPlayer, formattedTime }) {
  return (
    <div className="game-header">
      <h2>Гра йде...</h2>
      <div className="game-info">
        <div className="info-item">
          <span>Черга:</span>
          <strong>{currentPlayer === 'player' ? '👤 Ваша' : '🤖 Бота'}</strong>
        </div>
        <div className="info-item">
          <span>Час гри:</span>
          <strong>{formattedTime}</strong>
        </div>
      </div>
    </div>
  );
}