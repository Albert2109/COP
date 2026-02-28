/**
 * Represents a single game match result stored in the history.
 * @typedef {Object} GameResult
 * @property {string} id - Unique identifier for the match (e.g., ISO timestamp).
 * @property {string} winner - The winner of the match ('player', 'bot', or 'draw').
 * @property {string} time - The formatted duration of the match.
 * @property {string} mode - The game mode played ('bot' or 'online').
 * @property {string|null} [botLevel] - Difficulty level if the mode was 'bot'.
 */

/**
 * The state and actions provided by the History slice.
* @typedef {Object} HistorySlice
 * @property {Array<GameResult>} history - The list of match results.
 * @property {Function} addGameToHistory - Action to prepend a new game result.
 */

/**
 * Zustand slice responsible for maintaining the match history log.
 * Stores an array of completed game results and provides a method to append 
 * new outcomes to the beginning of the list (Last-In, First-Out).
 * 
 * @category Stores
 * @param {Function} set - Zustand's internal state setter.
 * @returns {HistorySlice} An object containing the history state and its associated action.
 */
export const createHistorySlice = (set) => ({
  /**
   * The list of match results recorded during the active session.
   * @type {Array<GameResult>}
   */
  history: [],

  /**
   * Adds a new game outcome to the session history.
   * Uses an immutable update pattern to ensure React re-renders correctly.
   * @param {GameResult} gameResult - The result data of the finished game.
   */
  addGameToHistory: (gameResult) => {
    set((state) => ({
      history: [gameResult, ...state.history]
    }), false, 'history/addResult');
  },
});