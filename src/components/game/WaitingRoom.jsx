import React from 'react';

/**
 * Renders the matchmaking lobby interface where users wait for an opponent to join.
 * Displays the unique room code with a copy-to-clipboard feature and dynamically lists 
 * the connected players. Transitions automatically when the room is full.
 * * @component
 * @param {Object} props - The component properties.
 * @param {string} props.roomCode - The unique alphanumeric identifier for the current game session.
 * @param {Array<Object>} props.players - An array of player objects currently connected to the room.
 * @param {string} props.players[].connectionId - The unique SignalR connection ID of the player.
 * @param {string} props.players[].nickname - The display name of the player.
 * @param {string} props.connectionId - The local user's SignalR connection ID, used to identify "You" in the list.
 * @returns {JSX.Element} The rendered waiting room interface.
 */
export default function WaitingRoom({ roomCode, players, connectionId }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <div className="w-full max-w-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="text-5xl animate-bounce">🎮</div>
                        <h1 className="text-5xl font-black text-white drop-shadow-lg">Connect Four</h1>
                    </div>
                    <p className="text-white text-xl font-semibold drop-shadow-md">Кімната очікування</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="text-3xl animate-pulse">⚡</div>
                            <h2 className="text-3xl font-bold">Готуйтеся до гри!</h2>
                        </div>
                        <p className="text-center text-lg opacity-90">
                            {roomCode ? "Ваша кімната створена ✨" : "З'єднання та створення кімнати..."}
                        </p>
                    </div>

                    <div className="p-8 md:p-10 space-y-8">
                        {roomCode && (
                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                                <p className="text-gray-600 text-sm font-semibold mb-3 text-center">КОД КІМНАТИ</p>
                                <div className="flex items-center gap-3 justify-center">
                                    <div className="bg-white rounded-xl p-4 border-3 border-purple-400 shadow-lg">
                                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 tracking-widest">
                                            {roomCode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        className={`p-4 rounded-xl transition-all duration-300 transform ${
                                            copied
                                                ? 'bg-green-500 scale-110'
                                                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:scale-105'
                                        } text-white shadow-lg hover:shadow-xl`}
                                    >
                                        {copied ? '✓' : '📋'}
                                    </button>
                                </div>
                                <p className="text-center text-gray-600 text-sm mt-3 font-medium">
                                    {copied ? '✓ Скопійовано!' : 'Клацніть щоб скопіювати'}
                                </p>
                                <p className="text-center text-gray-700 text-sm mt-4 font-semibold">
                                    📋 Поділіться цим кодом з другом, щоб він приєднався до гри!
                                </p>
                            </div>
                        )}

                        {!roomCode && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 text-center">
                                <div className="inline-block">
                                    <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500 animate-spin mx-auto mb-4"></div>
                                </div>
                                <p className="text-gray-700 font-semibold text-lg">
                                    З'єднуємось з сервером...
                                </p>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">👥</span>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Гравці в кімнаті ({players.length}/2)
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {players.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500 font-medium">Завантаження гравців...</p>
                                    </div>
                                ) : (
                                    <>
                                        {players.map((p, idx) => (
                                            <div
                                                key={p.connectionId}
                                                className={`rounded-xl p-4 border-2 transition-all duration-300 transform ${
                                                    p.connectionId === connectionId
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-500 shadow-lg scale-105'
                                                        : 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 hover:scale-102'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            p.connectionId === connectionId ? 'bg-green-500 animate-pulse' : 'bg-purple-500'
                                                        }`}></div>
                                                        <span className="font-bold text-gray-800 text-lg">
                                                            {p.nickname}
                                                        </span>
                                                    </div>
                                                    {p.connectionId === connectionId && (
                                                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                                            👑 Це ви
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {players.length < 2 && (
                                            <div className="rounded-xl p-6 border-3 border-dashed border-yellow-400 bg-yellow-50 text-center">
                                                <div className="inline-block animate-bounce">
                                                    <p className="text-5xl mb-2">⏳</p>
                                                </div>
                                                <p className="text-yellow-800 font-bold text-lg">
                                                    Очікування другого гравця...
                                                </p>
                                                <p className="text-yellow-700 text-sm mt-2">
                                                    Поділіться кодом кімнати вище 👆
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {players.length === 2 && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center shadow-2xl animate-pulse">
                                <p className="text-3xl mb-2">🎉</p>
                                <p className="text-xl font-bold">Обидва гравці готові!</p>
                                <p className="text-sm opacity-90 mt-2">Гра почнеться автоматично...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-white text-sm font-medium drop-shadow-lg">
                        🎮 Connect Four Online 🎮
                    </p>
                </div>
            </div>
        </div>
    );
}