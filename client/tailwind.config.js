/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#06070a',
          900: '#0b0d13',
          850: '#11141c',
          800: '#171c26',
          700: '#232b3b',
          600: '#344055',
        },
        meanwhile: {
          lime: '#00ff87',
          neon: '#10e760',
          darkgreen: '#05381e',
          cyan: '#00e5ff',
          amber: '#ffaa00',
          crimson: '#ff3366',
        },
        veloce: {
          lime: '#00ff87',
          neon: '#10e760',
          darkgreen: '#05381e',
          cyan: '#00e5ff',
          amber: '#ffaa00',
          crimson: '#ff3366',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-lime': '0 0 25px -5px rgba(0, 255, 135, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 229, 255, 0.4)',
        'glow-crimson': '0 0 25px -5px rgba(255, 51, 102, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser-scan': 'laser 2s linear infinite',
      },
      keyframes: {
        laser: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}
