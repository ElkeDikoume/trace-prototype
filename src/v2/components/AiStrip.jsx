// Persistent "Ask TRACE AI…" strip pinned above the bottom nav on the
// Dashboard and Active Intake screens. Real AI chat is Phase 3 — for now it
// opens a lightweight placeholder sheet.
export default function AiStrip({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="flex-shrink-0 mx-3 mb-2 flex items-center gap-2.5 rounded-xl bg-tracev2-card border border-tracev2-border px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-tracev2-accent/60 active:scale-[0.99]"
    >
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-tracev2-accent/15 text-tracev2-accent">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4 3.5V15h-.5A2.5 2.5 0 0 1 4 12.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-sm text-slate-400">Ask TRACE AI…</span>
    </button>
  );
}
