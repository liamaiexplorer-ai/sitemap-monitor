/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-bg': '#f8f9fc',
        'glass-border': 'rgba(255, 255, 255, 0.4)',
        'primary-glow': 'rgba(124, 58, 237, 0.15)',
        'accent-glow': 'rgba(34, 211, 238, 0.15)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      animation: {
        'slow-spin': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
