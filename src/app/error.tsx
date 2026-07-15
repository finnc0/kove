"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#71717a", fontSize: 14 }}>Something went wrong</p>
      <button
        onClick={reset}
        style={{ background: "#18181b", color: "#fafafa", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
