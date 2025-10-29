import Button from "../components/ui/Button";

export default function StartPage({ onStart }) {
  return (
    <div className="start-page text-center">
      <h1>Чотири в ряд</h1>
      <Button onClick={onStart}>Грати</Button>
    </div>
  );
}
