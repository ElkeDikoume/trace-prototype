// Centers the mobile shell at a fixed 390px width on any viewport, on the
// near-black v2 background. On desktop it reads as a phone-sized column.
export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen w-full bg-black flex justify-center">
      <div className="relative w-full max-w-[390px] min-h-screen bg-tracev2-bg text-slate-100 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
