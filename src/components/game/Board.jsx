/**
 * Props for the Board component.
 * @typedef {Object} BoardProps
 * @property {Array<Array<string|null>>} board - A 2D array representing the current state of the game grid (null for empty, 'player' or 'bot' for pieces).
 * @property {Function} onColumnClick - Callback function triggered when a player clicks on a specific column. Passes the column index.
 * @property {string} [playerColor] - Hex code or CSS color string for the player's pieces. Defaults to '#FF0000' (Red).
 * @property {string} [botColor] - Hex code or CSS color string for the bot's pieces. Defaults to '#FFFF00' (Yellow).
 */

/**
 * Renders the interactive visual game board for Connect Four.
 * Maps through the 2D board array to display empty slots, player pieces, and bot pieces
 * with corresponding colors, animations, and hover effects.
 * * @component
 * @category Components
 * @param {BoardProps} props - The component properties.
 * @returns {JSX.Element} The rendered game board interface.
 */
export default function Board({ board, onColumnClick, playerColor, botColor }) {
  
  const pColor = playerColor || '#FF0000';
  const bColor = botColor || '#FFFF00';

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">
      <div className="relative">

        <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl blur-xl opacity-40"></div>
        

        <div className="relative bg-gradient-to-b from-blue-600 to-blue-800 rounded-3xl p-3 shadow-2xl">

          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
          </div>


          <div className="grid gap-2 bg-gradient-to-b from-blue-500 to-blue-700 p-4 rounded-2xl shadow-inner">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {row.map((cell, colIdx) => (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => onColumnClick(colIdx)}
                    className="relative group transition-all duration-200 hover:scale-110 active:scale-95"
                  >

                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-900 shadow-lg flex items-center justify-center overflow-hidden group-hover:shadow-xl group-hover:from-blue-300 transition-all">

                      {cell === null && (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full border border-blue-400 shadow-inner"></div>
                      )}
                      
                      {cell === 'player' && (
                        <div className="relative w-12 h-12 md:w-16 md:h-16">
                          <div 
                            className="w-full h-full rounded-full shadow-2xl border-2 border-white animate-pulse"
                            style={{ 
                              backgroundColor: pColor,
                              boxShadow: `0 0 20px ${pColor}, 0 0 40px ${pColor}80`
                            }}
                          ></div>
                          <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ backgroundColor: pColor }}></div>
                        </div>
                      )}
                      
                      {cell === 'bot' && (
                        <div className="relative w-12 h-12 md:w-16 md:h-16">
                          <div 
                            className="w-full h-full rounded-full shadow-2xl border-2 border-white animate-pulse"
                            style={{ 
                              backgroundColor: bColor,
                              boxShadow: `0 0 20px ${bColor}, 0 0 40px ${bColor}80`
                            }}
                          ></div>
                          <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ backgroundColor: bColor }}></div>
                        </div>
                      )}
                    </div>

                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full mx-auto mb-1 animate-bounce"></div>
                      <div className="text-xs font-bold text-white drop-shadow-lg">▼</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>


          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-2xl">
            🎮
          </div>
        </div>


        <div className="text-center mt-12 text-white drop-shadow-lg">
          <p className="text-lg font-bold">Клацніть на колону щоб зробити хід!</p>
        </div>
      </div>
    </div>
  );
}