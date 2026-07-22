// "TRACE AI" — the AI tab's command center, plus the chat it opens into.
//
// Two entry points:
//   • AI tab (no `caseContext`) — opens the command center: today's brief, four
//     quick actions, and recent document activity. Tapping a quick action opens
//     the chat with that question already asked; "← Back" returns here.
//   • Inside a case (`caseContext` given) — skips the command center and opens
//     the chat grounded in that case, with its case-aware greeting.
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCaseContextBlock, streamCaseChat } from '../lib/claudeStream.js';
import { useToast } from '../lib/ToastContext.jsx';
import DailyBriefCard from '../components/DailyBriefCard.jsx';
import { DOC_KINDS, MOCK_DOCUMENTS, DocumentPreviewModal } from './RecordsScreen.jsx';

const CONSULT_SYSTEM = `You are TRACE AI, a senior anti-trafficking case consultation assistant supporting frontline IOM caseworkers in the Lake Chad Basin. You have full context of the active case below.

Your role: provide expert second opinions, not instructions. Ask clarifying questions when the caseworker is uncertain. Reference CTDC indicator definitions, IOM HTCDS standards, and trauma-informed interviewing principles when relevant. You are not a search engine — you are a thinking partner. When asked 'am I handling this correctly?', give honest, constructive feedback grounded in best practice.

Rules: always refer to survivors by case ID only. Never make a determination that replaces caseworker judgment — frame all outputs as recommendations for the caseworker to review. Do not invent facts not present in the case data.`;

// Generic mode (AI tab): no individual case is loaded, so the assistant works
// across the caseworker's caseload rather than a single survivor's record.
const GENERIC_SYSTEM = `You are TRACE AI, a senior anti-trafficking case consultation assistant supporting frontline IOM caseworkers in the Lake Chad Basin. No individual case is loaded — the caseworker has opened you from the AI tab to think through their caseload as a whole.

Your role: provide expert second opinions, not instructions. Ask clarifying questions when the caseworker is uncertain. Reference CTDC indicator definitions, IOM HTCDS standards, and trauma-informed interviewing principles when relevant. You are not a search engine — you are a thinking partner.

Rules: always refer to survivors by case ID only. Never make a determination that replaces caseworker judgment — frame all outputs as recommendations for the caseworker to review. Do not invent case facts; if a question needs details from a specific case, ask the caseworker to open that case and ask again from there.`;

const GREETING_SYSTEM = `You are TRACE AI, a senior anti-trafficking case consultation assistant. Using the case context below, write a single 1-2 sentence opening acknowledgment that shows you have read the case: mention the case ID, its risk level, and one specific thing that needs attention (for example an overdue follow-up task or an unresolved documentation gap). End with exactly: "What do you need?" Refer to the survivor by case ID only. Output only the acknowledgment, no preamble.`;

// Static opening shown if the live greeting fails, so the chat never opens empty.
const FALLBACK_GREETING = 'Case #0043 is flagged HIGH RISK. Three CTDC indicators confirmed: document confiscation, minor status, restricted movement. Medical assessment is overdue. What do you need?';

// Quick actions — the 2×2 grid on the command center. `query` is sent as the
// caseworker's first message when the card is tapped.
const QUICK_ACTIONS = [
  {
    id: 'caseload',
    icon: '✦',
    circle: 'bg-indigo-500/20 text-indigo-300',
    label: 'Summarise caseload',
    description: "What's urgent across all my cases",
    query: "Summarise today's caseload — what's urgent across all my cases?"
  },
  {
    id: 'report',
    icon: '📋',
    circle: 'bg-amber-500/20 text-amber-300',
    label: 'Generate a report',
    description: 'VCA, situation report, or referral letter',
    query: 'I need to generate a report — a VCA, situation report, or referral letter. Which fits my caseload right now, and what do you need from me?'
  },
  {
    id: 'overdue',
    icon: '⚠',
    circle: 'bg-rose-500/20 text-rose-300',
    label: 'Overdue follow-ups',
    description: 'Which cases need action today',
    query: 'Which cases have overdue follow-ups that need action today?'
  },
  {
    id: 'alert',
    icon: '🔔',
    circle: 'bg-orange-500/20 text-orange-300',
    label: 'Send cluster alert',
    description: 'Notify sector leads of a field situation',
    query: 'Help me draft a cluster alert to notify sector leads of a field situation.'
  }
];

