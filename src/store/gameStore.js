import { create } from 'zustand';

const loadHistory = () => {
const saved = localStorage.getItem('gameSessionHistory');
try {
 return saved ? JSON.parse(saved) : [];
} catch (e) {
 console.error("Failed to parse game history:", e);
 localStorage.removeItem('gameSessionHistory');
return [];
 }
};

const initialHistory = loadHistory();
const initialLockedMode = initialHistory.length > 0 ? initialHistory[0].mode : null;

export const useGameStore = create((set) => ({

 gameSettings: null,
 history: initialHistory,
lockedMode: initialLockedMode,

clearSession: () => {
 set({
 gameSettings: null,
 history: [],
lockedMode: null,
 });
 localStorage.removeItem('gameSessionHistory');
 },

setGameSession: (settings, lockedMode) => {
 set({
 gameSettings: settings,
 lockedMode: lockedMode,
 });
 },

 addGameToHistory: (gameResult) => {
 set((state) => {
const newHistory = [gameResult, ...state.history];
 try {
 localStorage.setItem('gameSessionHistory', JSON.stringify(newHistory));
 } catch (e) {
console.error("Failed to save game history to localStorage:", e);
 }


 return { history: newHistory };
});
 },
}));