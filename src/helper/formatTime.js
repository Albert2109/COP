/**
 * Formats a total duration in seconds into a standard "MM:SS" string format.
 * Uses string padding to ensure both minutes and seconds are always represented 
 * by at least two digits, adding a leading zero if necessary. This is primarily 
 * used for displaying elapsed game time or turn timers in the UI.
 * * @category Utilities
 * @param {number} seconds - The total number of seconds to format (should be a positive integer).
 * @returns {string} The formatted time string (e.g., "05:09", "12:34").
 * * @example
 * // Returns "05:09"
 * formatTime(309);
 * * @example
 * // Returns "00:42"
 * formatTime(42);
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}