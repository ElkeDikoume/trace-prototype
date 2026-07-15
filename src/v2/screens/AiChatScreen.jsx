// "Ask TRACE AI" — a real, case-grounded chat backed by the streaming Claude
// proxy. Full-height overlay inside the phone frame. Every request carries the
// current case's structured data as context (see buildCaseSystemPrompt).
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCaseSystemPrompt, streamCaseChat } from '../lib/claudeStream.js';

const QUICK_ACTIONS = [
  'What services should I refer?',
  'What am I missing?',
  'Draft a referral letter',
  'Explain the risk score'
];

// Light-touch cleanup so **bold** markers don't render literally in the bubble.
function clean(text) {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '$1');
}

export default function AiChatScreen({ caseContext, onClose }) {
  const [messages, setMessages] = useState([]); // { role, content, streaming }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const system = useMemo(() => buildCaseSystemPrompt(caseContext), [caseContext]);
  const contextId = caseContext?.caseRecord?.id || 'new intake';

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(raw) {
    const question = (raw ?? input).trim();
    if (!question || busy) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', streaming: true }
    ]);
    setInput('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamCaseChat({
        system,
        history,
        question,
        max_tokens: 1024,
        signal: controller.signal,
        onToken: (chunk) =>
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          })
      });
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
        return copy;
      });
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Something went wrong reaching TRACE AI.'}`,
          streaming: false,
          error: true
        };
        return copy;
      });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-tracev2-bg">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-tracev2-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tracev2-accent/15 text-tracev2-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4 3.5V15h-.5A2.5 2.5 0 0 1 4 12.5v-7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Ask TRACE AI</h1>
            <p className="text-[11px] text-slate-500">
              Context: <span className="tabular-nums text-slate-400">{contextId}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-500 transition-colors duration-150 hover:text-slate-200"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Quick-action chips */}
      <div className="flex-shrink-0 flex gap-2 overflow-x-auto scrollbar-thin border-b border-tracev2-border/60 px-4 py-2.5">
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={busy}
            className="whitespace-nowrap rounded-full border border-tracev2-border bg-tracev2-card px-3 py-1.5 text-[12px] text-slate-300 transition-colors duration-150 hover:border-tracev2-accent/60 hover:text-white disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-slate-300">Ask about case {contextId}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Grounded in the case&apos;s structured data and CTDC indicators. Tap a suggestion above or type a question.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-tracev2-accent text-white'
                      : m.error
                        ? 'rounded-bl-md border border-tracev2-risk-high/40 bg-tracev2-risk-high/10 text-tracev2-risk-high'
                        : 'rounded-bl-md border border-tracev2-border bg-tracev2-card text-slate-100'
                  }`}
                >
                  {clean(m.content)}
                  {m.streaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-current align-middle" />
                  )}
                  {m.streaming && !m.content && (
                    <span className="text-slate-500">TRACE AI is thinking…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-tracev2-border px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask TRACE AI…"
            className="max-h-28 flex-1 resize-none rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-tracev2-accent/70 focus:outline-none"
          />
          <button
            onClick={() => send()}
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tracev2-accent text-white transition-colors duration-150 hover:bg-tracev2-accent/90 disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l16-8-6 16-3-6-7-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-600">
          Demo prototype · outputs reviewed by a trained caseworker.
        </p>
      </div>
    </div>
  );
}
