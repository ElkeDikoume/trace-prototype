// Centers the mobile shell at a fixed 390px width on any viewport. The outer
// div is the v2 theme + direction root: `trace-v2-root` scopes the tracev2-*
// CSS variables, `trace-v2-theme-*` selects light/dark, and dir drives RTL.
export default function PhoneFrame({ children, theme = 'dark', dir = 'ltr' }) {
  return (
    <div
      dir={dir}
      className={`trace-v2-root trace-v2-theme-${theme} min-h-screen w-full bg-black flex justify-center`}
    >
      <div className="relative w-full max-w-[390px] min-h-screen bg-tracev2-bg text-tracev2-text flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
