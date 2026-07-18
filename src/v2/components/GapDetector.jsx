// GapDetector — real-time CTDC indicator coverage panel.
// Appears in the Active Intake screen as the caseworker types.
// Keyword-based matching runs entirely client-side (no API call), so it works
// offline. Each category lights up green when enough signal words are present.
// This is a UX guide, not a clinical risk assessment — it prompts the caseworker
// to cover gaps, not replace their judgment.
import { useMemo, useState } from 'react';

const CATEGORIES = [
  {
    id: 'recruitment',
    label: 'Recruitment method',
    hint: 'How were they approached / recruited?',
    tip: "Avoid 'how did you get this job?' — try 'can you tell me about how you came to be here?'",
    keywords: ['recruit', 'promise', 'offer', 'job', 'hired', 'agency', 'broker', 'agent', 'neighbour', 'neighbor', 'stranger', 'contact', 'brought', 'taken', 'lured', 'deceiv', 'false']
  },
  {
    id: 'documents',
    label: 'Document control',
    hint: 'Were ID or travel documents taken?',
    tip: "Avoid asking 'why did you give your documents away?' — ask 'what happened to your documents?'",
    keywords: ['passport', 'document', 'id ', 'id,', 'identity', 'confiscat', 'withheld', 'took', 'held', 'kept', 'retain', 'taken', 'removed', 'seized']
  },
  {
    id: 'movement',
    label: 'Freedom of movement',
    hint: 'Were they free to leave?',
    tip: "Avoid 'why didn't you leave?' — ask 'were there things that made it difficult to move around freely?'",
    keywords: ['lock', 'leave', 'escape', 'free', 'move', 'confin', 'prison', "can't go", 'cannot go', 'not allowed', 'not permitted', 'restricted', 'guard', 'monitor', 'follow']
  },
  {
    id: 'wages',
    label: 'Wages / debt bondage',
    hint: 'Were wages paid? Any debt imposed?',
    tip: "Use 'money owed to the employer' not 'debt' — the word debt can feel like an accusation.",
    keywords: ['paid', 'unpaid', 'wages', 'salary', 'debt', 'owe', 'fee', 'money', 'payment', 'compensat', 'earn', 'deduct', 'bond', 'credit', 'loan', 'advance']
  },
  {
    id: 'exploitation',
    label: 'Type of exploitation',
    hint: 'What work or service were they forced into?',
    tip: 'Let the survivor describe the work in their words before using any category labels.',
    keywords: ['work', 'labour', 'labor', 'domestic', 'sexual', 'commercial', 'sex', 'harvest', 'farm', 'factory', 'cook', 'clean', 'service', 'exploit', 'forced', 'mine', 'beg', 'street']
  },
  {
    id: 'control',
    label: 'Control / coercion',
    hint: 'Threats, violence, or other control methods?',
    tip: 'Pause before this topic. Control methods are often the most traumatic to recount.',
    keywords: ['threat', 'beat', 'hit', 'abuse', 'punish', 'scare', 'force', 'coerce', 'intimidat', 'violence', 'assault', 'harm', 'hurt', 'rape', 'threaten', 'warn']
  },
  {
    id: 'family',
    label: 'Family / support contact',
    hint: 'Contact with family or support network?',
    tip: "Frame as 'were you able to be in contact with people you care about?' not 'did they isolate you?'",
    keywords: ['family', 'contact', 'phone', 'call', 'mother', 'father', 'child', 'home', 'relative', 'friend', 'support', 'isolated', 'alone', 'no one', 'sister', 'brother', 'parent']
  },
  {
    id: 'duration',
    label: 'Duration / timeline',
    hint: 'How long has this been happening?',
    tip: "Don't push for exact dates — 'roughly how long' is less retraumatising than 'when exactly?'",
    keywords: ['month', 'week', 'year', 'day', 'since', 'ago', 'duration', 'period', 'how long', 'started', 'began', 'time']
  }
];

function score(text, keywords) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export default function GapDetector({ notes }) {
  const [expanded, setExpanded] = useState(true);

  const coverage = useMemo(
    () => CATEGORIES.map((cat) => ({ ...cat, covered: score(notes, cat.keywords) })),
    [notes]
  );

  const coveredCount = coverage.filter((c) => c.covered).length;
  const total = CATEGORIES.length;
  const pct = Math.round((coveredCount / total) * 100);

  // Only show after the caseworker has typed something meaningful.
  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 8) return null;

  return (
    <div className="mt-2 rounded-xl border border-tracev2-border bg-tracev2-card overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-3 py-2 text-start"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-subtle">
            Coverage check
          </span>
          <span className={`text-[11px] font-bold ${coveredCount === total ? 'text-tracev2-risk-low' : coveredCount >= 5 ? 'text-tracev2-risk-medium' : 'text-tracev2-risk-high'}`}>
            {coveredCount}/{total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini progress bar */}
          <div className="w-16 h-1.5 rounded-full bg-tracev2-bg overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${coveredCount === total ? 'bg-tracev2-risk-low' : coveredCount >= 5 ? 'bg-tracev2-risk-medium' : 'bg-tracev2-risk-high'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            className={`text-tracev2-subtle transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-tracev2-border/50 px-3 py-2 space-y-1.5">
          {coverage.map((cat) => (
            <div key={cat.id} className="flex items-start gap-2">
              <span className={`mt-0.5 flex-shrink-0 text-[13px] ${cat.covered ? 'text-tracev2-risk-low' : 'text-tracev2-subtle'}`}>
                {cat.covered ? '✓' : '○'}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-[11px] font-medium ${cat.covered ? 'text-tracev2-text' : 'text-tracev2-muted'}`}>
                  {cat.label}
                </span>
                {!cat.covered && (
                  <>
                    <span className="ml-1.5 text-[10px] text-tracev2-subtle">— {cat.hint}</span>
                    <p className="mt-0.5 text-[10px] leading-snug text-tracev2-subtle italic pl-4">{cat.tip}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          <p className="pt-1 text-[10px] text-tracev2-subtle leading-relaxed">
            Guide only. Gaps prompt follow-up questions — not a clinical assessment.
          </p>
        </div>
      )}
    </div>
  );
}
