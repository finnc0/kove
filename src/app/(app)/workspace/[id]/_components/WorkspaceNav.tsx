import Link from "next/link";

interface Props {
  workspaceId: string;
  active: "home" | "canvas" | "findings";
}

export function WorkspaceNav({ workspaceId, active }: Props) {
  const tabs = [
    { label: "Home",     href: `/workspace/${workspaceId}`,           key: "home"     },
    // { label: "Canvas", href: `/workspace/${workspaceId}/canvas`, key: "canvas" }, // temporarily hidden
    { label: "Findings", href: `/workspace/${workspaceId}/findings`,  key: "findings" },
  ] as const;

  return (
    <div className="mb-8 flex items-center gap-1 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-1 w-fit">
      {tabs.map((tab) =>
        tab.key === active ? (
          <span
            key={tab.key}
            className="rounded-lg bg-white/[0.08] px-4 py-1.5 text-xs font-medium text-white"
          >
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.key}
            href={tab.href}
            className="rounded-lg px-4 py-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
          >
            {tab.label}
          </Link>
        ),
      )}
    </div>
  );
}
