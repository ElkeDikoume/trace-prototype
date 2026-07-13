import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

const QUICK_QUESTIONS = [
  'What services are available for this case?',
  'Why was this flagged as this risk level?',
  'Generate a referral letter for this case.'
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

export default function Chatbot({ messages, onSend, busy, hasCase, pendingQuestion, onConsumePending }) {
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

  function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    onSend(q);
    setInput('');
  }

  return (
    <section data-tutorial="chatbot" className="flex-shrink-0 border-t border-trace-700 bg-trace-900 flex flex-col" style={{ maxHeight: '42vh' }}>
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">{t('Ask TRACE')}</h3>
        <span className="text-[10px] text-slate-500">{t('Grounded in IOM HTCDS protocol + this case')}</span>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500">
            {hasCase ? t('Ask about services, risk flags, or request a referral letter.') : t('Select or start a case to enable the assistant.')}
          </p>
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

      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(t(q))}
            disabled={!hasCase || busy}
            className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700 disabled:opacity-40"
          >
            {t(q)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-3 pt-1 flex gap-2">
        <input
          dir="auto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={!hasCase}
          placeholder={hasCase ? t('Ask a question about this case…') : t('Start a case first…')}
          className="flex-1 bg-trace-800 border border-trace-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent disabled:opacity-40"
        />
        <button
          onClick={() => send()}
          disabled={!hasCase || busy}
          className="px-3 py-2 rounded-md bg-trace-accent text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-40"
        >
          {t('Send')}
        </button>
      </div>
    </section>
  );
}
