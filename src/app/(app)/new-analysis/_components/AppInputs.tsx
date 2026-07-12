import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UrlChipInput } from "./UrlChipInput";

interface AppInputsProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  focusArea: string;
  onFocusAreaChange: (v: string) => void;
  errors: Record<string, string>;
}

export function AppInputs({
  urls,
  onUrlsChange,
  focusArea,
  onFocusAreaChange,
  errors,
}: AppInputsProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">
          App or product URLs <span className="text-zinc-600">*</span>
        </Label>
        <UrlChipInput
          urls={urls}
          onUrlsChange={onUrlsChange}
          error={errors.urls}
          helperText="Supports App Store, Google Play, and any product website"
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
