import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../hooks/game/useGame';
import { formatTime } from '../../helper/formatTime';
import { useGameTimer } from '../../hooks/game/useGameTimer';
import Board from './Board';
import GameEndPortal from './GameEndPortal';

export default function OnlineGame({
  settings, 
  connection, connectionId, roomCode,
  onGoToSettings, onGoToResults, onGameFinished,
  opponentLeft, opponentWantsRestart
}) {
    const {
        board, currentPlayer, winner,
        playerMove, botMove 
    } = useGame(settings);

    const [time, setTime] = useState(0); 
    const [showEndPortal, setShowEndPortal] = useState(false); 
    const formattedTime = formatTime(time);
    useGameTimer(!winner && !opponentLeft, setTime);


    useEffect(() => {
        const moveHandler = (playerConnectionId, column) => {
            if (playerConnectionId !== connectionId) {
                console.log(`Received move from opponent: col ${column}`);
                botMove(column); 
            }
        };
        if (connection) {
            connection.on("MoveMade", moveHandler); 
        }
        return () => {
            connection?.off("MoveMade", moveHandler); 
        };
    }, [connection, connectionId, botMove]); 


    useEffect(() => {
        if (winner && !opponentLeft) {
            console.log(`Game ended. Winner: ${winner}. Saving result.`);
            onGameFinished({ winner, time: formattedTime }); 
            setShowEndPortal(true); 
        }
    }, [winner, onGameFinished, formattedTime, opponentLeft]); 


    const handleColumnClick = (col) => {
        if (currentPlayer === 'player' && !winner && !opponentLeft) {
            console.log(`Player move: col ${col}`);
            playerMove(col); 
            connection?.invoke("MakeMove", roomCode, col) 
                .catch(err => console.error("Failed to send move: ", err));
        } else {
            console.warn(`Move blocked: currentPlayer=${currentPlayer}, winner=${winner}, opponentLeft=${opponentLeft}`);
        }
    };



    const handlePlayAgain = useCallback(() => {
        console.log("Requesting restart via SignalR...");
        setShowEndPortal(false); 
        setTime(0); 
        connection?.invoke("RequestRestart", roomCode) 
           .catch(err => console.error("Failed to request restart:", err));
    }, [connection, roomCode]); 

    const handleEndGame = useCallback(() => {
        console.log("Ending game session, navigating to results.");
        setShowEndPortal(false);
        onGoToResults();
    }, [onGoToResults]);

    const handleChangeSettings = useCallback(() => {
        console.warn("Navigating to settings from online game (will disconnect).");
        setShowEndPortal(false);
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

            {opponentWantsRestart && !showEndPortal && !opponentLeft && (
                 <div className="alert alert-info text-center small py-1 mb-2">
                      Опонент пропонує грати ще раз! Якщо згодні, натисніть "Грати ще раз" у вікні результатів (коли гра завершиться).
                 </div>
             )}

             {opponentLeft && !winner && (
                  <div className="alert alert-warning text-center">
                      <h2>Опонент покинув гру</h2>
                      <p>Ви можете завершити сесію та переглянути результати.</p>
                      <button className="btn btn-primary mt-2" onClick={handleEndGame}>
                          Переглянути результати
                      </button>
                  </div>
             )}

            {winner && (
                <div className={`alert ${winner === 'player' ? 'alert-success' : (winner === 'draw' ? 'alert-info' : 'alert-danger')}`}>
                    {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Ви програли!'}
                </div>
            )}

            <Board
                board={board}
                onColumnClick={currentPlayer !== 'player' || winner || opponentLeft ? () => {} : handleColumnClick}
                playerColor={settings.playerColor}
                botColor={settings.botColor}
            />

            <GameEndPortal
                isOpen={showEndPortal && !opponentLeft}
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