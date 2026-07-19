// Centers the mobile shell at a fixed 390px width on any viewport. The outer
// div is the v2 theme + direction root: `trace-v2-root` scopes the tracev2-*
// CSS variables, `trace-v2-theme-*` selects light/dark, and dir drives RTL. The
// outer surface is a blue-gray so the phone reads as intentional hardware
// floating above it, not just a full-bleed div.
import { useEffect } from 'react';

export default function PhoneFrame({ children, theme = 'dark', dir = 'ltr' }) {
  // Lock outer page scroll so the demo never scrolls behind the phone frame.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      dir={dir}
      className={`trace-v2-root trace-v2-theme-${theme} flex min-h-screen w-full items-center justify-center p-0 sm:py-6`}
      style={{
        background:
          'radial-gradient(1100px 620px at 50% -10%, rgba(59,79,216,0.12), transparent 70%), #0d1b2e'
      }}
    >
      <div
        className="relative flex h-[100dvh] w-full max-w-[390px] flex-col overflow-y-auto overflow-x-hidden scrollbar-thin bg-tracev2-bg text-tracev2-text sm:h-[calc(100dvh-3rem)] sm:max-h-[920px]"
        style={{
          borderRadius: '44px',
          border: '2px solid #2a3350',
          boxShadow:
            '0 0 0 1px #2a3350, 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(59,79,216,0.12)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
