/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease',
        'fade-in': 'fadeIn 0.3s ease-out',
        'check-bounce': 'checkBounce 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'success-glow': 'successGlow 0.4s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(20, 184, 166, 0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        checkBounce: {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        successGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.5)' },
          '100%': { boxShadow: '0 0 0 12px rgba(16, 185, 129, 0)' },
        },
      },
    },
  },
  plugins: [],
}
