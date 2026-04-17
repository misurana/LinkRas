/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: 'var(--bg-900)',
          800: 'var(--bg-800)',
          700: 'var(--bg-700)',
        },
        primary: {
          500: '#7c3aed', 
          600: '#6d28d9',
        },
        accent: {
          500: '#10b981', 
        },
        gray: {
          100: 'var(--text-primary)',
          400: 'var(--text-secondary)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        }
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'white/5': 'rgba(255,255,255,0.02)', // default
        'white/10': 'var(--border-color)', // redirect to theme border
        'dark-900/50': 'var(--glass-bg)',
      }),
      borderColor: theme => ({
        ...theme('colors'),
        DEFAULT: 'var(--border-color)',
        'white/10': 'var(--border-color)',
        'gray-700': 'var(--border-color)',
      }),
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
