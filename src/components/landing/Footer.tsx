import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KoveLogo } from "@/components/KoveLogo";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      {/* Quiet closing CTA */}
      <div className="px-6 py-20 text-center border-b border-white/[0.04]">
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-600 mb-4">
          Get started
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          Don&apos;t build blind.
        </h2>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition-colors"
        >
          Analyze a market free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="mt-4 text-xs text-zinc-700">No credit card required</p>
      </div>

      {/* Wordmark + links */}
      <div className="px-6 py-10">
        <div className="mx-auto max-w-[1100px] flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <KoveLogo className="h-5 w-auto mb-1.5" />
            <p className="text-sm text-zinc-600">AI-powered market research for startups</p>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-700">© 2025 Kove Labs</p>
      </div>
    </footer>
  );
}
