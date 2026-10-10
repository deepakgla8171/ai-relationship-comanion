/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0d18',
          subtle: '#0f1424',
          card: 'rgba(17, 24, 39, 0.75)',
          surface: '#161e31'
        },
        neon: {
          violet: '#a855f7',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          fuchsia: '#d946ef',
          emerald: '#10b981'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
