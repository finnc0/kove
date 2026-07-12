import { Check, Loader2 } from "lucide-react";

type SaveState = "idle" | "loading" | "success";

interface Props {
  state: SaveState;
  label?: string;
  successLabel?: string;
}

export function SaveButton({ state, label = "Save changes", successLabel = "Saved" }: Props) {
  return (
    <button
      type="submit"
      disabled={state === "loading"}
      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-60 transition-colors"
    >
      {state === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {state === "success" && <Check className="w-3.5 h-3.5" />}
      {state === "loading" ? "Saving…" : state === "success" ? successLabel : label}
    </button>
  );
}
