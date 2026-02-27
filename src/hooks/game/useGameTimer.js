import { useEffect } from 'react';

/**
 * A custom hook that manages the game session's total elapsed time.
 * It sets up a 1-second interval that updates the game duration as long as the match is active.
 * Automatically handles cleanup by clearing the interval when the game is paused, finished, 
 * or the component is unmounted.
 * * 
 * * @hook
 * @param {boolean} isGameActive - A flag determining if the timer should be running (true) or paused (false).
 * @param {Function} onTimeUpdate - A callback function (usually a state setter) that receives the previous time and returns the updated time.
 */
export function useGameTimer(isGameActive, onTimeUpdate) {
  useEffect(() => {
    // Prevent the timer from running if the game state is inactive (e.g., game over or paused)
    if (!isGameActive) return;

    const interval = setInterval(() => {
      onTimeUpdate(prev => prev + 1);
    }, 1000);

    // Cleanup function to clear the interval and prevent memory leaks
    return () => clearInterval(interval);
  }, [isGameActive, onTimeUpdate]);
}