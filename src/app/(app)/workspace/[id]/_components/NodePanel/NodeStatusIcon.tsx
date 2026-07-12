import type { NodeStatus } from "../../mockData";

interface Props {
  name: string;
  icon?: string;
  status: NodeStatus;
}

export function NodeStatusIcon({ name, icon, status }: Props) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center overflow-hidden bg-zinc-800 relative">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt={name} className="w-8 h-8 object-cover" />
      ) : (
        <span className="text-xs font-medium text-zinc-400">{initials}</span>
      )}
      {status === "analyzing" && (
        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse border border-zinc-900" />
      )}
    </div>
  );
}
