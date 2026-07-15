// Light/dark theme for the v2 shell. Persists to localStorage under
// 'trace_theme'. Default is dark (the original ?v2 look). The theme class is
// applied on PhoneFrame's root div; the actual colour swap happens via the
// tracev2-* CSS variables in theme.css.
import { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'trace_theme';
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
