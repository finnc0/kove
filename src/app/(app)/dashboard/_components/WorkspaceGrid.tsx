"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { WorkspaceCard, type Workspace } from "./WorkspaceCard";
import { NewMarketCard } from "./NewMarketCard";

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

interface Props {
  workspaces: Workspace[];
}

export function WorkspaceGrid({ workspaces }: Props) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");

  const showSearch = workspaces.length > 6;
  const filtered = query
    ? workspaces.filter((w) =>
        w.name.toLowerCase().includes(query.toLowerCase()),
      )
    : workspaces;

  return (
    <>
      {showSearch && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter markets…"
            className="w-full rounded-xl border border-white/[0.06] bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-white/[0.14]"
          />
        </div>
      )}

      <motion.div
        variants={reduced ? undefined : container}
        initial={reduced ? undefined : "hidden"}
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={reduced ? undefined : item}>
          <NewMarketCard />
        </motion.div>
        {filtered.map((w) => (
          <motion.div key={w.id} variants={reduced ? undefined : item}>
            <WorkspaceCard workspace={w} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
