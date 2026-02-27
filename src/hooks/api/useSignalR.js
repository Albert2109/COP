import { useState, useEffect, useCallback } from 'react'; 
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

/**
 * Custom hook to manage the SignalR lifecycle for real-time multiplayer functionality.
 * It initializes the hub connection, handles automatic reconnections, and provides
 * a method to manually start the connection when the user enters the multiplayer mode.
 * * @hook
 * @returns {Object} SignalR connection state and control methods.
 * @property {HubConnection|null} connection - The SignalR connection instance used to invoke hub methods and listen to events.
 * @property {Function} startConnection - An asynchronous function to initiate the connection to the game hub.
 * @property {string|null} connectionId - The unique identifier for the current active connection assigned by the server.
 */
export function useSignalR() {
  const [connection, setConnection] = useState(null);
  const [connectionId, setConnectionId] = useState(null);

  /**
   * Initializes the HubConnection instance on component mount.
   * Configures automatic reconnection and handles the cleanup by stopping the connection on unmount.
   */
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7170/gameHub") 
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.onreconnected(id => {
      setConnectionId(id);
      console.log("SignalR Reconnected!", id);
    });

    return () => {
      newConnection.stop().catch(err => console.error("Error stopping connection:", err));
    };
  }, []); 

  /**
   * Starts the SignalR connection if it is currently in a disconnected state.
   * Updates the local connectionId state upon successful connection.
   * * @async
   * @callback
   * @throws Will throw an error if the connection attempt fails.
   */
  const startConnection = useCallback(async () => {
    if (connection && connection.state === HubConnectionState.Disconnected) {
      try {
        await connection.start();
        setConnectionId(connection.connectionId); 
        console.log("SignalR Connected!", connection.connectionId);
      } catch (e) {
        console.error("SignalR Connection failed: ", e);
        throw e; 
      }
    } else if (connection && connection.state === HubConnectionState.Connected) {
        setConnectionId(connection.connectionId);
    }
  }, [connection]); 

  return { connection, startConnection, connectionId };
}