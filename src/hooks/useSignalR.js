import { useState, useEffect, useCallback } from 'react'; // Додано useCallback
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

const HUB_URL = "https://localhost:7170/gameHub"; // ❗ ЗАМІНИ НА АДРЕСУ СВОГО СЕРВЕРА

export function useSignalR() {
  const [connection, setConnection] = useState(null);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    // Додаємо слухач зміни стану для оновлення connectionId
    newConnection.onreconnected(id => {
      setConnectionId(id);
      console.log("SignalR Reconnected!", id);
    });

    // Очистка при розмонтуванні
    return () => {
      newConnection.stop().catch(err => console.error("Error stopping connection:", err));
    };
  }, []); // Пустий масив залежностей, створюємо з'єднання один раз

  // Обгортаємо startConnection в useCallback
  const startConnection = useCallback(async () => {
    if (connection && connection.state === HubConnectionState.Disconnected) {
      try {
        await connection.start();
        setConnectionId(connection.connectionId); // Встановлюємо ID тут
        console.log("SignalR Connected!", connection.connectionId);
      } catch (e) {
        console.error("SignalR Connection failed: ", e);
        // Повторна спроба або повідомлення про помилку
        throw e; // Прокидуємо помилку далі
      }
    } else if (connection && connection.state === HubConnectionState.Connected) {
       // Якщо вже підключено, просто оновлюємо ID (про всяк випадок)
       setConnectionId(connection.connectionId);
    }
  }, [connection]); // Залежність тільки від 'connection'

  return { connection, startConnection, connectionId };
}