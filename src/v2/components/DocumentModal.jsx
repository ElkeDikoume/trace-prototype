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

  const caseNumber = (caseData?.id || caseData?.caseNumber || 'case').replace(/^#/, '');
  const fileName = `${caseNumber}_${docType}.txt`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!text || streaming}
            className="flex-1 rounded-xl border border-tracev2-border py-2.5 text-sm font-medium text-tracev2-text transition-colors duration-150 hover:border-tracev2-muted disabled:opacity-40"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!text || streaming}
            className="flex-1 rounded-xl bg-tracev2-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90 disabled:opacity-40"
          >
            Download .txt
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-tracev2-subtle">Review all AI-generated content before sending.</p>
      </div>
    </div>
  );
}
