import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

const QUICK_QUESTIONS = [
  'What services fit this case?',
  'Why was this flagged?',
  'Generate a referral letter',
  'What information is still missing?'
];

function renderEmphasis(text, keyPrefix) {
  const parts = text.split(/\*(.+?)\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <em key={`${keyPrefix}-em-${i}`}>{part}</em> : part));
}

function renderInline(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{part}</strong> : renderEmphasis(part, `${keyPrefix}-${i}`)
  );
}

function renderFormatted(text) {
  return text.split('\n').map((line, i) => {
    const heading = line.match(/^#{1,3}\s+(.*)/);
    if (heading) {
      return <div key={i} className="font-semibold text-slate-100 mt-2 first:mt-0">{renderInline(heading[1], i)}</div>;
    }
    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      return <div key={i} className="pl-3 -indent-3">• {renderInline(bullet[1], i)}</div>;
    }
    return <div key={i}>{renderInline(line, i)}</div>;
  });
}

export default function Chatbot({ messages, onSend, busy, hasCase, pendingQuestion, onConsumePending, open, onToggle }) {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (pendingQuestion) {
      send(pendingQuestion);
      onConsumePending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  useEffect(() => {
    window.__tracePreFillChat = (text) => setInput(text);
    return () => {
      delete window.__tracePreFillChat;
    };
  }, []);

  function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    onSend(q);
    setInput('');
  }

  const lastMessage = messages[messages.length - 1];
  const hasUnread = !open && lastMessage?.role === 'assistant';

  return (
    <>
      <button
        onClick={onToggle}
        title={t('Ask TRACE')}
        aria-label={t('Ask TRACE')}
        className="fixed bottom-5 right-5 z-[200] w-14 h-14 rounded-full bg-trace-accent text-white shadow-lg flex items-center justify-center hover:bg-sky-500 transition-colors"
      >
        <span className="text-2xl leading-none">💬</span>
        {hasCase && (
          <span
            className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-trace-950 ${
              hasUnread ? 'bg-trace-accent animate-pulse' : 'bg-trace-risk-low'
            }`}
          />
        )}
      </button>

      <section
        data-tutorial="chatbot"
        className={`fixed bottom-20 right-5 z-[200] w-[360px] h-[480px] bg-trace-900 border border-trace-700 rounded-xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-trace-700 flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-200">{t('Ask TRACE')}</h3>
          <button onClick={onToggle} aria-label={t('Minimize')} className="text-slate-400 hover:text-slate-200 text-lg leading-none w-6 h-6 flex items-center justify-center">
            —
          </button>
        </div>

        {!hasCase ? (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-xs text-slate-500 text-center">{t('Start or open a case to enable the assistant.')}</p>
            </div>
            <div className="px-4 pb-3 pt-1 flex gap-2 flex-shrink-0">
              <input
                disabled
                placeholder={t('Start a case first…')}
                className="flex-1 bg-trace-800 border border-trace-700 rounded-md px-3 py-2 text-sm text-slate-500 placeholder:text-slate-600 opacity-50 cursor-not-allowed"
              />
              <button disabled className="px-3 py-2 rounded-md bg-trace-accent text-white text-sm font-medium opacity-40 cursor-not-allowed">
                {t('Send')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-2 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-slate-500">{t('Ask about services, risk flags, or request a referral letter.')}</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' ? 'ml-auto bg-trace-accent text-white' : 'bg-trace-800 text-slate-100 border border-trace-700'
                }`}>
                  <div className="whitespace-pre-wrap space-y-0.5">{renderFormatted(m.content)}</div>
                </div>
              ))}
              {busy && <div className="text-xs text-slate-500">{t('TRACE is thinking…')}</div>}
            </div>

            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin flex-shrink-0">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(t(q))}
                  disabled={busy}
                  className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700 disabled:opacity-40"
                >
                  {t(q)}
                </button>
              ))}
            </div>

            <div data-tutorial="chatbot-input" className="px-4 pb-3 pt-1 flex gap-2 flex-shrink-0">
              <input
                dir="auto"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('Ask a question about this case…')}
                className="flex-1 bg-trace-800 border border-trace-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent"
              />
              <button
                onClick={() => send()}
                disabled={busy}
                className="px-3 py-2 rounded-md bg-trace-accent text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-40"
              >
                {t('Send')}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
