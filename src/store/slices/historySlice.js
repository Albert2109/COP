
export const createHistorySlice = (set) => ({
  history: [],

  addGameToHistory: (gameResult) => {
    set((state) => ({
      history: [gameResult, ...state.history]
    }), false, 'history/addResult');
  },
});