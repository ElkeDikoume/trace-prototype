// "Ask TRACE AI" — a case consultation tool: a second expert opinion for the
// caseworker, grounded in the active case, IOM HTCDS standards, and the CTDC
// framework. Streams from the Claude proxy, opens with a case-aware
// acknowledgment, and offers contextual quick-tap prompt chips.
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCaseContextBlock, streamCaseChat } from '../lib/claudeStream.js';

const CONSULT_SYSTEM = `You are TRACE AI, a senior anti-trafficking case consultation assistant supporting frontline IOM caseworkers in the Lake Chad Basin. You have full context of the active case below.

Your role: provide expert second opinions, not instructions. Ask clarifying questions when the caseworker is uncertain. Reference CTDC indicator definitions, IOM HTCDS standards, and trauma-informed interviewing principles when relevant. You are not a search engine — you are a thinking partner. When asked 'am I handling this correctly?', give honest, constructive feedback grounded in best practice.

Rules: always refer to survivors by case ID only. Never make a determination that replaces caseworker judgment — frame all outputs as recommendations for the caseworker to review. Do not invent facts not present in the case data.`;

const GREETING_SYSTEM = `You are TRACE AI, a senior anti-trafficking case consultation assistant. Using the case context below, write a single 1-2 sentence opening acknowledgment that shows you have read the case: mention the case ID, its risk level, and one specific thing that needs attention (for example an overdue follow-up task or an unresolved documentation gap). End with exactly: "What do you need?" Refer to the survivor by case ID only. Output only the acknowledgment, no preamble.`;

// Light-touch cleanup so **bold** markers don't render literally in the bubble.
function clean(text) {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '$1');
}

// Contextual quick-tap chips depend on the case's risk level.
function chipsForRisk(risk) {
  if (risk === 'high') return ['Why is this case high risk?', 'Draft a supervisor update', 'What referral is most urgent?'];
  if (risk === 'medium') return ['What indicators support this risk level?', 'What follow-up is needed?', 'Find a referral service'];
  return ['Explain CTDC indicators', 'What are the next steps?', 'Draft a case summary'];
}

export default function AiChatScreen({ caseContext, onClose }) {
  const [messages, setMessages] = useState([]); // { role, content, streaming }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const greetedRef = useRef(false);

  const contextBlock = useMemo(() => buildCaseContextBlock(caseContext), [caseContext]);
  const system = useMemo(() => `${CONSULT_SYSTEM}\n\n${contextBlock}`, [contextBlock]);
  const contextId = caseContext?.caseRecord?.id || 'new intake';
  const chips = chipsForRisk(caseContext?.caseRecord?.riskLevel);

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Case-aware opening greeting, generated once when the chat opens. The ref
  // guards against re-firing; the `ignore` flag makes it StrictMode-safe.
  useEffect(() => {
    if (greetedRef.current) return undefined;
    let ignore = false;
    (async () => {
      setBusy(true);
      setMessages([{ role: 'assistant', content: '', streaming: true }]);
      try {
        await streamCaseChat({
          system: `${GREETING_SYSTEM}\n\n${contextBlock}`,
          history: [],
          question: 'Write your opening acknowledgment now.',
          max_tokens: 120,
          onToken: (chunk) => {
            if (ignore) return;
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + chunk };
              return copy;
            });
          }
        });
        if (ignore) return;
        greetedRef.current = true;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
          return copy;
        });
      } catch {
        if (!ignore) setMessages([]); // fall back to the empty state on failure
      } finally {
        if (!ignore) setBusy(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <h1 className="text-sm font-semibold text-tracev2-text">Ask TRACE AI</h1>
            <p className="text-[11px] text-tracev2-subtle">
              Case consultation · <span className="tabular-nums text-tracev2-muted">{contextId}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-tracev2-subtle transition-colors duration-150 hover:text-tracev2-text"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-tracev2-text">Case consultation · {contextId}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-tracev2-subtle">
              A second opinion grounded in the case, IOM protocols, and the CTDC framework.
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
                        : 'rounded-bl-md border border-tracev2-border bg-tracev2-card text-tracev2-text'
                  }`}
                >
                  {clean(m.content)}
                  {m.streaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-current align-middle" />
                  )}
                  {m.streaming && !m.content && (
                    <span className="text-tracev2-subtle">TRACE AI is thinking…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-tracev2-border px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)]">
        {/* Contextual quick-tap chips — hidden while a response streams */}
        {!busy && (
          <div className="overflow-x-auto scrollbar-none flex gap-2 pb-1">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="whitespace-nowrap flex-shrink-0 rounded-full border border-tracev2-border bg-tracev2-card px-3 py-1.5 text-[11px] text-tracev2-muted hover:border-tracev2-accent/50 hover:text-tracev2-accent transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        )}
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
            className="max-h-28 flex-1 resize-none rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-2.5 text-sm text-tracev2-text placeholder:text-tracev2-subtle focus:border-tracev2-accent/70 focus:outline-none"
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
        <p className="mt-1.5 text-center text-[10px] text-tracev2-subtle">
          Demo prototype · outputs reviewed by a trained caseworker.
        </p>
      </div>
    </div>
  );
}
