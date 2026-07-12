export function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}
