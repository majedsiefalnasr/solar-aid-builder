/**
 * TAMM brand mark — geometric hexagon assembled from a green chevron (top + bottom-right)
 * over a lighter navy tinted base. Inspired by the official TAMM identity.
 */
export function TammMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Lighter ghosted hexagon base (navy/ink with low opacity) */}
      <path
        d="M32 4 L58 19 V45 L32 60 L6 45 V19 Z"
        fill="currentColor"
        opacity="0.18"
      />
      {/* Top green chevron */}
      <path
        d="M14 22 L32 11 L50 22 L42 27 L32 21 L22 27 Z"
        fill="#3DBE9A"
      />
      {/* Bottom-right green diagonal bar */}
      <path
        d="M50 22 V45 L32 56 V47 L42 41 V27 Z"
        fill="#3DBE9A"
      />
    </svg>
  );
}
