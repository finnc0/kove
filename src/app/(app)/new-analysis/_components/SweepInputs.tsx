import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UrlChipInput } from "./UrlChipInput";

interface SweepInputsProps {
  category: string;
  onCategoryChange: (v: string) => void;
  audience: string;
  onAudienceChange: (v: string) => void;
  angle: string;
  onAngleChange: (v: string) => void;
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  focusArea: string;
  onFocusAreaChange: (v: string) => void;
  errors: Record<string, string>;
  onBlur?: () => void;
}

export function SweepInputs({
  category,
  onCategoryChange,
  audience,
  onAudienceChange,
  angle,
  onAngleChange,
  urls,
  onUrlsChange,
  focusArea,
  onFocusAreaChange,
  errors,
  onBlur,
}: SweepInputsProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">
          Market or category <span className="text-zinc-600">*</span>
        </Label>
        <Input
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          onBlur={onBlur}
          placeholder="e.g. AI note-taking apps, B2B invoicing tools, fitness trackers…"
        />
        {errors.category ? (
          <p className="text-xs text-red-400 mt-1.5">{errors.category}</p>
        ) : (
          <p className="text-xs text-zinc-600 mt-1.5">
            Be specific — a focused category gives better results
          </p>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Target audience</Label>
        <Input
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          placeholder="e.g. solo founders, enterprise HR teams, Gen Z users…"
        />
      </div>

      <div>
        <Label className="mb-2 block">
          Your angle <span className="text-zinc-600">(optional)</span>
        </Label>
        <Input
          value={angle}
          onChange={(e) => onAngleChange(e.target.value)}
          placeholder="e.g. privacy-first, AI-native, mobile-only, no-code…"
        />
        <p className="text-xs text-zinc-600 mt-1.5">
          Helps tailor the positioning recommendations
        </p>
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <Label className="mb-2 block">
          App or product URLs <span className="text-zinc-600">(optional)</span>
        </Label>
        <UrlChipInput
          urls={urls}
          onUrlsChange={onUrlsChange}
          helperText="Add specific apps to deep-analyze alongside the market research"
        />
      </div>

      <div>
        <Label className="mb-2 block">
          What to focus on <span className="text-zinc-600">(optional)</span>
        </Label>
        <Input
          value={focusArea}
          onChange={(e) => onFocusAreaChange(e.target.value)}
          placeholder="e.g. onboarding, pricing complaints, missing features, UX issues…"
        />
      </div>
    </div>
  );
}
