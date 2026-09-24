/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          bg: '#F1F5F9',
          surface: '#FFFFFF',
          dark: '#0F172A',
          primary: '#1D4ED8',
          gold: '#D97706',
          emerald: '#059669',
          danger: '#DC2626',
          purple: '#9333EA',
          pending: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
