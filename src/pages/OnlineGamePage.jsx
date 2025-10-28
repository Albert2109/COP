import { useState, useEffect, useRef, useCallback } from 'react'; // Додано useCallback для послідовності
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { formatTime } from '../helper/formatTime';
import { useGameTimer } from '../hooks/useGameTimer';
import Board from '../components/Board';
import GameEndPortal from '../components/GameEndPortal'; // Перевір шлях
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

    // --- Ефект 1: Спроба підключення ---
    useEffect(() => {
        // Запускаємо тільки якщо є об'єкт connection, він відключений, і ми ще не намагалися приєднатись
        if (connection && connection.state === HubConnectionState.Disconnected && !joinAttempted.current) {
            startConnection().catch(() => { // Прибрано невикористану змінну 'error'
                alert("Не вдалося підключитися до сервера SignalR.");
                // Можна додати логіку повернення на головну сторінку
            });
        }
    }, [connection, startConnection]);

    // --- Ефект 2: Спроба приєднання до кімнати (один раз після підключення) ---
     useEffect(() => {
        // Запускаємо тільки якщо connection існує, підключено, і ми ще НЕ намагалися приєднатись
        if (connection && connection.state === HubConnectionState.Connected && !joinAttempted.current) {
            
            joinAttempted.current = true; // Позначаємо, що спроба зроблена

            console.log(`>>> INVOKING JoinOrCreateRoom with code: '${settings.roomCode || ""}' nickname: '${settings.nickname}'`);
            connection.invoke("JoinOrCreateRoom", settings.roomCode || "", settings.nickname)
                .catch(err => {
                    console.error("Failed to join room: ", err);
                    alert("Не вдалося приєднатися до кімнати.");
                    joinAttempted.current = false; // Дозволяємо повторну спробу (можливо, при оновленні сторінки)
                });
        }
        // Залежимо від connectionId, щоб точно знати, що підключення відбулося успішно
    }, [connection, connectionId, settings.roomCode, settings.nickname]); 


    // --- Ефект 3: Налаштування слухачів подій ---
    useEffect(() => {
        // Налаштовуємо слухачів тільки якщо connection існує і підключено
        if (!connection || connection.state !== HubConnectionState.Connected) return;

        // Обробники подій
        const joinedHandler = (code, playerList) => {
            console.log("JoinedRoom event received:", code, playerList);
            setRoomCode(code); 
            setPlayers(playerList);
        };
        const updateHandler = (playerList) => {
             console.log("UpdatePlayerList event:", playerList);
            setPlayers(playerList);
        };
        const errorHandler = (message) => {
            alert(`Помилка сервера: ${message}`);
            // Можливо, додати логіку перенаправлення
        };
        const gameStartHandler = (firstPlayerConnectionId) => {
            console.log("GameStart event:", firstPlayerConnectionId);
            setPlayers(currentPlayers => {
                const actualPlayers = currentPlayers.length > 0 ? currentPlayers : [{ connectionId: connectionId }];
                if (!connectionId) {
                    console.error("connectionId is null in gameStartHandler");
                    return currentPlayers; 
                }
                const iAmHost = actualPlayers[0].connectionId === connectionId;
                const firstPlayerSymbol = firstPlayerConnectionId === connectionId ? 'player' : 'bot';

                setGameStartData({
                    ...settings, // Важливо: беремо 'rows', 'columns', 'colors' з початкових settings
                    mode: 'online',
                    isHost: iAmHost,
                    firstPlayer: firstPlayerSymbol,
                });
                setGameState('playing');
                return actualPlayers; 
            });
        };
         const playerLeftHandler = (nickname) => {
            console.log("PlayerLeft event:", nickname);
            setOpponentLeft(true);
        };
        const restartRequestedHandler = (nickname) => {
             console.log("RestartRequested by:", nickname);
             setOpponentWantsRestart(true);
             setTimeout(() => setOpponentWantsRestart(false), 5000);
        };

        // Підписка
        connection.on("JoinedRoom", joinedHandler);
        connection.on("UpdatePlayerList", updateHandler);
        connection.on("Error", errorHandler);
        connection.on("GameStart", gameStartHandler);
        connection.on("PlayerLeft", playerLeftHandler);
        connection.on("RestartRequested", restartRequestedHandler);

        // Відписка при розмонтуванні або зміні connection/connectionId
        return () => {
            connection.off("JoinedRoom", joinedHandler);
            connection.off("UpdatePlayerList", updateHandler);
            connection.off("Error", errorHandler);
            connection.off("GameStart", gameStartHandler);
            connection.off("PlayerLeft", playerLeftHandler);
            connection.off("RestartRequested", restartRequestedHandler);
        };
    }, [connection, connectionId, settings]); // settings потрібен для gameStartHandler

    // --- Ефект 4: Очистка з'єднання при розмонтуванні компонента ---
    useEffect(() => {
        return () => {
            console.log("Stopping SignalR connection on unmount");
            connection?.stop().catch(err => console.error("Error stopping connection:", err));
        };
    }, [connection]);

    // --- Рендеринг ---
    if (gameState === 'playing' && gameStartData) { 
        return (
            <OnlineGame
                // Ключ для примусового перестворення компонента при рестарті
                key={gameStartData.firstPlayer + roomCode + opponentLeft} 
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

     // Рендер, якщо опонент вийшов до початку гри
     if (opponentLeft && gameState === 'waiting') {
          return (
            <div className="alert alert-warning text-center">
                <h2>Опонент покинув кімнату</h2>
                {/* Виправлено: кнопка веде на головну */}
                <button className="btn btn-primary mt-3" onClick={onGoToResults}> 
                    На головну
                </button>
            </div>
          );
     }

    // Рендер кімнати очікування
    return (
        <div className="text-center">
            <h2>Кімната очікування</h2>
            {roomCode && <h3>Код кімнати: <strong className="text-primary">{roomCode}</strong></h3>}
            <p>
                {roomCode ? "Поділіться цим кодом з другом." : "Підключення та створення кімнати..."}
            </p>
            <div className="spinner-border text-primary my-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-4">Гравці в кімнаті:</h4>
            <ul className="list-group" style={{ maxWidth: '300px', margin: 'auto' }}>
                {players.map(p => (
                    <li key={p.connectionId} className="list-group-item">
                        {p.nickname} {p.connectionId === connectionId && "(Це ви)"}
                    </li>
                ))}
                {players.length < 2 && <li className="list-group-item text-muted">Очікування гравця...</li>}
            </ul>
        </div>
    );
}


// --- Компонент OnlineGame ---
function OnlineGame({
  settings, connection, connectionId, roomCode,
  onGoToSettings, onGoToResults, onGameFinished,
  opponentLeft, opponentWantsRestart
}) {
    const {
        board, currentPlayer, winner,
        playerMove, botMove, resetGame // resetGame потрібен для handlePlayAgain
    } = useGame(settings);

    const [time, setTime] = useState(0);
    const [showEndPortal, setShowEndPortal] = useState(false);
    const formattedTime = formatTime(time);
    useGameTimer(!winner && !opponentLeft, setTime);

    // Слухач ходів
    useEffect(() => {
        const moveHandler = (playerConnectionId, column) => {
            if (playerConnectionId !== connectionId) {
                botMove(column);
            }
        };
        // Перевіряємо, чи connection існує, перед підпискою
        if (connection) {
            connection.on("MoveMade", moveHandler);
        }
        return () => {
             // Перевіряємо, чи connection існує, перед відпискою
            connection?.off("MoveMade", moveHandler);
        };
    }, [connection, connectionId, botMove]);

    // Обробка завершення гри
    useEffect(() => {
        if (winner && !opponentLeft) { // Зберігаємо результат, тільки якщо гра завершилась коректно
            onGameFinished({ winner, time: formattedTime });
            setShowEndPortal(true);
        }
    }, [winner, onGameFinished, formattedTime, opponentLeft]);

    // Обробник кліку на колонку
    const handleColumnClick = (col) => {
        // Дозволяємо хід тільки якщо наша черга, гра не завершена і опонент не вийшов
        if (currentPlayer === 'player' && !winner && !opponentLeft) { 
            playerMove(col); 
            connection?.invoke("MakeMove", roomCode, col) // Додано ?. на випадок розриву з'єднання
                .catch(err => console.error("Failed to make move: ", err));
        }
    };

    // Обробник "Грати ще раз"
    const handlePlayAgain = useCallback(() => {
        // 1. Спочатку закриваємо портал і скидаємо візуальний таймер
        setShowEndPortal(false);
        setTime(0);

        // 2. Надсилаємо запит на сервер
        connection?.invoke("RequestRestart", roomCode)
           .catch(err => console.error("Failed to request restart:", err));
        
        // 3. Потім скидаємо логіку гри
        resetGame(); 
        
    }, [connection, roomCode, resetGame]);

    // Обробник "Закінчити гру" (вихід на результати)
    const handleEndGame = useCallback(() => {
        setShowEndPortal(false);
        // connection?.stop().catch(err => console.error("Error stopping connection:", err)); // Зупинка тепер в useEffect unmount
        onGoToResults();
    }, [onGoToResults]); // Забрано connection з залежностей

    // Обробник для кнопки налаштувань (для порталу)
     const handleChangeSettings = useCallback(() => {
        setShowEndPortal(false);
        // connection?.stop().catch(err => console.error("Error stopping connection:", err)); // Зупинка тепер в useEffect unmount
        onGoToSettings();
    }, [onGoToSettings]); // Забрано connection з залежностей

    // Скидання стану при зміні ключа (рестарт гри)
    useEffect(() => {
        setShowEndPortal(false);
        setTime(0);
        // Скидати opponentWantsRestart тут не потрібно, воно само зникне
    }, [settings.firstPlayer]); // Ключ змінюється при рестарті

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

            {/* Повідомлення про бажання опонента грати ще */}
            {opponentWantsRestart && !showEndPortal && !opponentLeft && (
                 <div className="alert alert-info text-center small py-1">
                     Опонент пропонує грати ще раз! Натисніть "Грати ще раз", щоб почати.
                 </div>
             )}

             {/* Повідомлення про вихід опонента під час гри */}
             {opponentLeft && !winner && (
                 <div className="alert alert-warning text-center">
                    <h2>Опонент покинув гру</h2>
                    <button className="btn btn-primary mt-2" onClick={handleEndGame}>
                        Переглянути результати сесії
                    </button>
                 </div>
            )}

            {/* Повідомлення про результат гри */}
            {winner && (
                <div className={`alert ${winner === 'player' ? 'alert-success' : (winner === 'draw' ? 'alert-info' : 'alert-danger')}`}>
                    {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Ви програли!'}
                </div>
            )}

            <Board
                board={board}
                // Блокуємо кліки, якщо не наша черга, гра завершена, або опонент вийшов
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
                 onPlayAgain={handlePlayAgain} // Передаємо оновлений обробник
                 EndGame={handleEndGame}
                 onChangeSettings={handleChangeSettings} 
             />
        </div>
    );
}