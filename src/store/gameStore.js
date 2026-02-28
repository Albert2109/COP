import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createGameSessionSlice } from './slices/gameSessionSlice';
import { createHistorySlice } from './slices/historySlice';

/**
 * The primary global state store for the Connect Four application.
 * Utilizes a slice-based architecture to separate concerns between game sessions 
 * and match history.
 * * 
 * * @category Stores
 * @see createGameSessionSlice
 * @see createHistorySlice
 * @returns {Object} Combined state and actions from GameSession and History slices.
 */
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