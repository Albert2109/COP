import React from 'react';

/**
 * Props for the ResultInfo component.
 * @typedef {Object} ResultInfoProps
 * @property {string|null} winner - The outcome of the match ('player', 'bot', or 'draw').
 * @property {string} time - The formatted string of the total time played (e.g., "05:12").
 * @property {string} [botLevel] - The difficulty level of the bot ('easy', 'medium', 'hard'). Relevant only if mode is 'bot'.
 * @property {string} mode - The type of game played ('online' or 'bot').
 */

/**
 * Renders a summary card displaying the results of a completed game session.
 * Shows the outcome (win/loss/draw), the game mode or bot difficulty, and the total elapsed time.
 * Designed with a glassmorphism effect and dark mode support.
 * @component
 * @category Components
 * @param {ResultInfoProps} props - The component properties.
 * @returns {JSX.Element} The rendered result information card.
 */
export default function ResultInfo({ winner, time, botLevel, mode }) {
  
  const getWinnerText = () => {
    if (winner === 'draw') return '🤝 Нічия!';
    if (winner === 'player') return '🎉 Перемога!';
    if (winner === 'bot') return '💀 Поразка';
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
  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm mx-auto text-center animate-fadeIn">
    <h4 className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mb-2 drop-shadow-md">
      {getWinnerText()}
    </h4>

    <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
      {getModeText()}
    </p>

    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-800 dark:text-gray-200 font-medium shadow-inner">
      <span>⏱ Час гри:</span>
      <span className="font-bold text-gray-900 dark:text-white">{time}</span>
    </div>
  </div>
);
}