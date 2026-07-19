// Bottom tab bar: Cases | + Intake | AI | Docs.
// `active` is one of 'cases' | 'intake' | 'ai' | 'docs'.

const CasesIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 9h18M8 4v16" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const AiIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4 3.5V15h-.5A2.5 2.5 0 0 1 4 12.5v-7Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);
const DocsIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M13 3v5h5M8.5 13h7M8.5 16.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function Tab({ label, active, onClick, children, dataTutorial }) {
  return (
    <button
      onClick={onClick}
      data-tutorial={dataTutorial}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-150 ${
        active ? 'text-tracev2-accent' : 'text-tracev2-subtle hover:text-tracev2-text'
      }`}
    >
      {children}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="flex-shrink-0 flex w-full items-stretch border-t border-tracev2-border bg-tracev2-bg/95 backdrop-blur pb-[max(env(safe-area-inset-bottom),6px)]">
      <Tab label="Cases" active={active === 'cases'} onClick={() => onNavigate('cases')}>
        <CasesIcon />
      </Tab>

      {/* Emphasised centre action */}
      <button
        onClick={() => onNavigate('intake')}
        data-tutorial="bottom-nav-intake"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold transition-colors duration-150 ${
            active === 'intake'
              ? 'bg-tracev2-accent text-white'
              : 'bg-tracev2-accent/90 text-white hover:bg-tracev2-accent'
          }`}
        >
          +
        </span>
        <span className={`text-[10px] font-medium ${active === 'intake' ? 'text-tracev2-accent' : 'text-tracev2-muted'}`}>
          Intake
        </span>
      </button>

      <Tab label="AI" active={active === 'ai'} onClick={() => onNavigate('ai')} dataTutorial="bottom-nav-ai">
        <AiIcon />
      </Tab>
      <Tab label="Records" active={active === 'docs'} onClick={() => onNavigate('docs')} dataTutorial="bottom-nav-docs">
        <DocsIcon />
      </Tab>
    </nav>
  );
}
