/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        rank: {
          e: '#6b7280',
          d: '#22d3ee',
          c: '#06b6d4',
          b: '#3b82f6',
          a: '#f59e0b',
          s: '#fbbf24',
        },
        pillar: {
          deen: '#22d3ee',
          body: '#f43f5e',
          money: '#fbbf24',
        },
        system: {
          bg: '#000000',
          card: 'rgba(10, 10, 10, 0.9)',
          border: 'rgba(0, 212, 255, 0.3)',
          glow: '#00d4ff',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          dark: '#0a0a0a',
        }
      },
    },
  },
  plugins: [],
}