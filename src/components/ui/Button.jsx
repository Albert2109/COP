/**
 * A reusable, styled button component used throughout the application.
 * Applies consistent gradient backgrounds, hover states, and click animations 
 * (scaling) using Tailwind CSS to maintain uniform UI design.
 * * @component
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button (e.g., text, icons).
 * @param {Function} props.onClick - The callback function executed when the button is clicked.
 * @returns {JSX.Element} The rendered styled button.
 */
export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 active:scale-95 transition-all duration-200"
    >
      {children}
    </button>
  );
}