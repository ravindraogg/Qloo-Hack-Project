/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-dark': '#1e3a8a',
        'blue-light': '#60a5fa',
      },
    },
  },
  plugins: [],
};