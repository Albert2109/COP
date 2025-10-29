import { useState, useEffect, useCallback } from 'react'; 
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

const HUB_URL = "https://localhost:7170/gameHub"; 

export function useSignalR() {
  const [connection, setConnection] = useState(null);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
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