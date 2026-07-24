// i18next setup for the v2 shell UI. The six official UN languages; Arabic
// drives RTL.
// The chosen language is persisted under 'trace_lang'. Importing this module
// initialises the shared i18next instance (side effect) exactly once.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';

export const LANG_KEY = 'trace_lang';

// Order, labels and flags for the header dropdown and the Settings list — the
// app's single source of truth for selectable UI languages. The six official
// UN languages; Arabic drives RTL. Local field languages (e.g. Hausa) are
// handled at intake via translation, not offered as interface options.
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', abbr: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', abbr: 'FR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', abbr: 'ES' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', abbr: 'AR' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', abbr: 'RU' },
  { code: 'zh', label: '中文', flag: '🇨🇳', abbr: 'ZH' }
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
      es: { translation: es },
      ar: { translation: ar },
      ru: { translation: ru },
      zh: { translation: zh }
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
