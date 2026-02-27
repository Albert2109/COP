import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createGameSessionSlice } from './slices/gameSessionSlice';
import { createHistorySlice } from './slices/historySlice';

/**
 * The primary global state store for the Connect Four application.
 * Utilizes a slice-based architecture to separate concerns between game sessions 
 * and match history.
 * * Features:
 * - **Redux DevTools**: Integrated for real-time state debugging.
 * - **Persistence**: Automatically synchronizes the state with the browser's `localStorage` 
 * to preserve match history and settings across page refreshes.
 * * 
 * * @module useGameStore
 * @type {Function}
 * @returns {Object} Combined state and actions from GameSession and History slices.
 */
export const useGameStore = create(
  devtools(
    persist(
      /**
       * Combines multiple state slices into a single store.
       * @param {Array} a - Spread arguments provided by Zustand's middleware (set, get, store).
       */
      (...a) => ({
        ...createGameSessionSlice(...a),
        ...createHistorySlice(...a),
      }),
      {
        /**
         * Configuration for the persistence middleware.
         * The store data is saved under the key 'ConnectFourStore' in Local Storage.
         */
        name: 'ConnectFourStore', 
      }
    )
  )
);