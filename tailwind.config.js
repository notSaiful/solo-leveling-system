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
        // Rank colors are defined manually in src/index.css as .text-rank-* utilities
        // to ensure they override Tailwind generated classes consistently.
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