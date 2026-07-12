"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface UrlChipInputProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  error?: string;
  helperText?: string;
}

export function UrlChipInput({ urls, onUrlsChange, error, helperText }: UrlChipInputProps) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setInputError("Please enter a valid URL");
      return;
    }
    if (urls.includes(trimmed)) {
      setInputError("This URL is already added");
      return;
    }
    onUrlsChange([...urls, trimmed]);
    setInput("");
    setInputError("");
  };

  const remove = (url: string) => onUrlsChange(urls.filter((u) => u !== url));

  return (
    <div>
      {helperText && <p className="text-xs text-zinc-600 mb-2">{helperText}</p>}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setInputError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://apps.apple.com/…"
        />
        <button
          type="button"
          onClick={add}
          className="flex-shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          Add
        </button>
      </div>

      {(inputError || error) && (
        <p className="text-xs text-red-400 mt-1.5">{inputError || error}</p>
      )}

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {urls.map((url) => (
            <span
              key={url}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1 text-xs text-zinc-300"
            >
              <span className="max-w-[220px] truncate">{url}</span>
              <button
                onClick={() => remove(url)}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
