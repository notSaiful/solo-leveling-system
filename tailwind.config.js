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
          void: '#09090B',
          blue: '#0EA5E9',
          gold: '#D97706',
          purple: '#7C3AED',
          amber: '#F59E0B',
          steel: '#64748B',
        },
        cyan: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        pillar: {
          deen: '#0EA5E9',
          body: '#F59E0B',
          money: '#D97706',
        },
        system: {
          bg: '#09090B',
          card: '#111115',
          border: 'rgba(148, 163, 184, 0.15)',
          glow: 'rgba(14, 165, 233, 0.2)',
          cyan: '#0EA5E9',
          blue: '#0EA5E9',
          dark: '#0c0c0f',
        }
      },
    },
  },
  plugins: [],
}