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
