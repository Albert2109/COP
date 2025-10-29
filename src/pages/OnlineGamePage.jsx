import { useState, useEffect, useRef } from 'react';
import { useSignalR } from '../hooks/api/useSignalR'; 
import { HubConnectionState } from '@microsoft/signalr';
import OnlineGame from '../components/game/OnlineGame';
import WaitingRoom from '../components/game/WaitingRoom'; 

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
        <WaitingRoom 
            roomCode={roomCode}
            players={players}
            connectionId={connectionId}
        />
    );
}