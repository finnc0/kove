"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ReportTopBar } from "./_components/ReportTopBar";
import { SectionNav } from "./_components/SectionNav";
import { MarketSnapshot } from "./_components/MarketSnapshot";
import { CompetitorMap } from "./_components/CompetitorMap";
import { PainPoints } from "./_components/PainPoints";
import { GapAnalysis } from "./_components/GapAnalysis";
import { OpportunityScores } from "./_components/OpportunityScores";
import { Positioning } from "./_components/Positioning";
import { PricingAnalysis } from "./_components/PricingAnalysis";
import { NotesPanel } from "./_components/NotesPanel";
import { MOCK_REPORT } from "./_components/mockData";
import type { AnalysisReport } from "@/lib/reportSchema";

function LoadingSkeleton() {
  return (
    <div className="flex-1 min-w-0 space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-32" />
      ))}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport]     = useState<AnalysisReport | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    // "mock-report-id" always uses the demo data
    if (id === "mock-report-id") {
      setReport(MOCK_REPORT as AnalysisReport);
      setLoading(false);
      return;
    }
    fetch(`/api/reports/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: AnalysisReport) => setReport(data))
      .catch(() => setReport(MOCK_REPORT as AnalysisReport))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto w-full px-8 py-10 flex items-center gap-3 text-zinc-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading report…</span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto w-full px-8 pt-10">
      <ReportTopBar
        title={report.title}
        mode={report.mode}
        generatedAt={report.generatedAt}
        notesOpen={notesOpen}
        onNotesToggle={() => setNotesOpen((v) => !v)}
        onTitleChange={(t) => setReport((r) => r ? { ...r, title: t } : r)}
      />
      <SectionNav />
      <div className="pb-20 space-y-8">
        <MarketSnapshot data={report.marketSnapshot} />
        <CompetitorMap competitors={report.competitors} />
        {report.pricing && <PricingAnalysis data={report.pricing} />}
        <PainPoints painPoints={report.painPoints} />
        <GapAnalysis gaps={report.gaps} />
        <OpportunityScores opportunities={report.opportunities} />
        <Positioning positioning={report.positioning} />
      </div>
      {notesOpen && <NotesPanel onClose={() => setNotesOpen(false)} />}
    </div>
  );
}
