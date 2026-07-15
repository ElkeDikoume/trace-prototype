// i18next setup for the v2 shell UI. Six UN languages; Arabic drives RTL.
// The chosen language is persisted under 'trace_lang'. Importing this module
// initialises the shared i18next instance (side effect) exactly once.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import zh from '../locales/zh.json';
import ru from '../locales/ru.json';
import es from '../locales/es.json';

export const LANG_KEY = 'trace_lang';

// Order + labels for the header dropdown.
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'zh', label: '中文', name: '中文' },
  { code: 'ru', label: 'РУС', name: 'Русский' },
  { code: 'es', label: 'ES', name: 'Español' }
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
      ar: { translation: ar },
      zh: { translation: zh },
      ru: { translation: ru },
      es: { translation: es }
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
