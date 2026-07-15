// Screen 4 — Active Intake (note-taking).
// Free-text notes + Web Speech mic, an intake-language selector, and a real
// "Translate & Structure" call to Claude (HTCDS JSON). Offline, the raw notes
// are queued to IndexedDB instead. The structured preview is reviewed/edited,
// then saved to Supabase (or queued).
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RiskBadge from '../components/RiskBadge.jsx';
import StructuredPreviewModal from '../components/StructuredPreviewModal.jsx';
import { useToast } from '../lib/ToastContext.jsx';
import { structureIntake, structuredToFields } from '../lib/structure.js';
import { saveCase } from '../lib/cases.js';
import { mockRiskIndicators } from '../mockData.js';

// Auto-detect + the UN languages relevant to intake + regional languages the
// Web Speech API can't handle but Claude can translate from.
const INTAKE_LANGUAGES = [
  'Auto-detect',
  'English',
  'French',
  'Arabic',
  'Spanish',
  'Russian',
  'Swahili',
  'Hausa',
  'Amharic',
  'Yoruba',
  'Igbo',
  'Somali',
  'Lingala',
  'Wolof',
  'Bambara'
];

export default function ActiveIntakeScreen({ caseId, initialNotes = '', riskLevel = 'medium', ageRange = '', sex = '', onBack, onSaved }) {
  const { t } = useTranslation();
  const { show } = useToast();

  const [notes, setNotes] = useState(initialNotes);
  const [intakeLang, setIntakeLang] = useState('Auto-detect');
  const [recording, setRecording] = useState(false);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fields, setFields] = useState([]);
  const [structured, setStructured] = useState(null);
  const [riskOpen, setRiskOpen] = useState(false);

  const recognitionRef = useRef(null);
  const baseNotesRef = useRef('');

  // Live risk badge reflects the structured result once available.
  const displayRisk = structured?.risk_level || riskLevel;
  const displayIndicators = structured?.ctdc_indicators?.length ? structured.ctdc_indicators : mockRiskIndicators;

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* no-op */
      }
    };
  }, []);

  function toggleRecord() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechUnsupported(true);
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US'; // Web Speech needs a concrete locale; Claude handles true source-language translation.
    baseNotesRef.current = notes ? notes.trimEnd() + ' ' : '';
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript + ' ';
      setNotes((baseNotesRef.current + transcript).replace(/\s+/g, ' ').trimStart());
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }

  async function queueRaw() {
    await saveCase({
      caseNumber: caseId,
      rawNotes: notes,
      structuredData: null,
      ctdcIndicators: null,
      riskLevel,
      ageRange,
      sex,
      status: 'active'
    });
    show(t('save_offline'), 'amber');
    onSaved?.();
  }

  async function handleStructure() {
    if (!notes.trim() || structuring) return;

    // Offline: don't attempt Claude — queue the raw notes for later.
    if (!navigator.onLine) {
      await queueRaw();
      return;
    }

    setStructuring(true);
    try {
      const s = await structureIntake({ notes, sourceLanguage: intakeLang });
      setStructured(s);
      setFields(structuredToFields(s));
      setShowPreview(true);
    } catch {
      // Network/parse failure — treat like offline and queue.
      await queueRaw();
    } finally {
      setStructuring(false);
    }
  }

  async function handleSaveStructured(editedFields) {
    setSaving(true);
    const s = structured || {};
    const result = await saveCase({
      caseNumber: caseId,
      rawNotes: notes,
      structuredData: { ...s, reviewed_fields: editedFields },
      ctdcIndicators: s.ctdc_indicators || [],
      riskLevel: s.risk_level || riskLevel,
      ageRange: s.age_range || ageRange,
      sex: s.sex || sex,
      status: 'active'
    });
    setSaving(false);
    setShowPreview(false);

    if (result.status === 'synced') show(`Case ${caseId} saved.`, 'success');
    else if (!navigator.onLine) show(t('save_offline'), 'amber');
    else show('Saved locally (demo mode).', 'info');

    onSaved?.();
    onBack?.();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header: back · case ID · discreet risk badge */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex items-center gap-1 text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rtl:-scale-x-100">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wide text-tracev2-subtle">Intake</div>
          <div className="text-sm font-semibold tabular-nums text-tracev2-text">{caseId}</div>
        </div>
        <RiskBadge
          open={riskOpen}
          onToggle={() => setRiskOpen((o) => !o)}
          onClose={() => setRiskOpen(false)}
          level={displayRisk}
          indicators={displayIndicators}
        />
      </div>

      {/* Notes area */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-2">
        <div className="relative flex-1">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type or dictate the intake note here…"
            className="h-full w-full resize-none rounded-xl border border-tracev2-border bg-tracev2-card p-3.5 pt-10 text-sm leading-relaxed text-tracev2-text placeholder:text-tracev2-subtle focus:border-tracev2-accent/70 focus:outline-none"
          />
          {/* Language auto-detect badge */}
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full border border-tracev2-border bg-tracev2-bg/80 px-2 py-0.5 text-[10px] text-tracev2-muted rtl:right-auto rtl:left-2.5">
            🌐 Auto-detect
          </span>
          {recording && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-tracev2-risk-high/15 px-2 py-0.5 text-[10px] font-medium text-tracev2-risk-high rtl:left-auto rtl:right-2.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tracev2-risk-high" />
              Listening…
            </span>
          )}
        </div>

        {/* Intake language selector */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-tracev2-subtle">Intake language</span>
          <select
            value={intakeLang}
            onChange={(e) => setIntakeLang(e.target.value)}
            className="flex-1 rounded-lg border border-tracev2-border bg-tracev2-card px-2.5 py-1.5 text-xs text-tracev2-text focus:border-tracev2-accent/70 focus:outline-none"
          >
            {INTAKE_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {speechUnsupported && (
          <p className="mt-1.5 text-[11px] text-tracev2-risk-medium">
            Voice input isn&apos;t supported in this browser. Try Chrome, or type the note above.
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={toggleRecord}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors duration-150 ${
              recording
                ? 'border-tracev2-risk-high bg-tracev2-risk-high/15 text-tracev2-risk-high'
                : 'border-tracev2-border bg-tracev2-card text-tracev2-text hover:border-tracev2-muted'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full bg-tracev2-risk-high ${recording ? 'animate-pulse' : ''}`} />
            {recording ? 'Stop' : 'Record'}
          </button>
          <button
            onClick={handleStructure}
            disabled={!notes.trim() || structuring}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tracev2-accent py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90 disabled:opacity-40"
          >
            {structuring ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Structuring…
              </>
            ) : (
              <>✦ {t('translate_structure')}</>
            )}
          </button>
        </div>
      </div>

      <StructuredPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onSave={handleSaveStructured}
        fields={fields}
        saving={saving}
      />
    </div>
  );
}
