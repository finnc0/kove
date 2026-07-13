import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { DotGrid } from "./_components/DotGrid";
import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { HowItWorksScreens } from "./_components/HowItWorksScreens";
import { CompetitorReportDemo } from "./_components/CompetitorReportDemo";
import { SignalStrengthDemo } from "./_components/SignalStrengthDemo";
import { FindingsReportDemo } from "./_components/FindingsReportDemo";
import { IdeaNodeDemo } from "./_components/IdeaNodeDemo";
import { WhyFounders } from "./_components/WhyFounders";
import { ClosingCTA } from "./_components/ClosingCTA";

export const metadata: Metadata = {
  title: "Kove — AI Market Research for Founders",
  description:
    "Analyze your competitors' downloads, revenue, pricing, and reviews — then find the gap worth building into.",
};

export default async function LandingPage() {
  const session = await auth();
  return (
    <div className="relative min-h-screen bg-zinc-950">
      <DotGrid />
      <Nav isSignedIn={!!session?.user} />
      <main>
        <Hero />
        <HowItWorksScreens />
        <CompetitorReportDemo />
        <SignalStrengthDemo />
        <FindingsReportDemo />
        <IdeaNodeDemo />
        <WhyFounders />
        <ClosingCTA />
      </main>
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-xs text-zinc-700">© 2025 Kove Labs</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">Terms</Link>
            <Link href="/privacy" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">Privacy</Link>
            <Link href="/sign-in" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
