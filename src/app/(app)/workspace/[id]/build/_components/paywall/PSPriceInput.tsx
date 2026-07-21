"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function PSPriceInput({ value, onChange, placeholder = "0 / mo" }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { setEditing(false); onChange(local); }}
        onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); onChange(local); } }}
        className="w-full rounded border border-[#2dd4bf]/30 bg-zinc-800 px-2 py-1 text-center text-xs text-white focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex w-full items-center justify-center gap-1 rounded border border-white/[0.06] bg-zinc-800/40 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
    >
      <DollarSign className="h-3 w-3 opacity-50" />
      {value || placeholder}
    </button>
  );
}
