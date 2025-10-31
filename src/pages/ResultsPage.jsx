import ResultInfo from "../components/results/ResultInfo";
import { useGameStore } from '../store/gameStore'; 


export default function ResultsPage({ onRestart }) {

 const history = useGameStore((state) => state.history);

 if (!history || history.length === 0) {
 return (
<div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 dark:bg-pink-900 p-6">
 <div className="bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200 rounded-2xl p-6 shadow-lg text-center">
<h2 className="text-2xl font-extrabold mb-2 drop-shadow-md">Історія сесії порожня</h2>
 <p className="text-pink-600 dark:text-pink-300">Результати з'являться тут, коли ви зіграєте партію.</p>
 </div>
 <button
 className="mt-6 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-md transition-colors duration-300"
 onClick={onRestart}
 >
 На головну
 </button>
 </div>
 );
 }

return (
 <div className="p-6 bg-pink-50 dark:bg-pink-900 min-h-screen">
 <div className="text-center mb-6">
 <h2 className="text-3xl font-extrabold text-pink-600 dark:text-pink-400 mb-2 drop-shadow-md">
 Результати поточної сесії
 </h2>
 <p className="text-pink-700 dark:text-pink-300">
 Історія очиститься, коли ви почнете нову гру з головного меню.
 </p>
 </div>

<div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">

 {history.map((game) => (
 <div
 key={game.id}
 className="bg-pink-100 dark:bg-pink-800 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
 >
 <ResultInfo
 winner={game.winner}
 time={game.time}
 botLevel={game.botLevel}
 mode={game.mode}
 />
 </div>
 ))}
 </div>

 <div className="text-center mt-6">
 <button
className="px-6 py-2 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 active:scale-95 transition-all duration-200"
 onClick={onRestart}
 >
 На головну
</button>
 </div>
 </div>
 );
}