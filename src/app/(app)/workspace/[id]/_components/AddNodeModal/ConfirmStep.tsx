import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppSearchResult } from "@/app/api/search/route";
import type { NodeType } from "./SearchStep";

interface Props {
  url: string;
  type: NodeType;
  meta?: AppSearchResult;
  onConfirm: () => void;
  onBack: () => void;
}

function platformsFor(url: string, meta?: AppSearchResult): string[] {
  if (meta?.platform === "ios" || url.includes("apps.apple.com")) return ["iOS"];
  return ["Web"];
}

export function ConfirmStep({ url, type, meta, onConfirm, onBack }: Props) {
  const name = meta?.name ?? url.replace(/https?:\/\//, "").split("/")[0];
  const platforms = platformsFor(url, meta);
  const iconUrl = meta?.iconUrl;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-white text-center mb-8">
        Looks good?
      </h2>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 w-full">
        <div className="flex flex-col items-center text-center">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt={name} className="w-14 h-14 rounded-xl mb-3 object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-400 mb-3">
              {name[0]?.toUpperCase()}
            </div>
          )}

          <h3 className="text-lg font-semibold text-white">{name}</h3>

          {meta?.developer && (
            <p className="text-xs text-zinc-500 mt-0.5">{meta.developer}</p>
          )}

          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {platforms.map((p) => (
              <Badge key={p} variant="outline" className="text-xs text-zinc-500 border-zinc-700">{p}</Badge>
            ))}
          </div>

          {meta && meta.rating > 0 && (
            <p className="text-sm text-zinc-500 mt-2">
              ★ {meta.rating.toFixed(1)} · {meta.reviews.toLocaleString()} reviews
            </p>
          )}

          {!meta && (
            <p className="text-sm text-zinc-500 mt-3 leading-relaxed max-w-xs">
              App details will be pulled from the App Store during analysis.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onConfirm}
          className="w-full bg-white text-zinc-900 text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          Start Analysis
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}
