import { useState, useCallback } from 'react';

import { GameSettingsContext } from './GameSettingsContext'; 


export default function GameSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gameSettings');
    return saved ? JSON.parse(saved) : null;
  });

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
  }, []);

  const clearSettings = useCallback(() => {
    setSettings(null);
    localStorage.removeItem('gameSettings');
  }, []);

  return (
    <GameSettingsContext.Provider value={{ settings, saveSettings, clearSettings }}>
      {children}
    </GameSettingsContext.Provider>
  );
}