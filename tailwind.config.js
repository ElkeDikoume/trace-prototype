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
        },
        // Phase 2 (v2-demo) mobile shell palette. Kept as its own namespace so
        // the new mobile-first screens can use their exact spec colors without
        // disturbing the existing trace-* design system.
        tracev2: {
          bg: '#0f1117',
          card: '#1a2035',
          border: '#2a3350',
          accent: '#3b4fd8',
          risk: {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
          }
        }
      }
    }
  },
  plugins: []
};
