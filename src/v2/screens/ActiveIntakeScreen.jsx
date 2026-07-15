// Screen 4 — Active Intake (note-taking).
// Free-text notes with a language auto-detect badge, live voice-to-text via
// the Web Speech API, and a mock "Translate & Structure" action that shows a
// loading state then a Structured preview modal. A discreet risk badge sits in
// the header. The AI strip is shell chrome.
import { useEffect, useRef, useState } from 'react';
import RiskBadge from '../components/RiskBadge.jsx';
import StructuredPreviewModal from '../components/StructuredPreviewModal.jsx';
import { mockRiskIndicators, mockStructuredFields } from '../mockData.js';

export default function ActiveIntakeScreen({ caseId, initialNotes = '', riskLevel = 'medium', onBack }) {
  const [notes, setNotes] = useState(initialNotes);
  const [recording, setRecording] = useState(false);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);

  const recognitionRef = useRef(null);
  const baseNotesRef = useRef(''); // notes captured when a recording session begins

  // Tidy up any live recognition if the screen unmounts mid-capture.
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
    rec.lang = 'en-US'; // Web Speech needs a concrete locale; the "auto-detect" badge is cosmetic for the demo.

    baseNotesRef.current = notes ? notes.trimEnd() + ' ' : '';

    rec.onresult = (e) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript + ' ';
      }
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

  function handleStructure() {
    if (!notes.trim() || structuring) return;
    setStructuring(true);
    // Mock latency — the real Claude translate+structure call is Phase 3.
    setTimeout(() => {
      setStructuring(false);
      setShowPreview(true);
    }, 1400);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header: back · case ID · discreet risk badge */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex items-center gap-1 text-slate-400 transition-colors duration-150 hover:text-slate-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Intake</div>
          <div className="text-sm font-semibold tabular-nums text-slate-100">{caseId}</div>
        </div>
        <RiskBadge
          open={riskOpen}
          onToggle={() => setRiskOpen((o) => !o)}
          onClose={() => setRiskOpen(false)}
          level={riskLevel}
          indicators={mockRiskIndicators}
        />
      </div>

      {/* Notes area */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-2">
        <div className="relative flex-1">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type or dictate the intake note here…"
            className="h-full w-full resize-none rounded-xl border border-tracev2-border bg-tracev2-card p-3.5 pt-10 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-tracev2-accent/70 focus:outline-none"
          />
          {/* Language auto-detect badge */}
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full border border-tracev2-border bg-tracev2-bg/80 px-2 py-0.5 text-[10px] text-slate-400">
            🌐 Auto-detect
          </span>
          {recording && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-tracev2-risk-high/15 px-2 py-0.5 text-[10px] font-medium text-tracev2-risk-high">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tracev2-risk-high" />
              Listening…
            </span>
          )}
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
                : 'border-tracev2-border bg-tracev2-card text-slate-200 hover:border-slate-500'
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
              <>✦ Translate &amp; Structure</>
            )}
          </button>
        </div>
      </div>

      <StructuredPreviewModal open={showPreview} onClose={() => setShowPreview(false)} fields={mockStructuredFields} />
    </div>
  );
}
