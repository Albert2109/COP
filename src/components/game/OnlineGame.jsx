import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../hooks/game/useGame';
import { formatTime } from '../../helper/formatTime';
import { useGameTimer } from '../../hooks/game/useGameTimer';
import Board from './Board';
import GameEndPortal from './GameEndPortal/GameEndPortal'; 

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