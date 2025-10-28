import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { formatTime } from '../helper/formatTime';
import { useGameTimer } from '../hooks/useGameTimer';
import Board from '../components/Board';
import GameEndPortal from '../components/GameEndPortal'; // Перевір шлях
import { HubConnectionState } from '@microsoft/signalr';

// Головний компонент сторінки онлайн-гри
export default function OnlineGamePage({
    settings, // Початкові налаштування з форми (rows, columns, nickname, roomCode...)
    onGoToSettings,
    onGoToResults,
    onGameFinished
}) {
    // --- Стани компонента ---
    const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'ended'
    const [players, setPlayers] = useState([]); // Список гравців у кімнаті
    const [roomCode, setRoomCode] = useState(settings.roomCode || ""); // Код поточної кімнати
    // gameStartData - налаштування, отримані З СЕРВЕРА для початку гри
    const [gameStartData, setGameStartData] = useState(null);
    const [opponentLeft, setOpponentLeft] = useState(false); // Прапорець: чи вийшов опонент?
    const [opponentWantsRestart, setOpponentWantsRestart] = useState(false); // Прапорець: чи хоче опонент рестарт?

    // --- SignalR ---
    const { connection, startConnection, connectionId } = useSignalR();
    const joinAttempted = useRef(false); // Прапорець, щоб уникнути повторного приєднання

    // --- Ефект 1: Спроба підключення до SignalR ---
    // Запускається один раз при монтуванні
    useEffect(() => {
        if (connection && connection.state === HubConnectionState.Disconnected) {
            startConnection().catch(() => {
                alert("Не вдалося підключитися до ігрового сервера. Спробуйте оновити сторінку.");
                // Можливо, перенаправити на головну
            });
        }
    }, [connection, startConnection]); // Залежить тільки від об'єкта connection та функції підключення

    // --- Ефект 2: Спроба приєднання до кімнати ---
    // Запускається один раз ПІСЛЯ успішного підключення
    useEffect(() => {
        // Перевіряємо стан з'єднання і чи ще не було спроби
        if (connection && connection.state === HubConnectionState.Connected && !joinAttempted.current) {

            joinAttempted.current = true; // Позначаємо спробу

            console.log(`>>> INVOKING JoinOrCreateRoom with code: '${settings.roomCode || ""}', rows: ${settings.rows}, cols: ${settings.columns}`);

            // Викликаємо метод на сервері, передаючи бажані налаштування
            connection.invoke("JoinOrCreateRoom",
                settings.roomCode || "",
                settings.nickname,
                settings.rows || 6,
                settings.columns || 7
            )
            .catch(err => {
                console.error("Failed to join room: ", err);
                alert(`Не вдалося приєднатися до кімнати: ${err.message || 'Помилка сервера'}`);
                joinAttempted.current = false; // Дозволяємо повторну спробу (наприклад, після оновлення сторінки)
                // Можна додати логіку повернення на попередню сторінку
                // onGoToSettings();
            });
        }
    // Залежить від стану з'єднання та початкових налаштувань кімнати
    }, [connection, connectionId, settings.roomCode, settings.nickname, settings.rows, settings.columns]);


    // --- Ефект 3: Налаштування слухачів подій SignalR ---
    // Запускається, коли з'єднання встановлено
    useEffect(() => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;

        // --- Обробники подій ---
        const joinedHandler = (code, playerList, roomRows, roomCols) => {
            console.log("JoinedRoom event received:", code, playerList, `${roomRows}x${roomCols}`);
            setRoomCode(code); // Оновлюємо код кімнати (може бути новим)
            setPlayers(playerList);
        };
        const updateHandler = (playerList) => {
            console.log("UpdatePlayerList event:", playerList);
            setPlayers(playerList);
        };
        const errorHandler = (message) => {
            console.error("SignalR Hub Error:", message);
            alert(`Помилка сервера: ${message}`);
            // TODO: Додати обробку серйозних помилок (наприклад, повернення на головну)
        };
        const gameStartHandler = (gameData) => {
             console.log("GameStart event received:", gameData);
             if (!connectionId || !gameData || !gameData.players) { // Перевірка на null/undefined
                 console.error("Invalid data received in gameStartHandler:", gameData);
                 alert("Сталася помилка при старті гри (невірні дані). Спробуйте ще раз.");
                 // Можливо, повернути на головну
                 return;
             }
            const actualPlayers = gameData.players; // Використовуємо 'players' (camelCase)
            setPlayers(actualPlayers);
            const myPlayer = actualPlayers.find(p => p.connectionId === connectionId); // 'connectionId' (camelCase)

            if (!myPlayer) {
                 console.error("Cannot find myself in player list!", actualPlayers);
                 alert("Сталася помилка синхронізації гравців.");
                 return;
            }
            const iAmFirst = gameData.firstPlayerId === connectionId; // 'firstPlayerId' (camelCase)

            // Формуємо налаштування гри ВИКЛЮЧНО з даних сервера (крім кольорів/ніка)
            setGameStartData({
                playerColor: settings.playerColor,
                botColor: settings.botColor,
                nickname: settings.nickname,
                mode: 'online',
                rows: gameData.rows,         // Дані з сервера
                columns: gameData.columns,    // Дані з сервера
                firstPlayer: iAmFirst ? 'player' : 'bot', // Визначаємо, хто ходить першим
            });
            setGameState('playing');        // Перемикаємо стан на "граємо"
            setOpponentLeft(false);         // Скидаємо прапорець виходу
            setOpponentWantsRestart(false); // Скидаємо прапорець рестарту
        };
        const playerLeftHandler = (nickname) => {
            console.log("PlayerLeft event:", nickname);
            setOpponentLeft(true); // Позначаємо, що опонент вийшов
        };
        const restartRequestedHandler = (nickname) => {
             console.log("RestartRequested by:", nickname);
             setOpponentWantsRestart(true); // Показуємо повідомлення
             // Повідомлення зникне через 7 секунд
             setTimeout(() => setOpponentWantsRestart(false), 7000);
        };

        // --- Підписка на події ---
        connection.on("JoinedRoom", joinedHandler);
        connection.on("UpdatePlayerList", updateHandler);
        connection.on("Error", errorHandler);
        connection.on("GameStart", gameStartHandler);
        connection.on("PlayerLeft", playerLeftHandler);
        connection.on("RestartRequested", restartRequestedHandler);

        // --- Функція очистки (відписка від подій) ---
        return () => {
             console.log("Removing SignalR listeners");
             // Перевіряємо, чи connection ще існує перед відпискою
             connection?.off("JoinedRoom", joinedHandler);
             connection?.off("UpdatePlayerList", updateHandler);
             connection?.off("Error", errorHandler);
             connection?.off("GameStart", gameStartHandler);
             connection?.off("PlayerLeft", playerLeftHandler);
             connection?.off("RestartRequested", restartRequestedHandler);
        };
    // Залежності: connection (сам об'єкт), connectionId (щоб виконатись після підключення),
    // та початкові дані гравця, які використовуються в gameStartHandler
    }, [connection, connectionId, settings.playerColor, settings.botColor, settings.nickname]);

    // --- Ефект 4: Очистка з'єднання при розмонтуванні ---
    useEffect(() => {
        // Ця функція викликається, коли компонент OnlineGamePage видаляється з DOM
        return () => {
            console.log("Stopping SignalR connection on OnlineGamePage unmount");
            connection?.stop().catch(err => console.error("Error stopping connection:", err));
        };
    }, [connection]); // Залежить тільки від об'єкта connection

    // --- Рендеринг ---

    // Якщо гра почалась (є gameStartData), рендеримо компонент гри
    if (gameState === 'playing' && gameStartData) {
        return (
            <OnlineGame
                // Ключ змінюється при рестарті (змінюється firstPlayer),
                // що призводить до повного перестворення компонента OnlineGame і скидання стану useGame
                key={gameStartData.firstPlayer + roomCode + opponentLeft.toString()} // Додаємо .toString() для opponentLeft
                settings={gameStartData} // Передаємо налаштування з сервера
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

     // Якщо опонент вийшов ДО початку гри
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

    // Рендер кімнати очікування (за замовчуванням)
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
                     // Використовуємо connectionId як ключ
                    <li key={p.connectionId} className="list-group-item d-flex justify-content-between align-items-center">
                       <span>{p.nickname}</span> {/* Використовуємо nickname */}
                        {p.connectionId === connectionId && <span className="badge bg-success rounded-pill">Це ви</span>}
                    </li>
                ))}
                {/* Показуємо "місце" для другого гравця */}
                {players.length < 2 && <li className="list-group-item text-muted">Очікування другого гравця...</li>}
            </ul>
            {/* TODO: Додати кнопку "Скасувати пошук" / "Вийти з кімнати" */}
        </div>
    );
}


