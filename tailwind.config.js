/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.stories.{js,ts,jsx,tsx}", // Це дозволить Storybook бачити твої стилі
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}