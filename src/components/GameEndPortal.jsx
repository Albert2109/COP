import ReactDOM from 'react-dom';
import './GameEndPortal.css';

export default function GameEndPortal({ 
  isOpen, 
  winner, 
  time, 
  onPlayAgain, 
  onChangeSettings,
  botLevel
}) {
  if (!isOpen) return null;

  const getWinnerText = () => {
    if (winner === 'draw') return '🤝 Нічия!';
    if (winner === 'player') return '🎉 Ви перемогли!';
    if (winner === 'bot') return '🤖 Бот переміг!';
    return 'Гра закінчилась';
  };

  const getLevelText = () => {
    switch(botLevel) {
      case 'easy': return 'проти Легкого бота';
      case 'medium': return 'проти Середнього бота';
      case 'hard': return 'проти Важкого бота';
      default: return '';
    }
  };

  const portal = ReactDOM.createPortal(
    <div className="portal-overlay">
      <div className="game-end-modal">
        <div className="modal-header">
          <h2>{getWinnerText()}</h2>
        </div>

        <div className="modal-body">
          <div className="result-info">
            <p className="level-info">{getLevelText()}</p>
            <div className="time-stats">
              <span className="stat-label">Час гри:</span>
              <span className="stat-value">{time}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-success btn-lg" 
            onClick={onPlayAgain}
          >
            ▶️ Грати ще раз
          </button>
          <button 
            className="btn btn-secondary btn-lg" 
            onClick={onChangeSettings}
          >
            ⚙️ Нові налаштування
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return portal;
}