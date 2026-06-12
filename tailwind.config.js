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
        playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        // Khalifa-Solo Leveling Palette
        khalifa: {
          void: '#0B0B0F',
          blue: '#3B82F6',
          gold: '#EAB308',
          purple: '#7C3AED',
          amber: '#F59E0B',
          steel: '#4B5563',
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