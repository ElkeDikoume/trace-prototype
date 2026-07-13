import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, isSpeechRecognitionSupported, createRecognizer } from '../lib/speech.js';
import { structureNotesIntoForm, interpretAndStructureNotes } from '../lib/claudeClient.js';
import { DEMO_INTAKE_NOTES } from '../data/demoCase.js';
import { useI18n } from '../lib/i18n.jsx';

const MIN_INTERPRETING_MS = 1100;

// Maps app display-language codes (from i18n's UI_LANGUAGES) to the matching
// Web Speech API voice code, so the voice input selector defaults to
// whatever language the caseworker already has the app set to.
const UI_LANG_TO_SPEECH_CODE = { en: 'en-US', fr: 'fr-FR', ar: 'ar-SA', es: 'es-ES', pt: 'pt-PT' };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function VoiceTextIntake({ form, onStructured, onlineMode }) {
  const { t, lang } = useI18n();
  const [language, setLanguage] = useState(() => UI_LANG_TO_SPEECH_CODE[lang] || 'en-US');
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const recognizerRef = useRef(null);
  const speechSupported = isSpeechRecognitionSupported();

  const availableLanguages = onlineMode ? LANGUAGES : LANGUAGES.filter((l) => !l.local);
  const selectedLanguage = LANGUAGES.find((l) => l.code === language);
  const isLocalLanguage = !!selectedLanguage?.local;

  useEffect(() => {
    return () => {
      recognizerRef.current?.abort?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!onlineMode && isLocalLanguage) {
      setLanguage(UI_LANG_TO_SPEECH_CODE[lang] || 'en-US');
      setTranslation('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineMode]);

  // Keep the voice input language synced with the app display language,
  // unless the caseworker has deliberately picked a local language to
  // capture testimony in (that choice is independent of the UI language).
  useEffect(() => {
    if (!isLocalLanguage) {
      setLanguage(UI_LANG_TO_SPEECH_CODE[lang] || 'en-US');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function toggleListening() {
    setError('');
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      return;
    }
    const recognizer = createRecognizer({
      lang: language,
      onResult: ({ final, interim }) => setText(final ? `${final} ${interim}` : interim),
      onEnd: (final) => {
        setListening(false);
        if (final) setText((prev) => (prev.trim().length ? prev : final));
      },
      onError: (err) => {
        setListening(false);
        setError(`${t('Voice input error:')} ${err}`);
      }
    });
    if (!recognizer) {
      setError(t('Voice input is not supported in this browser. Try Chrome, or type your notes instead.'));
      return;
    }
    recognizerRef.current = recognizer;
    recognizer.start();
    setListening(true);
  }

  function toggleHearSample() {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(DEMO_INTAKE_NOTES);
    utterance.lang = 'ha-NG';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  async function handleStructure() {
    if (!text.trim()) {
      setError(t('Add some notes (spoken or typed) before structuring.'));
      return;
    }
    setError('');
    setTranslation('');

    if (isLocalLanguage) {
      setInterpreting(true);
      try {
        const [result] = await Promise.all([
          interpretAndStructureNotes({ freeText: text, languageLabel: selectedLanguage.label, form }),
          wait(MIN_INTERPRETING_MS)
        ]);
        setTranslation(result.translation || '');
        onStructured(result.fields || {});
      } catch (err) {
        setError(err.message || t('Failed to interpret and structure notes.'));
      } finally {
        setInterpreting(false);
      }
      return;
    }

    setBusy(true);
    try {
      const fields = await structureNotesIntoForm({ freeText: text, language, form });
      onStructured(fields);
    } catch (err) {
      setError(err.message || t('Failed to structure notes with AI.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-tutorial="voice-intake" className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-200">{t('Voice or text intake')}</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-trace-900 border border-trace-700 rounded text-xs px-2 py-1 text-slate-200"
        >
          {availableLanguages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {!onlineMode && (
        <p className="text-[11px] text-slate-500 mb-2">{t('Local language interpretation requires connectivity.')}</p>
      )}

      {onlineMode && isLocalLanguage && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-trace-accent">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trace-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-trace-accent"></span>
          </span>
          {t('Online mode, real-time interpretation active (powered by SeamlessM4T)')}
        </div>
      )}

      <label className="block text-xs text-slate-400 mb-1">{t('Type intake notes or speak them →')}</label>
      <div className="flex items-start gap-2">
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('Speak using the mic button, or type freeform case notes in any supported language...')}
          rows={4}
          className="flex-1 bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent"
        />
        <div className="flex flex-col items-center gap-2 pt-0.5">
          {speechSupported && (
            <button
              onClick={toggleListening}
              aria-label={listening ? t('Stop recording') : t('Start voice input')}
              title={listening ? t('Stop recording') : t('Start voice input')}
              className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full text-lg transition-colors ${
                listening ? 'bg-red-600/20 animate-pulse' : 'bg-trace-700 hover:bg-trace-600'
              }`}
            >
              {listening ? '🔴' : '🎙'}
            </button>
          )}
          <button
            onClick={toggleHearSample}
            className="text-xs text-slate-500 hover:text-slate-300 underline whitespace-nowrap"
          >
            {speaking ? `■ ${t('Stop')}` : `▶ ${t('Hear Hausa intake')}`}
          </button>
        </div>
      </div>

      {interpreting && (
        <div className="mt-2 text-xs text-trace-accent flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-trace-accent border-t-transparent animate-spin" />
          {t('Interpreting from')} {selectedLanguage?.label}…
        </div>
      )}

      {!interpreting && translation && (
        <div className="mt-2 bg-trace-900 border border-trace-700 rounded-md p-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{t('Interpreted (French)')}</div>
          <p dir="auto" className="text-sm text-slate-200 whitespace-pre-wrap">{translation}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={toggleListening}
          disabled={!speechSupported}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 ${
            listening ? 'bg-red-600 text-white animate-pulse' : 'bg-trace-700 text-slate-100 hover:bg-trace-600'
          }`}
        >
          <span>{listening ? `● ${t('Recording…')}` : `🎙 ${t('Speak')}`}</span>
        </button>
        <button
          data-tutorial="structure-button"
          onClick={handleStructure}
          disabled={busy || interpreting}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {interpreting ? t('Interpreting…') : busy ? t('Structuring…') : isLocalLanguage ? `✨ ${t('Interpret & structure')}` : `✨ ${t('Structure with AI')}`}
        </button>
        {!speechSupported && (
          <span className="text-xs text-slate-500">{t('Voice input unsupported here, typing still works.')}</span>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
