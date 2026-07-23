// i18next setup for the v2 shell UI. Four languages scoped to the Lake Chad
// Basin deployment; Arabic drives RTL.
// The chosen language is persisted under 'trace_lang'. Importing this module
// initialises the shared i18next instance (side effect) exactly once.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';

export const LANG_KEY = 'trace_lang';

// Order, labels and flags for the header dropdown and the Settings list — the
// app's single source of truth for selectable languages. Arabic carries the
// Chad flag, not a Gulf one: this deployment is the Lake Chad Basin. Hausa has
// no translation bundle yet, so choosing it records the preference and the UI
// falls back to English.
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', abbr: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', abbr: 'FR' },
  { code: 'ha', label: 'Hausa', flag: '🌍', abbr: 'HA' },
  { code: 'ar', label: 'العربية', flag: '🇹🇩', abbr: 'AR' }
];

export const RTL_LANGS = ['ar'];
export const isRtl = (code) => RTL_LANGS.includes(code);

const stored = localStorage.getItem(LANG_KEY);
const initialLang = LANGUAGES.some((l) => l.code === stored) ? stored : 'en';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
}

// Persist future language changes.
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng);
});

export default i18n;
