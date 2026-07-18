// Full-screen document preview. Streams an AI-generated document (referral
// letter / case summary / HTCDS form) into a monospace card, with Copy and
// Download .txt actions. Streaming starts whenever docType changes.
import { useEffect, useRef, useState } from 'react';
import { streamDocument, docLabel } from '../lib/documents.js';

export default function DocumentModal({ open, docType, caseData, targetService, onClose }) {
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [outputLang, setOutputLang] = useState('EN');
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open || !docType) return;
    setText('');
    setError('');
    setCopied(false);
    setStreaming(true);

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

  if (!open) return null;

  function handleCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRACE_${caseData?.id || 'case'}_${docType}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-tracev2-bg">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-tracev2-border px-4 py-3">
        <h1 className="text-sm font-semibold text-tracev2-text">{docLabel(docType)}</h1>
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
        <button onClick={onClose} aria-label="Close" className="text-tracev2-subtle hover:text-tracev2-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Document body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
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
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 border-t border-tracev2-border px-3 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
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
        <p className="mt-2 text-center text-[10px] text-tracev2-subtle">Review all AI-generated content before sending.</p>
      </div>
    </div>
  );
}
