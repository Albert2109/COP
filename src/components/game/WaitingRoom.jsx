import React from 'react';

export default function WaitingRoom({ roomCode, players, connectionId }) {
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