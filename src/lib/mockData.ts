export type ReportMode = "market" | "app" | "sweep";

export interface Report {
  id: string;
  title: string;
  mode: ReportMode;
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export const PROJECTS: Project[] = [
  { id: "p1", name: "Productivity Tools", createdAt: "2026-05-01T10:00:00Z" },
  { id: "p2", name: "Health & Wellness",  createdAt: "2026-05-10T09:00:00Z" },
  { id: "p3", name: "FinTech Research",   createdAt: "2026-05-20T14:00:00Z" },
];

export const REPORTS: Report[] = [
  { id: "1", title: "AI note-taking apps",          mode: "app",    projectId: "p1", createdAt: "2026-05-29T12:00:00Z" },
  { id: "3", title: "Notion competitor analysis",   mode: "sweep",  projectId: "p1", createdAt: "2026-05-26T08:00:00Z" },
  { id: "5", title: "Focus tools for developers",   mode: "market", projectId: "p1", createdAt: "2026-05-15T16:00:00Z" },
  { id: "2", title: "Fitness tracker market",        mode: "market", projectId: "p2", createdAt: "2026-05-28T10:00:00Z" },
  { id: "6", title: "Mental wellness apps",          mode: "sweep",  projectId: "p2", createdAt: "2026-05-22T11:00:00Z" },
  { id: "4", title: "B2B invoicing landscape",       mode: "market", projectId: "p3", createdAt: "2026-05-23T15:00:00Z" },
  { id: "7", title: "Expense tracking apps",         mode: "app",    projectId: "p3", createdAt: "2026-05-21T09:00:00Z" },
];

export const modeConfig: Record<ReportMode, { label: string; className: string }> = {
  market: { label: "Market",    className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  app:    { label: "App",       className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  sweep:  { label: "Full Sweep",className: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

export function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7)  return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
