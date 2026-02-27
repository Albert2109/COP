/**
 * Zustand slice responsible for maintaining the match history log.
 * Stores an array of completed game results and provides a method to append 
 * new outcomes to the beginning of the list (Last-In, First-Out).
 * * @function
 * @param {Function} set - Zustand's internal state setter.
 * @returns {Object} An object containing the history state and its associated action.
 * * @property {Array<Object>} history - An array of objects, where each object represents a completed match.
 * @property {Function} addGameToHistory - Action to prepend a new game result to the history array.
 */
export const createHistorySlice = (set) => ({
  /**
   * The list of match results recorded during the active session.
   * @type {Array<{id: string, winner: string, time: string, mode: string, botLevel: string|null}>}
   */
  history: [],

  /**
   * Adds a new game outcome to the session history.
   * Uses an immutable update pattern to ensure React re-renders correctly.
   * * @param {Object} gameResult - The result data of the finished game.
   * @param {string} gameResult.id - Unique identifier for the match (e.g., ISO timestamp).
   * @param {string} gameResult.winner - The winner of the match ('player', 'bot', or 'draw').
   * @param {string} gameResult.time - The formatted duration of the match.
   * @param {string} gameResult.mode - The game mode played ('bot' or 'online').
   */
  addGameToHistory: (gameResult) => {
    set((state) => ({
      history: [gameResult, ...state.history]
    }), false, 'history/addResult');
  },
});