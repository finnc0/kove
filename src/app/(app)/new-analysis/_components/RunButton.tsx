import { Loader2 } from "lucide-react";

interface RunButtonProps {
  canRun: boolean;
  isRunning: boolean;
  onRun: () => void;
}

export function RunButton({ canRun, isRunning, onRun }: RunButtonProps) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={!canRun || isRunning}
      className={`w-full h-11 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
        canRun && !isRunning
          ? "bg-white text-zinc-950 hover:bg-zinc-100 cursor-pointer"
          : "bg-white/[0.06] text-zinc-600 cursor-not-allowed opacity-50"
      }`}
    >
      {isRunning ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing…
        </>
      ) : (
        "Run Analysis"
      )}
    </button>
  );
}
