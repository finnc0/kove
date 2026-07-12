export default function FindingsLoading() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="h-[45px] bg-zinc-950 border-b border-white/[0.06]" />
      <div className="min-h-[85vh] flex items-center py-28">
        <div className="max-w-2xl mx-auto w-full px-8 space-y-6 animate-pulse">
          <div className="h-2.5 w-14 bg-white/[0.06] rounded" />
          <div className="h-12 w-2/3 bg-white/[0.06] rounded-lg" />
          <div className="h-2.5 w-24 bg-white/[0.06] rounded" />
        </div>
      </div>
    </div>
  );
}
