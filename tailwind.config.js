/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orbit: { 50: '#eefbfc', 100: '#d8f5f7', 200: '#b6edf0', 300: '#80dfe5', 400: '#41cbd4', 500: '#20b2bf', 600: '#168d9c', 700: '#176f7c', 800: '#195965', 900: '#194a55' },
        navy: { 800: '#142b48', 900: '#0f2038' }
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'] },
      boxShadow: { soft: '0 12px 34px rgba(29, 57, 90, 0.07)', lift: '0 18px 42px rgba(22, 62, 98, 0.12)' }
    }
  },
  plugins: [],
};