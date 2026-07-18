// Full-screen document preview. Streams an AI-generated document (referral
// letter / case summary / HTCDS form) into a monospace card, with Copy and
// Download .txt actions. Streaming starts whenever docType changes.
import { useEffect, useRef, useState } from 'react';
import { streamDocument, docLabel } from '../lib/documents.js';

// Emergency contacts shown large on the Safe Info Card (hardcoded for Chad).
const SAFE_CONTACTS = [
  { org: 'IOM Chad', number: '+235 63 52 24 76' },
  { org: 'Police des Mineurs', number: '+235 22 52 46 57' },
  { org: 'UNHCR Chad', number: '+235 22 52 47 57' }
];

export default function DocumentModal({ open, docType, caseData, targetService, onClose }) {
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [outputLang, setOutputLang] = useState('EN');
  const abortRef = useRef(null);

  const isSafeCard = docType === 'safe_card';

  useEffect(() => {
    if (!open || !docType) return;
    setText('');
    setError('');
    setCopied(false);
    setReviewed(false);
    setStreaming(true);
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const controller = new AbortController();
    abortRef.current = controller;

    streamDocument({
      docType,
      caseData,
      targetService,
      outputLang,
      signal: controller.signal,
      onToken: (chunk) => setText((prev) => prev + chunk)
    })
      .catch((err) => {
        if (err?.name !== 'AbortError') setError(err?.message || 'Failed to generate document.');
      })
      .finally(() => setStreaming(false));

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, docType, caseData, targetService, outputLang]);

  // Stop any in-progress speech when the card closes, and on unmount.
  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
  }, [open]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!open) return null;

  function handleCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setReviewed(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = isSafeCard
      ? `TRACE_safecard_${dateStr}.txt`
      : `TRACE_${caseData?.id || 'case'}_${docType}_${dateStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setReviewed(true);
  }

  // Web Speech playback of the (French) safe-card script.
  function handlePlay() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!text || !window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }

  function handleClose() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    onClose();
  }

  // No profile in this modal, so use a 'CW' (caseworker) initials placeholder.
  const reviewerInitials = 'CW';
  const reviewedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-tracev2-bg">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-tracev2-border px-4 py-3">
        <h1 className="text-sm font-semibold text-tracev2-text">{docLabel(docType)}</h1>
        {!isSafeCard && (
          <div className="flex items-center gap-1 rounded-lg border border-tracev2-border bg-tracev2-bg p-0.5">
            {['EN', 'FR'].map((lang) => (
              <button
                key={lang}
                onClick={() => setOutputLang(lang)}
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-150 ${outputLang === lang ? 'bg-tracev2-accent text-white' : 'text-tracev2-subtle hover:text-tracev2-text'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
        <button onClick={handleClose} aria-label="Close" className="text-tracev2-subtle hover:text-tracev2-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Document body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {isSafeCard ? (
          error ? (
            <p className="rounded-xl border border-tracev2-border bg-tracev2-card p-3.5 text-sm text-tracev2-risk-high">⚠️ {error}</p>
          ) : (
            <div className="p-1">
              {/* Visual safe card */}
              <div className="overflow-hidden rounded-2xl border border-tracev2-border bg-tracev2-card">
                <div className="flex items-center gap-2 bg-tracev2-risk-low px-4 py-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Safe to share</span>
                </div>
                <div className="space-y-3 p-4">
                  {SAFE_CONTACTS.map((c) => (
                    <div key={c.org} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-tracev2-risk-low/15 text-tracev2-risk-low">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 4h4l2 5-3 2a11 11 0 006 6l2-3 5 2v4a2 2 0 01-2 2A16 16 0 012 6a2 2 0 012-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] text-tracev2-muted">{c.org}</div>
                        <a href={`tel:${c.number.replace(/\s/g, '')}`} className="text-lg font-bold text-tracev2-text">
                          {c.number}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Play for survivor */}
              <button
                onClick={handlePlay}
                disabled={!text || streaming}
                className="mt-4 w-full rounded-xl bg-tracev2-risk-low py-3.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {speaking ? '⏹ Stop' : '▶ Play for survivor'}
              </button>
              <p className="mt-2 text-center text-[10px] text-tracev2-subtle">
                Audio reads in French. Show the numbers above directly if preferred.
              </p>
              {streaming && !text && (
                <p className="mt-2 text-center text-[11px] text-tracev2-subtle">Preparing the spoken message…</p>
              )}
            </div>
          )
        ) : (
          <div className="min-h-full rounded-xl border border-tracev2-border bg-tracev2-card p-3.5">
            {error ? (
              <p className="text-sm text-tracev2-risk-high">⚠️ {error}</p>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-tracev2-text">
                {text}
                {streaming && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-current align-middle" />}
                {streaming && !text && <span className="text-tracev2-subtle">Generating…</span>}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Attribution stamp + actions */}
      <div className="flex-shrink-0">
        {reviewed ? (
          <div className="flex items-center gap-2 border-t border-tracev2-border px-4 py-2 bg-tracev2-risk-low/5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-tracev2-risk-low">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-tracev2-risk-low font-medium">Reviewed · {reviewerInitials} · {reviewedDate}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-t border-tracev2-border px-4 py-2 bg-tracev2-risk-medium/5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-tracev2-risk-medium">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-tracev2-risk-medium font-medium">AI-generated · Review all content before use · Caseworker approval required</span>
          </div>
        )}

        <div className="px-3 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!text || streaming}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-150 ${copied ? 'bg-tracev2-risk-low text-white' : 'bg-tracev2-card border border-tracev2-border text-tracev2-text hover:border-tracev2-muted disabled:opacity-40'}`}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={!text || streaming}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-tracev2-border bg-tracev2-card py-2.5 text-sm font-semibold text-tracev2-text hover:border-tracev2-muted disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
