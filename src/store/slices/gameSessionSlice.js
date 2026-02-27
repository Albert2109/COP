/**
 * Zustand slice responsible for managing the active game session state.
 * It tracks current game configurations and determines if certain modes are 
 * locked (e.g., when joining a specific online room via a direct link).
 * * @function
 * @param {Function} set - Zustand's internal state setter.
 * @returns {Object} An object containing the session state and action handlers.
 * * @property {Object|null} gameSettings - Stores the configuration for the current match (colors, grid size, bot level).
 * @property {string|null} lockedMode - Indicates if the game mode is forced (e.g., 'online') and cannot be changed by the user.
 * @property {Function} setGameSession - Updates the session data and sets the mode lock status.
 * @property {Function} clearSession - Resets the session data to its initial null state.
 */
export const createGameSessionSlice = (set) => ({
  /**
   * Current match configuration.
   * @type {Object|null}
   */
  gameSettings: null,

  /**
   * Forced game mode identifier.
   * @type {string|null}
   */
  lockedMode: null,

  /**
   * Initializes or updates the current game session.
   * @param {Object} settings - The game settings to be applied.
   * @param {string|null} lockedMode - The mode to lock the UI to.
   */
  setGameSession: (settings, lockedMode) => {
    set({
      gameSettings: settings,
      lockedMode: lockedMode,
    }, false, 'session/setGame');
  },

  /**
   * Clears all session-related data. 
   * Useful when returning to the main menu to start a fresh configuration.
   */
  clearSession: () => {
    set({
      gameSettings: null,
      lockedMode: null,
    }, false, 'session/clear');
  },
});