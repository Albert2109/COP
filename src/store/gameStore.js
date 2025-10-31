import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useGameStore = create(
  devtools(
    persist(
      (set) => ({
        gameSettings: null,
        history: [],
        lockedMode: null,

        clearSession: () => {
          set({
            gameSettings: null,
            history: [],
            lockedMode: null,
          }, false, 'session/clear');
        },

        setGameSession: (settings, lockedMode) => {
          set({
            gameSettings: settings,
            lockedMode: lockedMode,
          }, false, 'session/setGame');
        },

        addGameToHistory: (gameResult) => {
          set((state) => ({
            history: [gameResult, ...state.history]
          }), false, 'history/addResult');
        },
      }),
      {
        name: 'game-session-storage', 
      }
    ),
    {
      name: 'ConnectFourStore', 
    }
  )
);
