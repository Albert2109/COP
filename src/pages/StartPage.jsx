import Button from "../components/ui/Button";

/**
 * Props for the StartPage component.
 * @typedef {Object} StartPageProps
 * @property {Function} onStart - Callback function triggered when the user clicks the "Play" button to begin the game setup.
 */

/**
 * The initial entry point component for the application.
 * Renders the welcome screen with the game title and a primary call-to-action button.
 * This page serves as the first step in the user flow before navigating to settings or game modes.
 * @component
 * @category Pages
 * @param {StartPageProps} props - The component properties.
 * @returns {JSX.Element} The rendered start page.
 */
export default function StartPage({ onStart }) {
  return (
    <div className="start-page text-center">
      <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
        Чотири в ряд
      </h1>
      <Button onClick={onStart}>Грати</Button>
    </div>
  );
}