// --- Компонент самої гри OnlineGame (внутрішній) ---
// Приймає налаштування з сервера та керує відображенням гри
function OnlineGame({
  settings, // Налаштування, отримані з GameStart (включаючи rows, columns, firstPlayer)
  connection, connectionId, roomCode,
  onGoToSettings, onGoToResults, onGameFinished,
  opponentLeft, opponentWantsRestart
}) {
    // Ініціалізуємо логіку гри з НАЛАШТУВАННЯМИ СЕРВЕРА
    const {
        board, currentPlayer, winner,
        playerMove, botMove // resetGame потрібен для локального скидання
    } = useGame(settings);

    const [time, setTime] = useState(0); // Загальний час гри
    const [showEndPortal, setShowEndPortal] = useState(false); // Чи показувати портал завершення
    const formattedTime = formatTime(time);
    // Запускаємо/зупиняємо таймер гри
    useGameTimer(!winner && !opponentLeft, setTime);

    // --- Ефект для слухача ходів опонента ---
    useEffect(() => {
        const moveHandler = (playerConnectionId, column) => {
            // Якщо ID відправника не наш, це хід опонента
            if (playerConnectionId !== connectionId) {
                console.log(`Received move from opponent: col ${column}`);
                botMove(column); // Викликаємо botMove з отриманою колонкою
            }
        };
        if (connection) {
            connection.on("MoveMade", moveHandler); // Підписуємось
        }
        return () => {
            connection?.off("MoveMade", moveHandler); // Відписуємось
        };
    }, [connection, connectionId, botMove]); // Залежить від botMove (стабільний через useCallback)

    // --- Ефект для обробки завершення гри ---
    useEffect(() => {
        // Якщо є переможець І опонент НЕ вийшов
        if (winner && !opponentLeft) {
            console.log(`Game ended. Winner: ${winner}. Saving result.`);
            onGameFinished({ winner, time: formattedTime }); // Зберігаємо результат
            setShowEndPortal(true); // Показуємо портал
        }
    }, [winner, onGameFinished, formattedTime, opponentLeft]); // Залежить від результату гри

    // --- Обробники дій гравця ---

    // Клік на колонку (наш хід)
    const handleColumnClick = (col) => {
        // Дозволяємо хід тільки якщо: наша черга, гра не завершена, опонент не вийшов
        if (currentPlayer === 'player' && !winner && !opponentLeft) {
            console.log(`Player move: col ${col}`);
            playerMove(col); // 1. Локально оновлюємо стан
            connection?.invoke("MakeMove", roomCode, col) // 2. Надсилаємо хід на сервер
                .catch(err => console.error("Failed to send move: ", err));
        } else {
            console.warn(`Move blocked: currentPlayer=${currentPlayer}, winner=${winner}, opponentLeft=${opponentLeft}`);
        }
    };

    // Кнопка "Грати ще раз" у порталі
    const handlePlayAgain = useCallback(() => {
        console.log("Requesting restart via SignalR...");
        setShowEndPortal(false); // Ховаємо портал
        setTime(0); // Скидаємо таймер
        connection?.invoke("RequestRestart", roomCode) // Надсилаємо запит на сервер
           .catch(err => console.error("Failed to request restart:", err));
        // resetGame() НЕ викликаємо. Скидання відбудеться при отриманні GameStart
        // і перестворенні компонента через зміну `key`.
    }, [connection, roomCode]); // Залежить від connection та roomCode

    // Кнопка "Закінчити гру" у порталі (перехід на результати)
    const handleEndGame = useCallback(() => {
        console.log("Ending game session, navigating to results.");
        setShowEndPortal(false);
        // З'єднання зупиниться автоматично при розмонтуванні OnlineGamePage
        onGoToResults();
    }, [onGoToResults]);

    // Обробник для (прихованої) кнопки "Налаштування"
    const handleChangeSettings = useCallback(() => {
        console.warn("Navigating to settings from online game (will disconnect).");
        setShowEndPortal(false);
        // З'єднання зупиниться автоматично при розмонтуванні OnlineGamePage
        onGoToSettings();
    }, [onGoToSettings]);

    // --- Рендеринг компонента OnlineGame ---
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

            {/* Повідомлення про запит на рестарт від опонента */}
            {opponentWantsRestart && !showEndPortal && !opponentLeft && (
                 <div className="alert alert-info text-center small py-1 mb-2">
                     Опонент пропонує грати ще раз! Якщо згодні, натисніть "Грати ще раз" у вікні результатів (коли гра завершиться).
                 </div>
             )}

             {/* Повідомлення про вихід опонента під час гри */}
             {opponentLeft && !winner && (
                 <div className="alert alert-warning text-center">
                    <h2>Опонент покинув гру</h2>
                    <p>Ви можете завершити сесію та переглянути результати.</p>
                    <button className="btn btn-primary mt-2" onClick={handleEndGame}>
                        Переглянути результати
                    </button>
                 </div>
            )}

            {/* Повідомлення про результат гри (перемога/поразка/нічия) */}
            {winner && (
                <div className={`alert ${winner === 'player' ? 'alert-success' : (winner === 'draw' ? 'alert-info' : 'alert-danger')}`}>
                    {winner === 'draw' ? '🤝 Нічия!' : winner === 'player' ? '🎉 Ви перемогли!' : '🤖 Ви програли!'}
                </div>
            )}

            {/* Ігрова дошка */}
            <Board
                board={board}
                // Блокуємо кліки, якщо не наша черга, гра завершена, або опонент вийшов
                onColumnClick={currentPlayer !== 'player' || winner || opponentLeft ? () => {} : handleColumnClick}
                playerColor={settings.playerColor}
                botColor={settings.botColor}
            />

            {/* Портал завершення гри */}
            <GameEndPortal
                // Показуємо тільки якщо гра завершилась коректно (є переможець і опонент не вийшов)
                isOpen={showEndPortal && !opponentLeft}
                winner={winner}
                time={formattedTime}
                botLevel={null} // Немає рівня бота в онлайні
                isOnline={true} // Вказуємо, що це онлайн-гра
                onPlayAgain={handlePlayAgain}
                EndGame={handleEndGame}
                // Передаємо, але портал сам приховає кнопку для isOnline=true
                onChangeSettings={handleChangeSettings}
            />
        </div>
    );
}