// Screen 4 — Active Intake (note-taking).
// Free-text notes + Web Speech mic, an intake-language selector, and a real
// "Translate & Structure" call to Claude (HTCDS JSON). Offline, the raw notes
// are queued to IndexedDB instead. The structured preview is reviewed/edited,
// then saved to Supabase (or queued).
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RiskBadge from '../components/RiskBadge.jsx';
import GapDetector from '../components/GapDetector.jsx';
import InterviewModePanel from '../components/InterviewModePanel.jsx';
import StructuredPreviewModal from '../components/StructuredPreviewModal.jsx';
import { useToast } from '../lib/ToastContext.jsx';
import { structureIntake, structuredToFields } from '../lib/structure.js';
import { saveCase } from '../lib/cases.js';
import { generateFollowUpTasks } from '../lib/followups.js';
import { upsertCase } from '../lib/caseStore.js';
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

// Lightweight, offline heuristic language detection for the intake note. Runs
// on the raw text after the caseworker pauses typing — purely informational, it
// never changes the Translate & Structure behaviour (Claude still detects the
// true source language server-side).
const FR_STOPWORDS = ['de', 'la', 'le', 'les', 'des', 'du', 'une', 'est', 'avec', 'pour', 'dans'];
const HA_MARKERS = ['da', 'na', 'ta', 'ba', 'ne', 'ce', 'sun', 'ya', 'shi', 'wani'];

function detectLanguage(text) {
  if (!text || !text.trim()) return null;
  const words = text.toLowerCase().match(/[a-zà-ÿ]+/g) || [];
  const frCount = words.filter((w) => FR_STOPWORDS.includes(w)).length;
  if (frCount >= 3) return { code: 'FR', label: 'French' };
  const haCount = words.filter((w) => HA_MARKERS.includes(w)).length;
  if (haCount >= 2) return { code: 'HA', label: 'Hausa' };
  if (/[؀-ۿ]/.test(text)) return { code: 'AR', label: 'Arabic' };
  return null;
}

export default function ActiveIntakeScreen({ caseId, initialNotes = '', riskLevel = 'medium', ageRange = '', sex = '', supervisorMode = false, onBack, onSaved }) {
  const { t } = useTranslation();
  const { show } = useToast();

  const [notes, setNotes] = useState(initialNotes);
  const [intakeLang, setIntakeLang] = useState('Auto-detect');
  const [recording, setRecording] = useState(false);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fields, setFields] = useState([]);
  const [structured, setStructured] = useState(null);
  const [riskOpen, setRiskOpen] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);

  const recognitionRef = useRef(null);
  const baseNotesRef = useRef('');

  // Live risk badge reflects the structured result once available.
  const displayRisk = structured?.risk_level || riskLevel;
  const displayIndicators = structured?.ctdc_indicators?.length ? structured.ctdc_indicators : mockRiskIndicators;

  // Debounced language auto-detection: recompute 1.5s after typing stops.
  useEffect(() => {
    const id = setTimeout(() => setDetectedLang(detectLanguage(notes)), 1500);
    return () => clearTimeout(id);
  }, [notes]);

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
    if (!notes.trim() || structuring || saved) return;

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
    const finalRisk = s.risk_level || riskLevel;
    const structuredData = { ...s, reviewed_fields: editedFields };

    // Approval gate: a high-risk case with no active supervisor session is held
    // for supervisor approval rather than going straight to 'active'.
    const status = finalRisk === 'high' && !supervisorMode ? 'pending_referral' : 'active';

    // Best-effort persistence to Supabase / offline queue.
    const result = await saveCase({
      caseNumber: caseId,
      rawNotes: notes,
      structuredData,
      ctdcIndicators: s.ctdc_indicators || [],
      riskLevel: finalRisk,
      ageRange: s.age_range || ageRange,
      sex: s.sex || sex,
      status
    });

    // Build the case object the UI reads, generate its follow-up task list, and
    // record it in the local overlay so the Dashboard reflects it immediately.
    const caseObj = {
      id: caseId,
      ageRange: s.age_range || ageRange || '—',
      sex: s.sex || sex || '',
      riskLevel: finalRisk,
      status,
      lastUpdated: 'just now',
      notes,
      structuredData,
      ctdcIndicators: s.ctdc_indicators || []
    };
    caseObj.follow_up_tasks = await generateFollowUpTasks({ caseData: caseObj });
    upsertCase(caseObj);

    setSaving(false);
    setShowPreview(false);

    if (status === 'pending_referral') show(`Case ${caseId} submitted for supervisor approval.`, 'amber');
    else if (result.status === 'synced') show(`Case ${caseId} saved.`, 'success');
    else show('Saved locally (demo mode).', 'info');

    onSaved?.();

    // Brief green "✓ Saved" success state on the action button, then return.
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onBack?.();
    }, 1500);
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
        {interviewMode ? (
          <InterviewModePanel
            notes={notes}
            onNotesUpdate={setNotes}
            intakeLang={intakeLang}
            onExit={() => setInterviewMode(false)}
          />
        ) : (
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
        )}

        {/* Intake language selector + interview-mode toggle */}
        <div className="mt-2 flex items-center gap-2">
          <select
            value={intakeLang}
            onChange={(e) => setIntakeLang(e.target.value)}
            aria-label="Intake language"
            className="flex-1 rounded-lg border border-tracev2-border bg-tracev2-card px-2.5 py-1.5 text-xs text-tracev2-text focus:border-tracev2-accent/70 focus:outline-none"
          >
            {INTAKE_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            onClick={() => setInterviewMode(true)}
            className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              interviewMode
                ? 'border-tracev2-accent bg-tracev2-accent/10 text-tracev2-accent'
                : 'border-tracev2-border bg-tracev2-card text-tracev2-text hover:border-tracev2-muted'
            }`}
          >
            ✦ Interview
          </button>
        </div>

        {speechUnsupported && (
          <p className="mt-1.5 text-[11px] text-tracev2-risk-medium">
            Voice input isn&apos;t supported in this browser. Try Chrome, or type the note above.
          </p>
        )}

        {/* Live CTDC gap detection */}
        <GapDetector notes={notes} />

        {/* Debounced language auto-detection badge (informational only) */}
        {detectedLang && (
          <div className="mt-2 flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full border border-tracev2-accent/40 bg-tracev2-accent/10 px-2 py-0.5 text-[10px] font-medium text-tracev2-accent animate-tracev2-fadeIn">
              Detected: {detectedLang.label} → EN
            </span>
          </div>
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
            disabled={!notes.trim() || structuring || saved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-40 ${
              saved ? 'bg-tracev2-risk-low disabled:opacity-100' : 'bg-tracev2-accent hover:bg-tracev2-accent/90'
            }`}
          >
            {saved ? (
              <>✓ Saved</>
            ) : structuring ? (
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
