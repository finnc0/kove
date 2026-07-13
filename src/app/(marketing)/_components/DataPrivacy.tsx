import Link from "next/link";
import { ShieldCheck, Mail, User } from "lucide-react";

export function DataPrivacy() {
  return (
    <section className="relative z-10 border-t border-white/[0.04] px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-zinc-500" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
            Privacy &amp; data use
          </p>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-white mb-4">
          What we ask for — and why.
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-2xl">
          Kove is a market research tool. When you create an account, we collect only what
          is necessary to run the service. We do not sell your data, share it with
          advertisers, or use your workspace content to train AI models.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-white">Email address</p>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Used to identify your account and send transactional emails (password resets,
              receipts). Never used for marketing without your consent.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
                <User className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-white">Name (Google sign-in)</p>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              When you sign in with Google, we receive your name and email only. We do not
              access Gmail, Drive, Calendar, or any other Google service.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-600">
          Read our full{" "}
          <Link href="/privacy" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
            Privacy Policy
          </Link>{" "}
          to see exactly how your data is stored and protected.
        </p>
      </div>
    </section>
  );
}
