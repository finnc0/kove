interface Props {
  className?: string;
}

// Inline SVG of the Kove Labs lockup — no background rect so it blends with any surface.
// viewBox crops tightly to the cove mark + "Kove" + "LABS" text.
export function KoveLogo({ className = "h-6 w-auto" }: Props) {
  return (
    <svg
      viewBox="183 60 320 76"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kove Labs"
      role="img"
    >
      <g transform="translate(192, 72)">
        <path
          d="M 4 4 L 4 28 A 25 25 0 0 0 54 28 L 54 4"
          fill="none"
          stroke="#fafafa"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="54" cy="4" r="7.5" fill="#2dd4bf" />
      </g>
      <text
        x="282"
        y="114"
        fill="#fafafa"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="52"
        fontWeight="600"
        letterSpacing="-1.5"
      >
        Kove
      </text>
      <text
        x="406"
        y="114"
        fill="#71717a"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="28"
        fontWeight="500"
        letterSpacing="4"
      >
        LABS
      </text>
    </svg>
  );
}
