import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kove — AI Market Research for Founders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <svg width="72" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 15 16 L 15 38 A 17 17 0 0 0 49 38 L 49 16"
              fill="none"
              stroke="#fafafa"
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <circle cx="49" cy="16" r="8" fill="#2dd4bf" />
          </svg>
          <span
            style={{
              color: "#fafafa",
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: "-2px",
              marginLeft: 16,
            }}
          >
            Kove
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#71717a",
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: "-0.5px",
            textAlign: "center",
            maxWidth: 720,
            lineHeight: 1.4,
          }}
        >
          AI-powered market research for startup founders.
        </div>

        {/* Bottom pill */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            gap: 12,
          }}
        >
          {["Competitor map", "User pain points", "Product gaps"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "8px 20px",
                color: "#52525b",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
