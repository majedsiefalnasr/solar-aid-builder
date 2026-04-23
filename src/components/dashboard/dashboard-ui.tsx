import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "accent" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary"
      : tone === "accent"
        ? "bg-accent/15 text-accent"
        : tone === "danger"
          ? "bg-rose-100 text-rose-700"
          : "bg-muted text-foreground/70";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-muted-foreground">{label}</div>
          <div className="mt-1.5 text-2xl font-extrabold text-ink md:text-[28px]">{value}</div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-card md:p-6 ${className}`}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "accent" | "danger" | "info";
}) {
  const map: Record<string, string> = {
    muted: "bg-muted text-foreground/70",
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent/15 text-accent",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

// Display rule: only use the K metric prefix when the actual amount is above 10,000.
// `thousands` is the amount expressed in thousands of SAR.
export function fmtMoney(thousands: number) {
  const actual = thousands * 1000;
  const abs = Math.abs(actual);
  if (abs <= 10000) {
    return `${actual.toLocaleString("en-US")} ر.س`;
  }
  const k = actual / 1000;
  const str = Number.isInteger(k)
    ? k.toLocaleString("en-US")
    : k.toFixed(1).replace(/\.0$/, "");
  return `${str}K ر.س`;
}
