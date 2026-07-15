"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body style={{ background: "#09090b", color: "#fafafa", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#71717a", fontSize: 13, marginBottom: 8 }}>Something went wrong</p>
          <button
            onClick={reset}
            style={{ background: "#fafafa", color: "#09090b", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
