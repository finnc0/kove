"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader, AlertCircle } from "lucide-react";

const SOURCES = [
  { id: "appstore", label: "App Store" },
  { id: "reddit",   label: "Reddit" },
  { id: "web",      label: "Web search" },
  { id: "website",  label: "Website" },
  { id: "ai",       label: "AI synthesis" },
];

type SourceStatus = "waiting" | "fetching" | "done" | "skipped";

interface Props {
  workspaceId: string;
  nodeId: string;
  appName: string;
  onComplete: (resolvedName: string) => void;
}

export function AnalyzingStep({ workspaceId, nodeId, appName, onComplete }: Props) {
  const [statuses, setStatuses] = useState<Record<string, SourceStatus>>(
    Object.fromEntries(SOURCES.map((s) => [s.id, "waiting"]))
  );
  const [resolvedName, setResolvedName] = useState(appName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const reader = res.body?.getReader();
        if (!reader) return;
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
                setStatuses((prev) => ({
                  ...prev,
                  [event.source]: event.status === "active" ? "fetching" : event.status === "done" ? "done" : "skipped",
                }));
              }
              if (event.type === "complete") {
                const nodeRes = await fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}`);
                if (nodeRes.ok) {
                  const node = await nodeRes.json();
                  if (node.name) setResolvedName(node.name);
                  onComplete(node.name ?? appName);
                } else {
                  onComplete(appName);
                }
              }
              if (event.type === "error") {
                const msg: string = event.message ?? "Analysis failed. The app was saved but could not be fully analyzed.";
                console.error("[analyze]", msg);
                setErrorMessage(msg);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("[AnalyzingStep]", err);
        setErrorMessage("Connection error. The app was saved but analysis may be incomplete.");
      }
    })();
  }, [workspaceId, nodeId, appName, onComplete]);

  if (errorMessage) {
    return (
      <div className="w-full text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-base font-medium text-white">{resolvedName}</p>
        <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">{errorMessage}</p>
        <button
          onClick={() => onComplete(appName)}
          className="mt-6 px-5 py-2 text-sm text-zinc-300 border border-white/[0.1] rounded-lg hover:bg-white/[0.04] hover:border-white/[0.18] transition-colors cursor-pointer"
        >
          Continue anyway →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-base font-medium text-white text-center">{resolvedName}</p>
      <p className="text-sm text-zinc-500 text-center mt-1">Being analyzed…</p>

      <div className="mt-10 space-y-3 w-full max-w-sm mx-auto">
        {SOURCES.map((s) => {
          const status = statuses[s.id];
          return (
            <div key={s.id} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{s.label}</span>
              <span className="flex items-center gap-1.5">
                {status === "waiting" && <span className="text-xs text-zinc-700">Waiting</span>}
                {status === "fetching" && <><Loader className="w-3.5 h-3.5 text-zinc-500 animate-spin"/><span className="text-xs text-zinc-500">Fetching</span></>}
                {status === "done" && <><Check className="w-3.5 h-3.5 text-green-400"/><span className="text-xs text-green-400">Done</span></>}
                {status === "skipped" && <span className="text-xs text-zinc-600">Skipped</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
