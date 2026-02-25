
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createGameSessionSlice } from './slices/gameSessionSlice';
import { createHistorySlice } from './slices/historySlice';
export const useGameStore = create(
  devtools(
    persist(
      (...a) => ({
        ...createGameSessionSlice(...a),
        ...createHistorySlice(...a),
      }),
      {
        name: 'ConnectFourStore', 
      }
    )
  )
);