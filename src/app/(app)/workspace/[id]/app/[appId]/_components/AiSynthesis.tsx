interface Synthesis {
  doesWell: string;
  fails: string;
  implication: string;
}

function Block({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        accent
          ? "border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.03]"
          : "border-white/[0.05] bg-zinc-800/40",
      ].join(" ")}
    >
      <p
        className={[
          "mb-1.5 text-[10px] font-semibold uppercase tracking-widest",
          accent ? "text-[#2dd4bf]/60" : "text-zinc-600",
        ].join(" ")}
      >
        {label}
      </p>
      <p className="text-sm leading-relaxed text-zinc-300">{body}</p>
    </div>
  );
}

export function AiSynthesis({ synthesis }: { synthesis: Synthesis }) {
  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">

      <div className="space-y-3">
        {synthesis.doesWell && (
          <Block label="Does well" body={synthesis.doesWell} />
        )}
        {synthesis.fails && (
          <Block label="Structural failures" body={synthesis.fails} />
        )}
        {synthesis.implication && (
          <Block label="Competitive implication" body={synthesis.implication} accent />
        )}
      </div>
    </div>
  );
}
