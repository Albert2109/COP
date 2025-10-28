import React from 'react';

export default function ResultInfo({ winner, time, botLevel, mode }) {
  

  const getWinnerText = () => {
    if (winner === 'draw') return '🤝 Нічия!';
    if (winner === 'player') return '🎉 Перемога!';
    if (winner === 'bot') return '🤖 Поразка';
    return 'Гра закінчилась';
  };


  const getModeText = () => {
    if (mode === 'online') return 'Онлайн гра';
    if (mode === 'bot') {
      switch(botLevel) {
        case 'easy': return 'проти Легкого бота';
        case 'medium': return 'проти Середнього бота';
        case 'hard': return 'проти Важкого бота';
        default: return 'Гра проти бота';
      }
    }
    return 'Невідомий режим';
  };

  return (
    <div>
      <h4 style={{ marginBottom: '10px' }}>{getWinnerText()}</h4>
      <p style={{ color: '#333', margin: 0, fontSize: '1.1rem' }}>
        {getModeText()}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '1rem' }}>
        <span style={{ color: '#555' }}>Час гри:</span>
        <span style={{ fontWeight: 'bold', color: '#000' }}>{time}</span>
      </div>
    </div>
  );
}