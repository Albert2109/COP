import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { formatTime } from '../helper/formatTime';
import { useGameTimer } from '../hooks/useGameTimer';
import Board from '../components/Board';
import GameEndPortal from '../components/GameEndPortal'; 
import { HubConnectionState } from '@microsoft/signalr';


export default function OnlineGamePage({
    settings, 
    onGoToSettings,
    onGoToResults,
    onGameFinished
}) {
    const [gameState, setGameState] = useState('waiting'); 
    const [players, setPlayers] = useState([]); 
    const [roomCode, setRoomCode] = useState(settings.roomCode || ""); 
    const [gameStartData, setGameStartData] = useState(null);
    const [opponentLeft, setOpponentLeft] = useState(false);
    const [opponentWantsRestart, setOpponentWantsRestart] = useState(false); 
    const { connection, startConnection, connectionId } = useSignalR();
    const joinAttempted = useRef(false); 

    useEffect(() => {
        if (connection && connection.state === HubConnectionState.Disconnected) {
            startConnection().catch(() => {
                alert("Не вдалося підключитися до ігрового сервера. Спробуйте оновити сторінку.");
            });
        }
    }, [connection, startConnection]); 

    useEffect(() => {
        if (connection && connection.state === HubConnectionState.Connected && !joinAttempted.current) {

            joinAttempted.current = true; 

            console.log(`>>> INVOKING JoinOrCreateRoom with code: '${settings.roomCode || ""}', rows: ${settings.rows}, cols: ${settings.columns}`);

            connection.invoke("JoinOrCreateRoom",
                settings.roomCode || "",
                settings.nickname,
                settings.rows || 6,
                settings.columns || 7
            )
            .catch(err => {
                console.error("Failed to join room: ", err);
                alert(`Не вдалося приєднатися до кімнати: ${err.message || 'Помилка сервера'}`);
                joinAttempted.current = false; 
            });
        }

    }, [connection, connectionId, settings.roomCode, settings.nickname, settings.rows, settings.columns]);

    useEffect(() => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;

        const joinedHandler = (code, playerList, roomRows, roomCols) => {
            console.log("JoinedRoom event received:", code, playerList, `${roomRows}x${roomCols}`);
            setRoomCode(code); 
            setPlayers(playerList);
        };
        const updateHandler = (playerList) => {
            console.log("UpdatePlayerList event:", playerList);
            setPlayers(playerList);
        };
        const errorHandler = (message) => {
            console.error("SignalR Hub Error:", message);
            alert(`Помилка сервера: ${message}`);
        };
        const gameStartHandler = (gameData) => {
             console.log("GameStart event received:", gameData);
             if (!connectionId || !gameData || !gameData.players) { 
                 console.error("Invalid data received in gameStartHandler:", gameData);
                 alert("Сталася помилка при старті гри (невірні дані). Спробуйте ще раз.");
                 return;
             }
            const actualPlayers = gameData.players; 
            setPlayers(actualPlayers);
            const myPlayer = actualPlayers.find(p => p.connectionId === connectionId); 

            if (!myPlayer) {
                 console.error("Cannot find myself in player list!", actualPlayers);
                 alert("Сталася помилка синхронізації гравців.");
                 return;
            }
            const iAmFirst = gameData.firstPlayerId === connectionId; 

            
            setGameStartData({
                playerColor: settings.playerColor,
                botColor: settings.botColor,
                nickname: settings.nickname,
                mode: 'online',
                rows: gameData.rows,         
                columns: gameData.columns,    
                firstPlayer: iAmFirst ? 'player' : 'bot', 
            });
            setGameState('playing');       
            setOpponentLeft(false);         
            setOpponentWantsRestart(false); 
        };
        const playerLeftHandler = (nickname) => {
            console.log("PlayerLeft event:", nickname);
            setOpponentLeft(true); 
        };
        const restartRequestedHandler = (nickname) => {
             console.log("RestartRequested by:", nickname);
             setOpponentWantsRestart(true); 
             setTimeout(() => setOpponentWantsRestart(false), 7000);
        };
        connection.on("JoinedRoom", joinedHandler);
        connection.on("UpdatePlayerList", updateHandler);
        connection.on("Error", errorHandler);
        connection.on("GameStart", gameStartHandler);
        connection.on("PlayerLeft", playerLeftHandler);
        connection.on("RestartRequested", restartRequestedHandler);
        return () => {
             console.log("Removing SignalR listeners");
             connection?.off("JoinedRoom", joinedHandler);
             connection?.off("UpdatePlayerList", updateHandler);
             connection?.off("Error", errorHandler);
             connection?.off("GameStart", gameStartHandler);
             connection?.off("PlayerLeft", playerLeftHandler);
             connection?.off("RestartRequested", restartRequestedHandler);
        };
    }, [connection, connectionId, settings.playerColor, settings.botColor, settings.nickname]);

    useEffect(() => {
        return () => {
            console.log("Stopping SignalR connection on OnlineGamePage unmount");
            connection?.stop().catch(err => console.error("Error stopping connection:", err));
        };
    }, [connection]); 
    if (gameState === 'playing' && gameStartData) {
        return (
            <OnlineGame                
                key={gameStartData.firstPlayer + roomCode + opponentLeft.toString()} 
                settings={gameStartData} 
                connection={connection}
                connectionId={connectionId}
                roomCode={roomCode}
                onGoToSettings={onGoToSettings}
                onGoToResults={onGoToResults}
                onGameFinished={onGameFinished}
                opponentLeft={opponentLeft}
                opponentWantsRestart={opponentWantsRestart}
            />
        );
    }

     if (opponentLeft && gameState === 'waiting') {
          return (
            <div className="alert alert-warning text-center">
                <h2>Опонент покинув кімнату</h2>
                <button className="btn btn-primary mt-3" onClick={onGoToResults}>
                    На головну
                </button>
            </div>
          );
     }

    return (
        <div className="text-center">
            <h2>Кімната очікування</h2>
            {roomCode && <h3>Код кімнати: <strong className="text-primary">{roomCode}</strong></h3>}
            <p>
                {roomCode ? "Поділіться цим кодом з другом, щоб він приєднався." : "Підключення та створення/пошук кімнати..."}
            </p>
            <div className="spinner-border text-primary my-3" role="status">
                <span className="visually-hidden">Завантаження...</span>
            </div>
            <h4 className="mt-4">Гравці в кімнаті:</h4>
            <ul className="list-group" style={{ maxWidth: '400px', margin: 'auto' }}>
                {players.map(p => (
                    <li key={p.connectionId} className="list-group-item d-flex justify-content-between align-items-center">
                       <span>{p.nickname}</span> 
                        {p.connectionId === connectionId && <span className="badge bg-success rounded-pill">Це ви</span>}
                    </li>
                ))}
                {players.length < 2 && <li className="list-group-item text-muted">Очікування другого гравця...</li>}
            </ul>
        </div>
    );
}

function OnlineGame({
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
            {/* Шапка гри */}
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