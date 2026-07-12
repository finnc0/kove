interface Props {
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, danger, children }: Props) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        danger ? "border-red-500/20" : "border-white/[0.06]"
      }`}
    >
      <div className="px-6 py-5 border-b border-white/[0.04] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-6 bg-zinc-900">{children}</div>
    </div>
  );
}
