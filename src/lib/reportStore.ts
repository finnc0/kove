import type { AnalysisReport } from "./reportSchema";

// In-memory store — persists for the lifetime of the Node.js process.
// Replace with a database in production.
const store = new Map<string, AnalysisReport>();

export function saveReport(report: AnalysisReport): void {
  store.set(report.id, report);
}

export function getReport(id: string): AnalysisReport | undefined {
  return store.get(id);
}

export function listReports(): AnalysisReport[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}
