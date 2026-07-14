import { useEffect, useRef, useState } from 'react';
import { interpretToEnglish } from '../lib/claudeClient.js';
import { isSpeechRecognitionSupported, createRecognizer } from '../lib/speech.js';
import { useI18n } from '../lib/i18n.jsx';

// Kept in sync with DEMO_INTAKE_NOTES in data/demoCase.js, the guided
// tour's Step 3 loads that exact text into the intake form, and Step 4
// spotlights this panel, so both must show identical testimony.
const HAUSA_DEMO_TEXT = "Amina ta ce mai daukar ma'aikata ya karɓi takardar shaidar ta, ba za ta iya tafiya ba. An kawo ta daga Kano, ana cewa za a ba ta aiki a gidan yara, amma an tilasta ta yin aiki ba tare da kuɗi ba. Ta ce an gaya mata cewa tana bin bashin daukar ma'aikata, kuma ana cire kuɗi daga albashinta kafin ta karɓi kome. Tana da shekaru 28, kuma a yanzu ana tsare da ita a N'Djamena.";

export default function OnlineInterpretationPanel({ onlineMode, onUseAsNotes }) {
  const { t } = useI18n();
  const [text, setText] = useState(HAUSA_DEMO_TEXT);
  // Starts empty (rather than a canned translation) so the interpreted
  // output only appears once the caseworker actually runs an interpretation,
  // matching the tour's "verify meaning before structuring" step.
  const [translation, setTranslation] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const recognizerRef = useRef(null);
  const speechSupported = isSpeechRecognitionSupported();
  const [open, setOpen] = useState(true);

  useEffect(() => () => {
    recognizerRef.current?.abort?.();
    window.speechSynthesis?.cancel();
  }, []);

  function toggleHearSample() {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ha-NG';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  async function handleInterpret() {
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

  // Lets the guided tour's "I've clicked Interpret" button trigger the same
  // interpretation call as the real button below, so both paths produce the
  // same result. Re-registered every render so the tour always calls the
  // closure with the current text/onlineMode, not a stale one from mount.
  useEffect(() => {
    window.__traceInterpretNow = handleInterpret;
    return () => {
      delete window.__traceInterpretNow;
    };
  });

  if (!onlineMode) {
    return (
      <div
        data-tutorial="online-interpretation"
        title={t('Translation requires connectivity.')}
        className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-3 opacity-60"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-slate-400">🌐 {t('Online Translation (Live Mode)')}</h2>
          <button onClick={() => setOpen(!open)} className="text-slate-500 hover:text-slate-300 text-xs flex-shrink-0">
            {open ? '▲' : '▼'}
          </button>
        </div>
        {open && <p className="text-[11px] text-slate-500">{t('Translation requires connectivity.')}</p>}
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

  return (
    <div data-tutorial="online-interpretation" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trace-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-trace-accent" />
          </span>
          <h2 className="text-sm font-semibold text-slate-100">🌐 {t('Online Translation (Live Mode)')}</h2>
        </div>
        <button onClick={() => setOpen(!open)} className="text-slate-500 hover:text-slate-300 text-xs flex-shrink-0">
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-trace-accent">
              Hausa <span aria-hidden="true">⇄</span> English
            </div>
            <button
              onClick={toggleHearSample}
              className="text-xs text-slate-500 hover:text-slate-300 underline whitespace-nowrap"
            >
              {speaking ? `■ ${t('Stop')}` : `▶ ${t('Hear Hausa intake')}`}
            </button>
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
              data-tutorial="interpret-button"
              onClick={handleInterpret}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {busy ? t('Interpreting…') : `✨ ${t('Interpret')}`}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

          {translation && (
            <div className="bg-trace-800 border border-trace-700 rounded-md p-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{t('Interpreted output (English)')}</div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{translation}</p>
              {onUseAsNotes && (
                <button
                  onClick={() => onUseAsNotes(translation)}
                  className="mt-2 w-full px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500"
                >
                  {t('Use as intake notes →')}
                </button>
              )}
              <p className="text-[11px] text-slate-500 mt-1">{t('Powered by Claude API in this prototype · Meta SeamlessM4T in full deployment.')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
