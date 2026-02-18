/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        sm: 'var(--shadow-1)',
        DEFAULT: 'var(--shadow-1)',
        md: 'var(--shadow-2)',
        lg: 'var(--shadow-2)',
        xl: 'var(--shadow-3)',
        '2xl': 'var(--shadow-3)',
      },
      borderRadius: {
        chip: 'var(--radius-chip)',
        btn: 'var(--radius-btn)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
      }
    }
  },
  plugins: []
};
