import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BillingCancelledPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center">
        <p className="mb-2 text-2xl">☁️</p>
        <h1 className="mb-2 text-xl font-semibold text-white">No charge was made</h1>
        <p className="mb-6 text-sm text-zinc-500">
          You can upgrade whenever you&apos;re ready.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-white/[0.15] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
