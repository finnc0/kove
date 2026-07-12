"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { modeConfig, relativeDate, type ReportMode } from "@/lib/mockData";

interface Report {
  id: string;
  title: string;
  project: string;
  mode: ReportMode;
  createdAt: string;
}

export function RecentReports({ reports }: { reports: Report[] }) {
  const router = useRouter();
  if (reports.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-700 uppercase tracking-widest">Recent reports</span>
        <Link href="/projects" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
          View all
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        {reports.map((report, i) => {
          const { label, className } = modeConfig[report.mode];
          const isLast = i === reports.length - 1;
          return (
            <div
              key={report.id}
              onClick={() => router.push(`/report/${report.id}`)}
              className={`flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors ${!isLast ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-white truncate">{report.title}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{report.project}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline" className={`text-xs py-0 ${className}`}>{label}</Badge>
                <span className="text-xs text-zinc-600">{relativeDate(report.createdAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
