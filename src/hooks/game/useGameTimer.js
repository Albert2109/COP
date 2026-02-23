import { useEffect } from 'react';

export function useGameTimer(isGameActive, onTimeUpdate) {
  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      onTimeUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, onTimeUpdate]);
}


