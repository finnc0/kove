"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function BillingSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"polling" | "done">("polling");

  // Poll /api/me until webhook has flipped the tier to "pro"
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.isPro) {
          setStatus("done");
          clearInterval(interval);
          setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }
      } catch {}
      // Give up after ~30s and send them to dashboard anyway
      if (attempts >= 15) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center">
        {status === "polling" ? (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#2dd4bf]" />
            <h1 className="mb-2 text-xl font-semibold text-white">Activating your Pro plan…</h1>
            <p className="text-sm text-zinc-500">This takes just a moment.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-[#2dd4bf]" />
            <h1 className="mb-2 text-xl font-semibold text-white">Welcome to Pro!</h1>
            <p className="text-sm text-zinc-500">Redirecting you back…</p>
          </>
        )}
      </div>
    </div>
  );
}
