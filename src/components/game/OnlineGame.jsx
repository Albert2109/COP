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
  // 1. Прибираємо 'onGameFinished' з пропсів
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

    // Обробник ходу опонента
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

    // 2. Оновлюємо useEffect для завершення гри
    useEffect(() => {
        // Якщо є переможець, гра ще не позначена як завершена, і опонент на місці
        if (winner && !opponentLeft && !isGameFinished) {
            console.log(`Detected winner: ${winner}. Notifying server...`);
            // 🔽🔽🔽 ЗАМІСТЬ onGameFinished ВИКЛИКАЄМО СЕРВЕР 🔽🔽🔽
            connection?.invoke("NotifyGameEnd", roomCode)
                .catch(err => console.error("Failed to notify server of game end:", err));
            // 🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼
        }
    // 3. 'onGameFinished' більше не потрібен в залежностях
    }, [winner, opponentLeft, isGameFinished, connection, roomCode]); // Використовуємо 'connection' і 'roomCode'


    // Обробник кліку
    const handleColumnClick = (col) => {
        if (currentPlayer === 'player' && !winner && !opponentLeft && !isGameFinished) {
            playerMove(col); 
            connection?.invoke("MakeMove", roomCode, col) 
                .catch(err => console.error("Failed to send move: ", err));
        }
    };

    // 'handlePlayAgain' тепер просто викликає 'onRestartApproved'
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

            {/* 4. Тепер 'winner' може бути null, коли портал вже показаний */}
            {/* Тому краще показувати текст перемоги всередині порталу */}
            {/*winner && ( ... цей блок можна прибрати або залишити ... )*/}
            {winner && isGameFinished && ( // Додаємо isGameFinished для надійності
                <div className={`alert ${winner === 'player' ? 'alert-success' : (winner === 'draw' ? 'alert-info' : 'alert-danger')}`}>
                    {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Ви програли!'}
                </div>
            )}


            <Board
                board={board}
                // Блокуємо кліки, якщо гра закінчена офіційно (сервером)
                onColumnClick={currentPlayer !== 'player' || winner || opponentLeft || isGameFinished ? () => {} : handleColumnClick} 
                playerColor={settings.playerColor}
                botColor={settings.botColor}
            />

            {/* 'isOpen' тепер керується 'isGameFinished' */}
            <GameEndPortal
                isOpen={isGameFinished && !opponentLeft}
                // Передаємо 'winner', щоб портал знав, хто переміг
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