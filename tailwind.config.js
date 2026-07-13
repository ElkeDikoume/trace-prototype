/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        trace: {
          950: '#0b1220',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          accent: '#0ea5e9',
          risk: {
            low: '#16a34a',
            medium: '#d97706',
            high: '#dc2626'
          }
        }
      }
    }
  },
  plugins: []
};
