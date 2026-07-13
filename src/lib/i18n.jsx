import { createContext, useContext } from 'react';
import { translations } from '../data/translations.js';

const LANG_KEY = 'trace_ui_language';

// aiName is the plain-English language name used in Claude system prompts
// ("Respond in French..."), independent of how the label is displayed.
export const UI_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr', aiName: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr', aiName: 'French' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl', aiName: 'Arabic' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr', aiName: 'Spanish' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', dir: 'ltr', aiName: 'Portuguese' }
];

export function getStoredLanguage() {
  const stored = localStorage.getItem(LANG_KEY);
  return UI_LANGUAGES.some((l) => l.code === stored) ? stored : 'en';
}

export function storeLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function getLanguageMeta(code) {
  return UI_LANGUAGES.find((l) => l.code === code) || UI_LANGUAGES[0];
}

// English source strings are the dictionary keys, so English itself needs no
// translation table — untranslated strings (or an untranslated language)
// fall back to the original English text automatically.
export function translate(lang, str) {
  if (!str || lang === 'en') return str;
  return translations[lang]?.[str] ?? str;
}

export const I18nContext = createContext({
  lang: 'en',
  t: (str) => str,
  setLang: () => {}
});

export function useI18n() {
  return useContext(I18nContext);
}
