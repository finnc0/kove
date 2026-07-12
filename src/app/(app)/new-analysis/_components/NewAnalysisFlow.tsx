"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { ModeSelector } from "./ModeSelector";
import { MarketInputs } from "./MarketInputs";
import { AppInputs } from "./AppInputs";
import { SweepInputs } from "./SweepInputs";
import { ProjectSelector } from "./ProjectSelector";
import { ProgressTracker, type Step, type SourceId } from "./ProgressTracker";
import { RunButton } from "./RunButton";

type Mode = "market" | "app" | "sweep";

const SOURCE_META: { id: SourceId; label: string }[] = [
  { id: "appstore",  label: "App Store" },
  { id: "playstore", label: "Google Play" },
  { id: "reddit",    label: "Reddit" },
  { id: "web",       label: "Web search" },
  { id: "website",   label: "Website content" },
  { id: "ai",        label: "AI synthesis" },
];

interface NewAnalysisFlowProps {
  initialMode?: Mode | null;
}

export function NewAnalysisFlow({ initialMode = null }: NewAnalysisFlowProps) {
  const router = useRouter();

  const [mode, setMode]               = useState<Mode | null>(initialMode);
  const [category, setCategory]       = useState("");
  const [audience, setAudience]       = useState("");
  const [angle, setAngle]             = useState("");
  const [urls, setUrls]               = useState<string[]>([]);
  const [focusArea, setFocusArea]     = useState("");
  const [project, setProject]         = useState("Productivity Tools");
  const [newProjectName, setNewProjectName] = useState("");
  const [isRunning, setIsRunning]     = useState(false);
  const [steps, setSteps]             = useState<Step[]>([]);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [runError, setRunError]       = useState<string | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if ((mode === "market" || mode === "sweep") && !category.trim())
      next.category = "Market or category is required";
    if (mode === "app" && urls.length === 0)
      next.urls = "At least one URL is required";
    if (project === "__new__" && !newProjectName.trim())
      next.newProject = "Project name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canRun = (() => {
    if (!mode) return false;
    if ((mode === "market" || mode === "sweep") && !category.trim()) return false;
    if (mode === "app" && urls.length === 0) return false;
    if (project === "__new__" && !newProjectName.trim()) return false;
    return true;
  })();

  const getSources = (): typeof SOURCE_META => {
    if (urls.length === 0 && mode !== "app")
      return SOURCE_META.filter((s) => s.id !== "website");
    return SOURCE_META;
  };

  const handleRun = async () => {
    if (!validate()) return;
    setRunError(null);
    setIsRunning(true);

    const sources = getSources();
    setSteps(sources.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" })));

    const updateStep = (source: SourceId, status: Step["status"]) => {
      setSteps((prev) => prev.map((s) => (s.id === source ? { ...s, status } : s)));
    };

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          category,
          audience,
          angle,
          focusArea,
          urls,
          project: project === "__new__" ? newProjectName : project,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "source") {
              updateStep(event.source as SourceId, event.status);
            } else if (event.type === "complete") {
              router.push(`/report/${event.reportId}`);
              return;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setRunError(message);
      setIsRunning(false);
      setSteps([]);
    }
  };

  const summaryText = () => {
    if (!mode) return "";
    const proj = project === "__new__" ? newProjectName || "new project" : project;
    if (mode === "market") return `Market research on "${category}", saved to ${proj}`;
    if (mode === "app")    return `App analysis of ${urls.length} app${urls.length !== 1 ? "s" : ""}, saved to ${proj}`;
    if (mode === "sweep")  return `Full sweep of "${category}"${urls.length > 0 ? ` + ${urls.length} app${urls.length !== 1 ? "s" : ""}` : ""}, saved to ${proj}`;
    return "";
  };

  return (
    <div>
      {/* Step 1 */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mt-6">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-4">
          01 — Choose a mode
        </p>
        <ModeSelector selected={mode} onSelect={(m) => { setMode(m); setErrors({}); }} />
      </div>

      {/* Step 2 */}
      {mode && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mt-4">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-5">
            02 — Research inputs
          </p>

          {mode === "market" && (
            <MarketInputs
              category={category} onCategoryChange={setCategory}
              audience={audience} onAudienceChange={setAudience}
              angle={angle} onAngleChange={setAngle}
              errors={errors} onBlur={validate}
            />
          )}
          {mode === "app" && (
            <AppInputs
              urls={urls} onUrlsChange={setUrls}
              focusArea={focusArea} onFocusAreaChange={setFocusArea}
              errors={errors}
            />
          )}
          {mode === "sweep" && (
            <SweepInputs
              category={category} onCategoryChange={setCategory}
              audience={audience} onAudienceChange={setAudience}
              angle={angle} onAngleChange={setAngle}
              urls={urls} onUrlsChange={setUrls}
              focusArea={focusArea} onFocusAreaChange={setFocusArea}
              errors={errors} onBlur={validate}
            />
          )}

          <ProjectSelector
            selected={project} onSelect={setProject}
            newProjectName={newProjectName} onNewProjectNameChange={setNewProjectName}
            error={errors.newProject}
          />
        </div>
      )}

      {/* Step 3 */}
      {mode && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mt-4">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-5">
            03 — Run analysis
          </p>

          {runError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>{runError}</p>
                <button onClick={handleRun} className="text-xs underline mt-1 hover:text-red-300 transition-colors">
                  Try again
                </button>
              </div>
            </div>
          )}

          {!isRunning && summaryText() && (
            <p className="text-sm text-zinc-500 mb-5">{summaryText()}</p>
          )}

          <RunButton canRun={canRun} isRunning={isRunning} onRun={handleRun} />

          {isRunning && steps.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <ProgressTracker steps={steps} />
              <p className="text-xs text-zinc-700 text-center mt-4">
                This usually takes 30–90 seconds
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
