/**
 * Formats a total duration in seconds into a standard "MM:SS" string.
 * Uses padding to ensure both minutes and seconds are always represented by two digits,
 * adding a leading zero if necessary.
 * * @param {number} seconds - The total number of seconds to format.
 * @returns {string} The formatted time string (e.g., "05:09").
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}