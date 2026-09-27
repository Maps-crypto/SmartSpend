/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f4ec',
          100: '#c5e5d3',
          500: '#1a7a4c',
          600: '#15653e',
          700: '#145c3a',
          800: '#0e4129',
        }
      }
    },
  },
  plugins: [],
};
