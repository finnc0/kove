"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Suspense } from "react";

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"syncing" | "done" | "error">("syncing");

  useEffect(() => {
    if (!sessionId) {
      // No session_id — just poll /api/me as fallback
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch("/api/me");
          const data = await res.json();
          if (data.isPro) {
            setStatus("done");
            clearInterval(interval);
            setTimeout(() => router.push("/dashboard"), 1800);
            return;
          }
        } catch {}
        if (attempts >= 15) {
          clearInterval(interval);
          router.push("/dashboard");
        }
      }, 2000);
      return () => clearInterval(interval);
    }

    // Sync directly from Stripe checkout session — no webhook dependency
    fetch("/api/billing/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.isPro) {
          setStatus("done");
          setTimeout(() => router.push("/dashboard"), 1800);
        } else {
          // Sync said not pro yet — fall back to a few polls
          let attempts = 0;
          const interval = setInterval(async () => {
            attempts++;
            try {
              const r = await fetch("/api/me");
              const d = await r.json();
              if (d.isPro) {
                setStatus("done");
                clearInterval(interval);
                setTimeout(() => router.push("/dashboard"), 1800);
                return;
              }
            } catch {}
            if (attempts >= 8) {
              clearInterval(interval);
              router.push("/dashboard");
            }
          }, 2000);
          return () => clearInterval(interval);
        }
      })
      .catch(() => {
        router.push("/dashboard");
      });
  }, [sessionId, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center">
        {status === "done" ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-[#2dd4bf]" />
            <h1 className="mb-2 text-xl font-semibold text-white">Welcome to Pro!</h1>
            <p className="text-sm text-zinc-500">Redirecting you back…</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#2dd4bf]" />
            <h1 className="mb-2 text-xl font-semibold text-white">Activating your plan…</h1>
            <p className="text-sm text-zinc-500">Just a moment.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