// Recent activity — the three most recent documents, previewed with the same
// sheet the Records tab uses.
const RECENT = [
  { docId: 'doc-0043-vca', icon: '📄', label: 'VCA Report', ref: '#0043 Koura Village', when: '2h ago' },
  { docId: 'doc-0042-situation', icon: '📋', label: 'Situation Report', ref: '#0042 Toumour Camp', when: 'Yesterday' },
  { docId: 'doc-cluster-wash', icon: '🔔', label: 'Cluster Alert', ref: 'WASH · Diffa region', when: 'Yesterday' }
];

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

const GENERIC_CHIPS = ["Summarise today's caseload", 'Draft a situation report', 'What follow-ups are overdue?'];

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Chat view — the streaming conversation.
// ---------------------------------------------------------------------------
function ChatView({ scoped, contextId, system, contextBlock, chips, demoScript, initialQuestion, onBack, onClose }) {
  const [messages, setMessages] = useState([]); // { role, content, streaming }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const greetedRef = useRef(false);
  const sendRef = useRef(null);

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Scripted demo playback: show the user message immediately and typewriter the
  // assistant reply at 18ms/char. Skips the live greeting/API entirely.
  useEffect(() => {
    if (!demoScript?.length) return undefined;
    greetedRef.current = true; // block the live greeting below
    const script = demoScript.map((m) => ({ role: m.role, content: m.content }));
    const lastIsAssistant = script[script.length - 1]?.role === 'assistant';
    if (!lastIsAssistant) {
      setMessages(script);
      return undefined;
    }
    const target = script[script.length - 1].content;
    const head = script.slice(0, -1);
    setMessages([...head, { role: 'assistant', content: '', streaming: true }]);
    let i = 0;
    let timer;
    const tick = () => {
      i += 1;
      setMessages([...head, { role: 'assistant', content: target.slice(0, i), streaming: i < target.length }]);
      if (i < target.length) timer = setTimeout(tick, 18);
    };
    timer = setTimeout(tick, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Case-aware opening greeting, generated once when a case-scoped chat opens.
  // Generic chats open on the question the caseworker already asked instead.
  useEffect(() => {
    if (!scoped || greetedRef.current || demoScript?.length || initialQuestion) return undefined;
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
        // Static fallback greeting rather than an empty state on failure.
        if (!ignore) {
          greetedRef.current = true;
          setMessages([{ role: 'assistant', content: FALLBACK_GREETING, streaming: false }]);
        }
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
  sendRef.current = send;

  // A quick action opened this chat — ask its question straight away.
  useEffect(() => {
    if (initialQuestion) sendRef.current?.(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-tracev2-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Back"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rtl:-scale-x-100">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tracev2-accent/15 text-tracev2-accent">
              <SparkIcon />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-tracev2-text">TRACE AI</h1>
            <p className="truncate text-[11px] text-tracev2-subtle">
              {scoped ? (
                <>
                  Case consultation · <span className="tabular-nums text-tracev2-muted">{contextId}</span>
                </>
              ) : (
                'Caseload consultation'
              )}
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
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3">
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
                {m.streaming && !m.content && <span className="text-tracev2-subtle">TRACE AI is thinking…</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-tracev2-border px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)]">
        {/* Contextual quick-tap chips — hidden while a response streams */}
        {!busy && (
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-tracev2-border bg-tracev2-card px-3 py-1.5 text-[11px] text-tracev2-muted transition-colors hover:border-tracev2-accent/50 hover:text-tracev2-accent"
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

// ---------------------------------------------------------------------------
// Command center — the AI tab's landing view.
// ---------------------------------------------------------------------------
function CommandCenter({ cases, onAsk, onClose }) {
  const { show } = useToast();
  const [previewDoc, setPreviewDoc] = useState(null);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-shrink-0 items-start justify-between px-4 pb-1 pt-3">
        <div>
          <h2 className="text-lg font-bold text-tracev2-text">TRACE AI</h2>
          <p className="text-xs text-tracev2-subtle">Field intelligence and document generation</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="mt-0.5 text-tracev2-subtle transition-colors duration-150 hover:text-tracev2-text"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-4">
        {/* Today's brief — moved here from the dashboard */}
        <DailyBriefCard cases={cases} />

        {/* Quick actions */}
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-widest text-tracev2-subtle">What do you need?</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onAsk(a.query)}
              className="rounded-xl border border-tracev2-border bg-tracev2-card p-4 text-start transition-colors duration-150 hover:border-tracev2-accent/50"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${a.circle}`}
                aria-hidden="true"
              >
                {a.icon}
              </span>
              <span className="mt-2 block text-sm font-bold text-tracev2-text">{a.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-tracev2-muted">{a.description}</span>
            </button>
          ))}
        </div>

        {/* Recent activity */}
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-widest text-tracev2-subtle">Recent</h3>
        <ul className="mt-2 space-y-1.5">
          {RECENT.map((r) => {
            const doc = MOCK_DOCUMENTS.find((d) => d.id === r.docId);
            return (
              <li key={r.docId}>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex w-full items-center gap-3 rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-2.5 text-start transition-colors duration-150 hover:border-tracev2-accent/50"
                >
                  <span className="text-base" aria-hidden="true">
                    {r.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-tracev2-text">{r.label}</span>
                    <span className="block truncate text-xs text-tracev2-muted">{r.ref}</span>
                  </span>
                  <span className="flex-shrink-0 text-[11px] text-tracev2-subtle">{r.when}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onShare={(d) => show(`${DOC_KINDS[d.type].label} ${d.caseRef} shared with partner agency.`, 'success')}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function AiChatScreen({ caseContext, onClose, demoMessages, cases = [] }) {
  // Case-scoped only when a case was handed in (from inside a case view).
  const scoped = Boolean(caseContext?.caseRecord);

  // Scripted demo mode: prefer an explicit prop, else read the global set by the
  // guided walkthrough (TutorialOverlay). Captured once at mount; the overlay
  // owns clearing the global (StrictMode-safe — we never clear it on read).
  const [demoScript] = useState(() => {
    if (demoMessages?.length) return demoMessages;
    const g = typeof window !== 'undefined' ? window.__traceDemoMessages : null;
    return g?.length ? g : null;
  });

  // The command center is the generic landing view; a case (or the scripted
  // demo) goes straight to the conversation.
  const [chat, setChat] = useState(() => (scoped || demoScript ? { question: null } : null));

  const contextBlock = useMemo(() => (scoped ? buildCaseContextBlock(caseContext) : ''), [scoped, caseContext]);
  const system = useMemo(
    () => (scoped ? `${CONSULT_SYSTEM}\n\n${contextBlock}` : GENERIC_SYSTEM),
    [scoped, contextBlock]
  );
  const contextId = caseContext?.caseRecord?.id || 'new intake';
  const chips = scoped ? chipsForRisk(caseContext?.caseRecord?.riskLevel) : GENERIC_CHIPS;

  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-tracev2-bg">
      {chat ? (
        <ChatView
          key={chat.question || 'chat'}
          scoped={scoped}
          contextId={contextId}
          system={system}
          contextBlock={contextBlock}
          chips={chips}
          demoScript={demoScript}
          initialQuestion={chat.question}
          onBack={scoped || demoScript ? null : () => setChat(null)}
          onClose={onClose}
        />
      ) : (
        <CommandCenter cases={cases} onAsk={(question) => setChat({ question })} onClose={onClose} />
      )}
    </div>
  );
}
