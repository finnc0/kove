"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Star } from "lucide-react";
import type { AppSearchResult } from "@/app/api/search/route";

export type NodeType = "iOS App";

function isUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.includes("apps.apple.com");
}

interface Props {
  onContinue: (url: string, type: NodeType, meta?: AppSearchResult) => void;
}

export function SearchStep({ onContinue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AppSearchResult[] | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function reset() {
    setResults(null);
    setError("");
  }

  async function handleSearch() {
    const trimmed = value.trim();
    if (!trimmed) { setError("Please enter an App Store URL or app name"); return; }
    setError("");

    if (isUrl(trimmed)) {
      onContinue(trimmed, "iOS App");
      return;
    }

    setSearching(true);
    setResults(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&platform=ios`);
      const body = await res.json();

      if (!res.ok || body.error) {
        setError("App Store search unavailable. Paste the App Store URL directly.");
        return;
      }

      const hits: AppSearchResult[] = body;
      if (!hits.length) {
        setError(`No results for "${trimmed}". Try a shorter name or paste the App Store URL.`);
        return;
      }

      setResults(hits);
    } catch {
      setError("Search failed. Paste the App Store URL directly.");
    } finally {
      setSearching(false);
    }
  }

  if (results) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={reset}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <p className="text-sm text-zinc-500">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{value.trim()}&rdquo;
          </p>
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {results.map((app) => (
            <button
              key={app.appId}
              onClick={() => onContinue(app.url, "iOS App", app)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all text-left cursor-pointer group"
            >
              {app.iconUrl ? (
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center text-sm font-bold text-zinc-500">
                  {app.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-white">
                  {app.name}
                </p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{app.developer}</p>
                {app.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-zinc-600 fill-zinc-600" />
                    <span className="text-[11px] text-zinc-600">{app.rating.toFixed(1)}</span>
                    {app.reviews > 0 && (
                      <span className="text-[11px] text-zinc-700">· {app.reviews.toLocaleString()} reviews</span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-700 group-hover:text-zinc-500 shrink-0 transition-colors">
                Select →
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-white text-center">
        Which iOS app do you want to analyze?
      </h2>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); setResults(null); }}
          onKeyDown={(e) => e.key === "Enter" && !searching && handleSearch()}
          placeholder="Paste App Store URL or search by name…"
          disabled={searching}
          className="w-full text-lg text-white placeholder:text-zinc-700 border-0 border-b-2 border-white/10 focus:border-white focus:outline-none focus:ring-0 pb-3 bg-transparent transition-colors text-center disabled:opacity-50"
        />
        {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}
        {searching && (
          <p className="text-xs text-zinc-500 text-center mt-2 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching App Store…
          </p>
        )}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSearch}
          disabled={!value.trim() || searching}
          className={`px-8 py-2.5 text-sm font-medium rounded-lg bg-white text-zinc-900 transition-all flex items-center gap-2 ${
            !value.trim() || searching ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-100 cursor-pointer"
          }`}
        >
          {searching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {searching ? "Searching…" : "Search →"}
        </button>
      </div>
    </div>
  );
}
