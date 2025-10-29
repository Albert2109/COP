import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSignalR } from '../hooks/api/useSignalR'; 
import { HubConnectionState } from '@microsoft/signalr';
import OnlineGame from '../components/game/OnlineGame';
import WaitingRoom from '../components/game/WaitingRoom'; 

export default function OnlineGamePage({
    settings, 
    onGoToSettings,
    onGoToResults,
    onGameFinished // Для історії
}) {
    const { roomCode: codeFromUrl } = useParams();
    const navigate = useNavigate(); 

    const [gameState, setGameState] = useState('waiting'); 
    const [players, setPlayers] = useState([]); 
    const [roomCode, setRoomCode] = useState(codeFromUrl === 'new' ? "" : codeFromUrl); 
    const [gameStartData, setGameStartData] = useState(null);
    const [opponentLeft, setOpponentLeft] = useState(false);
    const [opponentWantsRestart, setOpponentWantsRestart] = useState(false); 
    const [pendingGameData, setPendingGameData] = useState(null);

    const [isGameFinished, setIsGameFinished] = useState(false);
    const isGameFinishedRef = useRef(isGameFinished); 
    const didIClickPlayAgainRef = useRef(false);

    const { connection, startConnection, connectionId } = useSignalR();
    const joinAttempted = useRef(false);

    // Сеттер для isGameFinished
    const setGameFinished = useCallback((value) => {
        setIsGameFinished(value);
        isGameFinishedRef.current = value;
    }, []); 

    // useEffect для підключення
    useEffect(() => {
     if (connection && connection.state === HubConnectionState.Disconnected) {
         startConnection().catch(() => {
             alert("Не вдалося підключитися до ігрового сервера. Спробуйте оновити сторінку.");
         });
     }
    }, [connection, startConnection]);

    // useEffect для входу в кімнату
    useEffect(() => {
     if (connection && connection.state === HubConnectionState.Connected && !joinAttempted.current) {
         joinAttempted.current = true; 
         const codeToJoin = codeFromUrl === 'new' ? "" : codeFromUrl;
         connection.invoke("JoinOrCreateRoom",
             codeToJoin, 
             settings.nickname,
             settings.rows || 6,
             settings.columns || 7
         )
         .catch(err => {
             console.error("Failed to join room: ", err);
             alert(`Не вдалося приєднатися до кімнати: ${err.message || 'Помилка сервера'}`);
             joinAttempted.current = false; 
             navigate('/settings'); 
         });
     }
    }, [connection, connectionId, settings.nickname, settings.rows, settings.columns, codeFromUrl, navigate]); 

    // Функція запуску гри
    const startGameWithData = useCallback((gameData) => {
        if (!connectionId || !gameData || !gameData.players) { 
            console.error("Invalid data in startGameWithData"); return;
        }
        
        const actualPlayers = gameData.players; 
        setPlayers(actualPlayers);
        const myPlayer = actualPlayers.find(p => p.connectionId === connectionId); 

        if (!myPlayer) {
            console.error("Cannot find myself in player list"); return;
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
            gameId: new Date().toISOString() 
        });

        setGameState('playing');      
        setOpponentLeft(false);        
        setOpponentWantsRestart(false); 
        setGameFinished(false); 
        setPendingGameData(null);
        didIClickPlayAgainRef.current = false; 
    }, [connectionId, settings.playerColor, settings.botColor, settings.nickname, setGameFinished]);

    // Обробник натискання "Грати ще" (викликається з OnlineGame)
    const handleRestartApproved = useCallback(() => {
        console.log("User clicked 'Play Again'.");
        didIClickPlayAgainRef.current = true; 

        if (pendingGameData) {
            console.log("Opponent already agreed. Restarting.");
            startGameWithData(pendingGameData); 
        } else {
            console.log("Waiting for opponent to approve restart.");
            // Нічого не робимо, чекаємо 'GameStart'
        }
    }, [pendingGameData, startGameWithData]);

    // ГОЛОВНИЙ useEffect для слухачів SignalR
    useEffect(() => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;

        const joinedHandler = (code, playerList) => {
            setRoomCode(code); 
            setPlayers(playerList);
            if (codeFromUrl !== code) {
                navigate(`/online-game/${code}`, { replace: true });
            }
        };
        const updateHandler = (playerList) => {
            setPlayers(playerList);
        };
        const errorHandler = (message) => {
            console.error("SignalR Hub Error:", message);
            alert(`Помилка сервера: ${message}`);
        };

        const gameStartHandler = (gameData) => {
            console.log("GameStart event received.");
            if (isGameFinishedRef.current) {
                setPendingGameData(gameData);
                if (didIClickPlayAgainRef.current) {
                    startGameWithData(gameData);
                } 
            } else {
                startGameWithData(gameData);
            }
        };
        
        const gameFinishedHandler = () => {
             console.log("Received GameFinished from server. Showing portal.");
             setGameFinished(true); 
             // Тут можна було б викликати onGameFinished для збереження історії, 
             // але ми не маємо даних про переможця/час.
        };

        const playerLeftHandler = (nickname) => {
            console.log("PlayerLeft event received:", nickname);
            setOpponentLeft(true); 
        };
        const restartRequestedHandler = (nickname) => {
             console.log("RestartRequested by:", nickname);
             setOpponentWantsRestart(true); 
             setTimeout(() => setOpponentWantsRestart(false), 7000);
        };

        // Підписка
        connection.on("JoinedRoom", joinedHandler);
        connection.on("UpdatePlayerList", updateHandler);
        connection.on("Error", errorHandler);
        connection.on("GameStart", gameStartHandler);
        connection.on("GameFinished", gameFinishedHandler); 
        connection.on("PlayerLeft", playerLeftHandler);
        connection.on("RestartRequested", restartRequestedHandler);

        // Відписка
        return () => {
             connection?.off("JoinedRoom", joinedHandler);
             connection?.off("UpdatePlayerList", updateHandler);
             connection?.off("Error", errorHandler);
             connection?.off("GameStart", gameStartHandler);
             connection?.off("GameFinished", gameFinishedHandler); 
             connection?.off("PlayerLeft", playerLeftHandler);
             connection?.off("RestartRequested", restartRequestedHandler);
        };
    }, [connection, codeFromUrl, navigate, startGameWithData, setGameFinished]); // Додали setGameFinished

    // useEffect для відключення
    useEffect(() => {
     return () => {
         connection?.stop().catch(err => console.error("Error stopping connection:", err));
     };
    }, [connection]);

    // --- Рендер ---

    // 🔽🔽🔽 НОВА УМОВА ТУТ 🔽🔽🔽
    // Якщо гра офіційно завершена І опонент після цього вийшов
    if (isGameFinished && opponentLeft) {
         console.log("Rendering 'Opponent Left After Game Finished' message.");
         return (
           <div className="alert alert-warning text-center">
               <h2>Опонент покинув гру після її завершення</h2>
               <p>Ви можете перейти до результатів.</p>
               <button className="btn btn-primary mt-3" onClick={onGoToResults}>
                   Переглянути результати
               </button>
           </div>
         );
    }
    // 🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼

    // Якщо гра в процесі (або тільки-но завершилась, але опонент ще тут)
    if (gameState === 'playing' && gameStartData) {
        return (
            <OnlineGame                 
                key={gameStartData.gameId} 
                settings={gameStartData} 
                connection={connection}
                connectionId={connectionId}
                roomCode={roomCode} 
                onGoToSettings={onGoToSettings}
                onGoToResults={onGoToResults}
                // 'onGameFinished' більше не потрібен тут
                onRestartApproved={handleRestartApproved} 
                opponentLeft={opponentLeft} // Передаємо, щоб портал знав
                opponentWantsRestart={opponentWantsRestart}
                isGameFinished={isGameFinished} 
            />
        );
    }

     // Якщо опонент вийшов з ЛОБІ (до початку гри)
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

    // Рендер лобі очікування
    return (
        <WaitingRoom 
            roomCode={roomCode}
            players={players}
            connectionId={connectionId}
        />
    );
}