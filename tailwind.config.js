/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/.{js,jsx,ts,tsx}",
    "./src/*/**.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/**.{js,jsx,ts,tsx}",
  ],  
  theme: {
    extend: {
      fontFamily: {
        vt323: ['VT323'], 
      },
    },
  },
  plugins: [],
}