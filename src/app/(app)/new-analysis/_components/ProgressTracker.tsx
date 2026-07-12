import {
  Globe,
  Star,
  Smartphone,
  MessageCircle,
  FileText,
  Cpu,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SourceId = "web" | "appstore" | "playstore" | "reddit" | "website" | "ai";
export type StepState = "pending" | "active" | "done" | "failed";

export interface Step {
  id: SourceId;
  label: string;
  status: StepState;
}

const iconMap: Record<SourceId, LucideIcon> = {
  web: Globe,
  appstore: Star,
  playstore: Smartphone,
  reddit: MessageCircle,
  website: FileText,
  ai: Cpu,
};

interface ProgressTrackerProps {
  steps: Step[];
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <div className="space-y-3.5">
      {steps.map((step) => {
        const Icon = iconMap[step.id];
        return (
          <div key={step.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <span className="text-sm text-zinc-400">{step.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {step.status === "pending" && (
                <span className="text-xs text-zinc-700">Waiting…</span>
              )}
              {step.status === "active" && (
                <>
                  <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                  <span className="text-xs text-zinc-500">Fetching…</span>
                </>
              )}
              {step.status === "done" && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {step.status === "failed" && (
                <>
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Skipped</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
