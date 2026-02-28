import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../hooks/game/useGame';
import { formatTime } from '../../helper/formatTime';
import { useGameTimer } from '../../hooks/game/useGameTimer';
import Board from './Board';
import GameEndPortal from './GameEndPortal/GameEndPortal'; 

/**
 * Props for the OnlineGame component.
 * @typedef {Object} OnlineGameProps
 * @property {Object} settings - Game configuration settings (e.g., player/bot colors).
 * @property {Object|null} connection - The active SignalR WebSocket connection instance.
 * @property {string} connectionId - The unique identifier for the local player's network connection.
 * @property {string} roomCode - The specific room code where the multiplayer match is taking place.
 * @property {Function} onGoToSettings - Callback to navigate back to the game settings menu.
 * @property {Function} onGoToResults - Callback to navigate to the session results page.
 * @property {boolean} opponentLeft - Flag indicating whether the opponent has disconnected or left the room.
 * @property {boolean} opponentWantsRestart - Flag indicating the opponent has proposed a rematch.
 * @property {Function} onRestartApproved - Callback triggered when the local player accepts a rematch request.
 * @property {boolean} isGameFinished - Flag indicating if the current match has officially concluded.
 */

/**
 * Renders the multiplayer game interface and manages real-time synchronization.
 * Uses SignalR (via the `connection` prop) to send and receive moves, handle opponent 
 * disconnections, and manage game restarts within a specific matchmaking room.
 * 
 * * @component
 * @category Components
 * @param {OnlineGameProps} props - The component properties.
 * @returns {JSX.Element} The rendered multiplayer game interface.
 */
export default function OnlineGame({
  settings, 
  connection, connectionId, roomCode,
  onGoToSettings, onGoToResults, 
  opponentLeft, opponentWantsRestart,
  onRestartApproved,
  isGameFinished 
}) {
    const {
        board, currentPlayer, winner,
        playerMove, botMove 
    } = useGame(settings);

    const [time, setTime] = useState(0); 
    const formattedTime = formatTime(time);
    useGameTimer(!winner && !opponentLeft, setTime);

    useEffect(() => {
        if (isGameFinished) return; 

        const moveHandler = (playerConnectionId, column) => {
            if (playerConnectionId !== connectionId) {
                botMove(column); 
            }
        };
        if (connection) {
            connection.on("MoveMade", moveHandler); 
        }
        return () => {
            connection?.off("MoveMade", moveHandler); 
        };
    }, [connection, connectionId, botMove, isGameFinished]); 

    useEffect(() => {
        if (winner && !opponentLeft && !isGameFinished) {
            console.log(`Detected winner: ${winner}. Notifying server...`);
            connection?.invoke("NotifyGameEnd", roomCode)
                .catch(err => console.error("Failed to notify server of game end:", err));
        }
    }, [winner, opponentLeft, isGameFinished, connection, roomCode]); 


    const handleColumnClick = (col) => {
        if (currentPlayer === 'player' && !winner && !opponentLeft && !isGameFinished) {
            playerMove(col); 
            connection?.invoke("MakeMove", roomCode, col) 
                .catch(err => console.error("Failed to send move: ", err));
        }
    };

    const handlePlayAgain = useCallback(() => {
        console.log("Requesting restart via SignalR...");
        connection?.invoke("RequestRestart", roomCode) 
           .catch(err => console.error("Failed to request restart:", err));
        
        onRestartApproved(); 

    }, [connection, roomCode, onRestartApproved]);

    const handleEndGame = useCallback(() => {
        onGoToResults();
    }, [onGoToResults]);

    const handleChangeSettings = useCallback(() => {
        onGoToSettings();
    }, [onGoToSettings]);


    return (
        <div className="game-container">
            <div className="game-header">
                <h2>{currentPlayer === 'player' ? '👤 Ваш хід' : '⏳ Хід опонента'}</h2>
                <div className="game-info">
                    <span>Час гри:</span>
                    <strong>{formattedTime}</strong>
                </div>
                <div className="room-info" style={{marginTop: '10px', fontSize: '0.9rem', color: '#555'}}>
                    Кімната: {roomCode}
                </div>
            </div>

            {opponentWantsRestart && !isGameFinished && !opponentLeft && (
                 <div className="alert alert-info text-center small py-1 mb-2">
                      Опонент пропонує грати ще раз!
                 </div>
             )}

             {opponentLeft && !winner && (
                  <div className="alert alert-warning text-center">
                      <h2>Опонент покинув гру</h2>
                      <button className="btn btn-primary mt-2" onClick={handleEndGame}>
                          Переглянути результати
                      </button>
                  </div>
             )}

            {winner && isGameFinished && ( 
                <div className={`alert ${winner === 'player' ? 'alert-success' : (winner === 'draw' ? 'alert-info' : 'alert-danger')}`}>
                    {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Ви програли!'}
                </div>
            )}


            <Board
                board={board}
                onColumnClick={currentPlayer !== 'player' || winner || opponentLeft || isGameFinished ? () => {} : handleColumnClick} 
                playerColor={settings.playerColor}
                botColor={settings.botColor}
            />

            <GameEndPortal
                isOpen={isGameFinished && !opponentLeft}
                winner={winner} 
                time={formattedTime}
                botLevel={null} 
                isOnline={true} 
                onPlayAgain={handlePlayAgain}
                EndGame={handleEndGame}
                onChangeSettings={handleChangeSettings}
            />
        </div>
    );
}