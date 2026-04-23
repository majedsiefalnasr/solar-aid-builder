import logoUrl from "@/assets/tamm-logo.png";

/**
 * Official TAMM logo (lockup with mark + wordmark).
 * Use `mark-only` variant when you only want the hexagon mark.
 */
export function TammMark({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="تم — TAMM"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
