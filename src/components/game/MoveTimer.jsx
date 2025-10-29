import React from 'react';

export default function MoveTimer({ timeLeft, moveTimeLimit }) {
  const timePercentage = timeLeft ? (timeLeft / moveTimeLimit) * 100 : 100;
  const timeColor = timePercentage > 50 ? '#4CAF50' : timePercentage > 25 ? '#FFC107' : '#f44336';
  const resetTransition = timeLeft === moveTimeLimit;

  return (
    <div className="move-timer">
      <div 
        className="timer-bar" 
        style={{
          width: `${timePercentage}%`,
          backgroundColor: timeColor,
          transition: resetTransition ? 'none' : 'all 0.3s ease'
        }}
      />
      <span className="timer-text">{timeLeft}s</span>
    </div>
  );
}