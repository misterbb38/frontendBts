/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Couleur principale (bleu)
        "primary-dark": "#2563EB", // Version plus foncée
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}