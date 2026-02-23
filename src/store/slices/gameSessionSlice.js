export const createGameSessionSlice = (set) => ({
  gameSettings: null,
  lockedMode: null,

  setGameSession: (settings, lockedMode) => {
    set({
      gameSettings: settings,
      lockedMode: lockedMode,
    }, false, 'session/setGame');
  },

  clearSession: () => {
    set({
      gameSettings: null,
      lockedMode: null,
    }, false, 'session/clear');
  },
});