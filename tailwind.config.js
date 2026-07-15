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
        // Phase 2/3 (v2-demo) mobile shell palette. CSS-variable-backed so the
        // light/dark toggle can swap surface + text colours at runtime (values
        // defined in src/v2/theme.css). Own namespace so it never disturbs the
        // existing trace-* design system. The rgb(... / <alpha-value>) form
        // preserves Tailwind opacity modifiers (e.g. bg-tracev2-card/60).
        tracev2: {
          bg: 'rgb(var(--tv2-bg) / <alpha-value>)',
          card: 'rgb(var(--tv2-card) / <alpha-value>)',
          border: 'rgb(var(--tv2-border) / <alpha-value>)',
          accent: 'rgb(var(--tv2-accent) / <alpha-value>)',
          text: 'rgb(var(--tv2-text) / <alpha-value>)',
          muted: 'rgb(var(--tv2-muted) / <alpha-value>)',
          subtle: 'rgb(var(--tv2-subtle) / <alpha-value>)',
          risk: {
            high: 'rgb(var(--tv2-risk-high) / <alpha-value>)',
            medium: 'rgb(var(--tv2-risk-medium) / <alpha-value>)',
            low: 'rgb(var(--tv2-risk-low) / <alpha-value>)'
          }
        }
      }
    }
  },
  plugins: []
};
