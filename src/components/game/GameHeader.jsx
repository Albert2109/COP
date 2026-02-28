import React from 'react';

/**
 * Props for the GameHeader component.
 * @typedef {Object} GameHeaderProps
 * @property {string} currentPlayer - Identifier for whose turn it currently is ('player' or 'bot').
 * @property {string} formattedTime - The total elapsed time of the game, formatted as a string (e.g., "01:23").
 */

/**
 * Renders the top status bar during active gameplay.
 * Displays the current turn indicator (Player vs. Bot) and the elapsed game time,
 * utilizing dynamic CSS classes for pulse and bounce animations to reflect the game state.
 * 
 * @component
 * @category Components
 * @param {GameHeaderProps} props - The component properties.
 * @returns {JSX.Element} The rendered game header interface.
 */
export default function GameHeader({ currentPlayer, formattedTime }) {
  const isPlayerTurn = currentPlayer === 'player';

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-6 md:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg flex items-center justify-center gap-3">
          <span className="animate-bounce">🎮</span>
          Гра йде...
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎮</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className={`relative group transition-all duration-300`}>
          <div className={`absolute -inset-1 bg-gradient-to-r ${
            isPlayerTurn 
              ? 'from-green-400 to-emerald-500' 
              : 'from-yellow-400 to-orange-500'
          } rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-all`}></div>

          <div className={`relative bg-white rounded-2xl p-6 shadow-2xl transition-all duration-300 ${
            isPlayerTurn ? 'border-2 border-green-500' : 'border-2 border-yellow-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-bold text-sm uppercase tracking-wide mb-2">
                  ⚡ Черга гравця
                </p>
                <p className={`text-3xl font-black ${
                  isPlayerTurn 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600'
                }`}>
                  {isPlayerTurn ? '👤 ВАША ЧЕРГА' : '🤖 ХІД БОТА'}
                </p>
              </div>
              <div className={`text-6xl animate-pulse ${
                isPlayerTurn ? 'animate-bounce' : ''
              }`}>
                {isPlayerTurn ? '👤' : '🤖'}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <div className={`h-2 flex-1 rounded-full ${
                isPlayerTurn 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' 
                  : 'bg-gray-300'
              }`}></div>
              <div className={`h-2 flex-1 rounded-full ${
                !isPlayerTurn 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                  : 'bg-gray-300'
              }`}></div>
            </div>
          </div>
        </div>


        <div className="relative group transition-all duration-300">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>

          <div className="relative bg-white rounded-2xl p-6 shadow-2xl border-2 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-bold text-sm uppercase tracking-wide mb-2">
                  ⏱️ Час гри
                </p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  {formattedTime}
                </p>
              </div>
              <div className="text-6xl animate-pulse">
                ⏱️
              </div>
            </div>

            <div className="mt-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  style={{
                    opacity: i < 3 ? 1 : 0.3,
                    animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        {isPlayerTurn ? (
          <div className="bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-xl py-3 px-4">
            <p className="text-green-100 font-bold text-sm">
              ✓ Виберіть колону щоб зробити хід!
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-xl py-3 px-4 animate-pulse">
            <p className="text-yellow-100 font-bold text-sm">
              ⏳ Бот думає над ходом...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}