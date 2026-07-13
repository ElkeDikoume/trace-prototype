import { useEffect, useRef, useState } from 'react';
import { interpretToEnglish } from '../lib/claudeClient.js';
import { isSpeechRecognitionSupported, createRecognizer } from '../lib/speech.js';
import { useI18n } from '../lib/i18n.jsx';

const HAUSA_DEMO_TEXT = "Ta ce mai daukar ma'aikata ya karɓi takardar shaidar ta, ba za ta iya tafiya ba. An kawo ta daga Kano, ana cewa za a ba ta aiki a gidan yara, amma an tilasta ta yin aiki ba tare da kuɗi ba.";
const ENGLISH_DEMO_TRANSLATION = 'She says the recruiter took her identification document, she cannot leave. She was brought from Kano, told she would be given work caring for children, but was forced to work without pay.';

export default function OnlineInterpretationPanel({ onlineMode }) {
  const { t } = useI18n();
  const [text, setText] = useState(HAUSA_DEMO_TEXT);
  const [translation, setTranslation] = useState(ENGLISH_DEMO_TRANSLATION);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const recognizerRef = useRef(null);
  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => () => recognizerRef.current?.abort?.(), []);

  if (!onlineMode) {
    return (
      <div data-tutorial="online-interpretation" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100 mb-1">🌐 {t('Online Interpretation (Live Mode)')}</h2>
        <p className="text-[11px] text-slate-500">{t('Local language interpretation requires connectivity.')}</p>
      </div>
    );
  }

  function toggleListening() {
    setError('');
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      return;
    }
    const recognizer = createRecognizer({
      lang: 'ha-NG',
      onResult: ({ final, interim }) => setText(final ? `${final} ${interim}` : interim),
      onEnd: (final) => {
        setListening(false);
        if (final) setText(final);
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

  async function handleTranslate() {
    if (!text.trim()) return;
    setBusy(true);
    setError('');
    try {
      const result = await interpretToEnglish({ freeText: text, languageLabel: 'Hausa' });
      setTranslation(result);
    } catch (err) {
      setError(err.message || t('Failed to interpret and structure notes.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-tutorial="online-interpretation" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trace-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-trace-accent" />
        </span>
        <h2 className="text-sm font-semibold text-slate-100">🌐 {t('Online Interpretation (Live Mode)')}</h2>
      </div>

      <div className="inline-flex items-center gap-1.5 mb-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-trace-accent">
        Hausa <span aria-hidden="true">⇄</span> English
      </div>

      <textarea
        dir="auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full bg-trace-800 border border-trace-700 rounded-md p-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-trace-accent mb-2"
      />

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={toggleListening}
          disabled={!speechSupported}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 ${
            listening ? 'bg-red-600 text-white animate-pulse' : 'bg-trace-700 text-slate-100 hover:bg-trace-600'
          }`}
        >
          {listening ? `● ${t('Recording…')}` : `🎙 ${t('Speak')}`}
        </button>
        <button
          onClick={handleTranslate}
          disabled={busy}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? t('Interpreting…') : `✨ ${t('Translate')}`}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <div className="bg-trace-800 border border-trace-700 rounded-md p-2">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{t('Interpreted output (English)')}</div>
        <p className="text-sm text-slate-200 whitespace-pre-wrap">{translation}</p>
        <p className="text-[11px] text-slate-500 mt-1">{t('Live interpretation via Meta SeamlessM4T in full deployment.')}</p>
      </div>
    </div>
  );
}
