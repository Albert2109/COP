import ReactDOM from 'react-dom';

/**
 * Пропси для компонента GameEndPortal.
 * @typedef {Object} GameEndPortalProps
 * @property {boolean} isOpen - Визначає, чи видимий портал завершення гри.
 * @property {string|null} winner - Результат гри ('player', 'bot' або 'draw').
 * @property {string} time - Відформатований рядок із загальним часом гри (наприклад, "02:45").
 * @property {Function} onPlayAgain - Функція для миттєвого перезапуску матчу з тими ж налаштуваннями.
 * @property {Function} onChangeSettings - Функція для повернення до конфігурації налаштувань.
 * @property {Function} EndGame - Функція для повного виходу з поточної ігрової сесії.
 * @property {string} [botLevel] - (Опціонально) Рівень складності бота-супротивника ('easy', 'medium', 'hard').
 */

/**
 * A modal portal component displayed when a game session ends.
 * Renders over the entire application using ReactDOM.createPortal to avoid z-index issues.
 * Displays the result of the game (winner/draw), the elapsed time, bot difficulty, 
 * and provides actions for the next steps.
 * * @component
 * @category Components
 * @param {GameEndPortalProps} props - Об'єкт із пропсами компонента.
 * @returns {React.ReactPortal|null} The rendered portal attached to document.body, or null if the modal is closed.
 */
export default function GameEndPortal({ 
  isOpen, 
  winner, 
  time, 
  onPlayAgain, 
  onChangeSettings,
  EndGame,
  botLevel
}) {
  if (!isOpen) return null;

  const getWinnerText = () => {
    if (winner === 'draw') return '🤝 Нічия!';
    if (winner === 'player') return '🎉 Ви перемогли!';
    if (winner === 'bot') return '🤖 Бот переміг!';
    return 'Гра закінчилась';
  };

  const getWinnerEmoji = () => {
    if (winner === 'draw') return '🤝';
    if (winner === 'player') return '🏆';
    if (winner === 'bot') return '🤖';
    return '🎮';
  };

  const getLevelText = () => {
    switch(botLevel) {
      case 'easy': return 'проти Легкого бота';
      case 'medium': return 'проти Середнього бота';
      case 'hard': return 'проти Важкого бота';
      default: return '';
    }
  };

  const isPlayerWon = winner === 'player';
  const isDrawGame = winner === 'draw';
  const isBotWon = winner === 'bot';

  const portal = ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <div className={`absolute -inset-2 bg-gradient-to-r ${
          isPlayerWon 
            ? 'from-green-400 to-emerald-500' 
            : isDrawGame 
            ? 'from-blue-400 to-cyan-500'
            : 'from-orange-400 to-red-500'
        } rounded-3xl blur-xl opacity-50 animate-pulse`}></div>

        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${
            isPlayerWon 
              ? 'from-green-500 to-emerald-600' 
              : isDrawGame 
              ? 'from-blue-500 to-cyan-600'
              : 'from-orange-500 to-red-600'
          } p-8 text-white text-center`}>
            <div className="text-7xl mb-4 animate-bounce">
              {getWinnerEmoji()}
            </div>
            <h2 className="text-4xl font-black drop-shadow-lg">
              {getWinnerText()}
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-700 font-bold text-lg mb-2">
                {getLevelText()}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-bold">⏱️ Час гри:</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                    {time}
                  </span>
                </div>
              </div>

              <div className={`bg-gradient-to-r ${
                isPlayerWon 
                  ? 'from-green-50 to-emerald-50' 
                  : isDrawGame 
                  ? 'from-purple-50 to-pink-50'
                  : 'from-orange-50 to-red-50'
              } rounded-2xl p-4 border-2 ${
                isPlayerWon 
                  ? 'border-green-200' 
                  : isDrawGame 
                  ? 'border-purple-200'
                  : 'border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-bold">📊 Результат:</span>
                  <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${
                    isPlayerWon 
                      ? 'from-green-600 to-emerald-600' 
                      : isDrawGame 
                      ? 'from-purple-600 to-pink-600'
                      : 'from-orange-600 to-red-600'
                  }`}>
                    {isPlayerWon ? '✓ ПЕРЕМОГА' : isDrawGame ? '≈ НІЧИЯ' : '✗ ПОРАЗКА'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full"></div>
              <span className="text-2xl">🎮</span>
              <div className="flex-1 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full"></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 space-y-3">
            <button 
              onClick={onPlayAgain}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              ▶️ Грати ще раз
            </button>

            <button 
              onClick={onChangeSettings}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              ⚙️ Нові налаштування
            </button>

            <button 
              onClick={EndGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              🚪 Закінчити гру
            </button>
          </div>

          {isPlayerWon && (
            <>
              <div className="absolute top-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</div>
              <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
              <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</div>
              <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return portal;
}