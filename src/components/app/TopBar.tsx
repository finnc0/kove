import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  crumbs: Crumb[];
  actions?: React.ReactNode;
}

export function TopBar({ crumbs, actions }: TopBarProps) {
  return (
    <div className="bg-zinc-950 border-b border-white/[0.06] h-14 px-8 flex items-center justify-between flex-shrink-0">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-600">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-zinc-400 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-400">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {actions && <div>{actions}</div>}
    </div>
  );
}
