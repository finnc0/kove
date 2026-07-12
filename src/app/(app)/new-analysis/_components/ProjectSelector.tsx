import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

const MOCK_PROJECTS = ["Productivity Tools", "Health & Wellness", "FinTech Research"];

interface ProjectSelectorProps {
  selected: string;
  onSelect: (v: string) => void;
  newProjectName: string;
  onNewProjectNameChange: (v: string) => void;
  error?: string;
}

export function ProjectSelector({
  selected,
  onSelect,
  newProjectName,
  onNewProjectNameChange,
  error,
}: ProjectSelectorProps) {
  return (
    <div className="border-t border-white/[0.06] pt-5 mt-5 space-y-3">
      <div>
        <Label className="mb-2 block">Save to project</Label>
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full h-10 appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-3.5 pr-9 text-sm text-white focus:outline-none focus:border-white/[0.18] cursor-pointer"
          >
            {MOCK_PROJECTS.map((p) => (
              <option key={p} value={p} className="bg-zinc-900 text-white">
                {p}
              </option>
            ))}
            <option value="__new__" className="bg-zinc-900 text-white">
              Create new project…
            </option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        </div>
        <p className="text-xs text-zinc-600 mt-1.5">Reports are organized by project</p>
      </div>

      {selected === "__new__" && (
        <div>
          <Input
            value={newProjectName}
            onChange={(e) => onNewProjectNameChange(e.target.value)}
            placeholder="Project name"
            autoFocus
          />
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </div>
      )}
    </div>
  );
}
