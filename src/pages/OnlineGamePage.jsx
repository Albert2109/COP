import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSignalR } from '../hooks/api/useSignalR'; 
import { HubConnectionState } from '@microsoft/signalr';
import OnlineGame from '../components/game/OnlineGame';
import WaitingRoom from '../components/game/WaitingRoom'; 

/**
 * Page component that manages the lifecycle of an online multiplayer session.
 * Handles SignalR connection, room management (creation/joining), player synchronization,
 * and game state transitions (waiting vs. playing).
 * * 
 * * @component
 * @param {Object} props - Component properties.
 * @param {Object} props.settings - Global game settings (nickname, colors, board size).
 * @param {Function} props.onGoToSettings - Callback to return to the settings menu.
 * @param {Function} props.onGoToResults - Callback to navigate to the results/history page.
 * @param {Function} props.onGameFinished - Callback to save match results to the local history.
 */
export default function OnlineGamePage({
    settings, 
    onGoToSettings,
    onGoToResults,
    onGameFinished 
}) {
    const { roomCode: codeFromUrl } = useParams();
    const navigate = useNavigate(); 

    /** @type {[string, function]} Current game phase: 'waiting' or 'playing' */
    const [gameState, setGameState] = useState('waiting'); 
    /** @type {[Array, function]} List of players currently in the room */
    const [players, setPlayers] = useState([]); 
    /** @type {[string, function]} Current unique room identifier */
    const [roomCode, setRoomCode] = useState(codeFromUrl === 'new' ? "" : codeFromUrl); 
    /** @type {[Object|null, function]} Data required to initialize the board and turn order */
    const [gameStartData, setGameStartData] = useState(null);
    const [opponentLeft, setOpponentLeft] = useState(false);
    const [opponentWantsRestart, setOpponentWantsRestart] = useState(false); 
    const [pendingGameData, setPendingGameData] = useState(null);

    const [isGameFinished, setIsGameFinished] = useState(false);
    /** @type {Object} Ref to access completion state inside SignalR closures without stale data */
    const isGameFinishedRef = useRef(isGameFinished); 
    const didIClickPlayAgainRef = useRef(false);

    const { connection, startConnection, connectionId } = useSignalR();
    const joinAttempted = useRef(false);

    /**
     * Updates the game completion state both in state and in the reference.
     * @param {boolean} value 
     */
    const setGameFinished = useCallback((value) => {
        setIsGameFinished(value);
        isGameFinishedRef.current = value;
    }, []); 

    /**
     * Effect: Ensures SignalR connection is active.
     */
    useEffect(() => {
     if (connection && connection.state === HubConnectionState.Disconnected) {
         startConnection().catch(() => {
             alert("Не вдалося підключитися до сервера. Оновіть сторінку.");
         });
     }
    }, [connection, startConnection]);

    /**
     * Effect: Joins or creates a room once the connection is established.
     */
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
             console.error("Join room error: ", err);
             joinAttempted.current = false; 
             navigate('/settings'); 
         });
     }
    }, [connection, connectionId, settings.nickname, settings.rows, settings.columns, codeFromUrl, navigate]); 

    /**
     * Prepares parameters for the online match and switches view to the game board.
     * @param {Object} gameData - Initial game parameters from the server.
     */
    const startGameWithData = useCallback((gameData) => {
        if (!connectionId || !gameData || !gameData.players) return;
        
        const actualPlayers = gameData.players; 
        setPlayers(actualPlayers);
        const myPlayer = actualPlayers.find(p => p.connectionId === connectionId); 

        if (!myPlayer) return;
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

    /**
     * Handles the 'Play Again' request logic between two networked players.
     */
    const handleRestartApproved = useCallback(() => {
        didIClickPlayAgainRef.current = true; 
        if (pendingGameData) {
            startGameWithData(pendingGameData); 
        }
    }, [pendingGameData, startGameWithData]);

    /**
     * Effect: Registers and cleans up SignalR event listeners for room and game updates.
     */
    useEffect(() => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;

        const joinedHandler = (code, playerList) => {
            setRoomCode(code); 
            setPlayers(playerList);
            if (codeFromUrl !== code) {
                navigate(`/online-game/${code}`, { replace: true });
            }
        };

        const gameStartHandler = (gameData) => {
            if (isGameFinishedRef.current) {
                setPendingGameData(gameData);
                if (didIClickPlayAgainRef.current) startGameWithData(gameData);
            } else {
                startGameWithData(gameData);
            }
        };
        
       const gameFinishedHandler = (winnerConnectionId, time) => {
             if (!isGameFinishedRef.current) { 
                 setGameFinished(true); 
                 if (winnerConnectionId !== undefined && time && onGameFinished) {
                    let relativeWinner = winnerConnectionId === connectionId ? 'player' : (winnerConnectionId ? 'bot' : 'draw');
                    onGameFinished({ winner: relativeWinner, time });
                 }
             }
        };

        connection.on("JoinedRoom", joinedHandler);
        connection.on("UpdatePlayerList", setPlayers);
        connection.on("GameStart", gameStartHandler);
        connection.on("GameFinished", gameFinishedHandler); 
        connection.on("PlayerLeft", () => setOpponentLeft(true));
        connection.on("RestartRequested", () => {
             setOpponentWantsRestart(true); 
             setTimeout(() => setOpponentWantsRestart(false), 7000);
        });

        return () => {
             connection.off("JoinedRoom");
             connection.off("UpdatePlayerList");
             connection.off("GameStart");
             connection.off("GameFinished"); 
             connection.off("PlayerLeft");
             connection.off("RestartRequested");
        };
    }, [connection, codeFromUrl, navigate, startGameWithData, setGameFinished]); 

    // Final cleanup of the connection when the page is destroyed
    useEffect(() => {
     return () => {
         connection?.stop().catch(err => console.error("Error stopping SignalR:", err));
     };
    }, [connection]);

    // UI Rendering Logic based on connection and opponent status
    if (isGameFinished && opponentLeft) {
         return (
           <div className="alert alert-warning text-center p-10">
               <h2 className="text-2xl font-bold">Опонент покинув гру</h2>
               <button className="btn btn-primary mt-5" onClick={onGoToResults}>Результати</button>
           </div>
         );
    }

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
                onRestartApproved={handleRestartApproved} 
                opponentLeft={opponentLeft} 
                opponentWantsRestart={opponentWantsRestart}
                isGameFinished={isGameFinished} 
            />
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