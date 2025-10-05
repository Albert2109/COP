export default function StartPage({ onStart }) {
  return (
    <div className="start-page text-center">
      <h1>Чотири в ряд</h1>
      <button  onClick={onStart}>
        Старт гри
      </button>
    </div>
  );
}
