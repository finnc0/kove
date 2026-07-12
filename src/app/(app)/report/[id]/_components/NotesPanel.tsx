"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function NotesPanel({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (value) console.log("[Notes]", value.slice(0, 60)); }, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value]);

  return (
    <div className="w-[260px] flex-shrink-0 sticky top-[72px] self-start hidden xl:block">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">Notes</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add your thoughts, ideas, or follow-up questions…"
          className="w-full min-h-[280px] resize-none text-sm text-zinc-300 placeholder:text-zinc-700 bg-transparent border-0 outline-none p-0"
        />
        <p className="text-xs text-zinc-700 mt-3 pt-3 border-t border-white/[0.06]">Saved automatically</p>
      </div>
    </div>
  );
}
