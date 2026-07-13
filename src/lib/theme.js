const THEME_KEY = 'trace_theme';

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function storeTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
