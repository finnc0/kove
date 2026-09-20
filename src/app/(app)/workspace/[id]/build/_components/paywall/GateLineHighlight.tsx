export function GateLineHighlight() {
  return (
    <div className="relative flex flex-col items-center justify-center px-1">
      {/* Dashed vertical teal line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-[#2dd4bf]/30" />
      {/* "Paywall gate" pill */}
      <div className="relative z-10 my-auto rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.06] px-2 py-1">
        <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-widest text-[#2dd4bf]/60">
          gate
        </p>
      </div>
    </div>
  );
}
