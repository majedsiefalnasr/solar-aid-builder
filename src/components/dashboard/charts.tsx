// Lightweight, dependency-free SVG charts for dashboard analytics.
// Pure presentational: no external chart libs, themed via CSS tokens.

import { useId } from "react";

type Tone = "primary" | "accent" | "info" | "danger";

const TONE_HEX: Record<Tone, string> = {
  primary: "#10b981", // emerald-500
  accent: "#f59e0b", // amber-500
  info: "#0ea5e9", // sky-500
  danger: "#f43f5e", // rose-500
};

// ---------- Area / Line Chart ----------
export interface SeriesPoint {
  label: string;
  value: number;
}

export function AreaChart({
  data,
  height = 180,
  tone = "primary",
  showAxis = true,
  formatValue,
}: {
  data: SeriesPoint[];
  height?: number;
  tone?: Tone;
  showAxis?: boolean;
  formatValue?: (n: number) => string;
}) {
  const id = useId();
  const w = 600;
  const h = height;
  const padX = 28;
  const padTop = 14;
  const padBottom = showAxis ? 24 : 8;

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;

  const stepX = innerW / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padTop + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${
    padTop + innerH
  } L ${points[0].x.toFixed(2)} ${padTop + innerH} Z`;

  const color = TONE_HEX[tone];
  const gridLines = [0.25, 0.5, 0.75];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="رسم بياني خطي"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((g) => (
        <line
          key={g}
          x1={padX}
          x2={w - padX}
          y1={padTop + innerH * g}
          y2={padTop + innerH * g}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="3 4"
          className="text-foreground"
        />
      ))}

      {/* Area */}
      <path d={areaPath} fill={`url(#grad-${id})`} />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="white" stroke={color} strokeWidth={2}>
            <title>{`${p.label}: ${formatValue ? formatValue(p.value) : p.value}`}</title>
          </circle>
        </g>
      ))}

      {/* X axis labels */}
      {showAxis &&
        points.map((p, i) => {
          // Show every nth label to avoid clutter
          const skip = Math.ceil(points.length / 8);
          if (i % skip !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={h - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {p.label}
            </text>
          );
        })}
    </svg>
  );
}

// ---------- Bar Chart (vertical) ----------
export function BarChart({
  data,
  height = 180,
  tone = "primary",
  formatValue,
}: {
  data: SeriesPoint[];
  height?: number;
  tone?: Tone;
  formatValue?: (n: number) => string;
}) {
  const id = useId();
  const w = 600;
  const h = height;
  const padX = 24;
  const padTop = 12;
  const padBottom = 26;

  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;
  const gap = 6;
  const barW = (innerW - gap * (data.length - 1)) / data.length;
  const color = TONE_HEX[tone];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="رسم بياني عمودي"
    >
      <defs>
        <linearGradient id={`bar-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={padX}
          x2={w - padX}
          y1={padTop + innerH * g}
          y2={padTop + innerH * g}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="3 4"
          className="text-foreground"
        />
      ))}

      {data.map((d, i) => {
        const bh = (d.value / max) * innerH;
        const x = padX + i * (barW + gap);
        const y = padTop + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={4} fill={`url(#bar-${id})`}>
              <title>{`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={h - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Horizontal Bar Chart ----------
export function HBarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number; tone?: Tone }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const tone = d.tone ?? "primary";
        const color = TONE_HEX[tone];
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 shrink-0 truncate text-xs font-bold text-ink">{d.label}</div>
            <div className="relative flex-1">
              <div className="h-7 w-full overflow-hidden rounded-lg bg-muted/60">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  }}
                />
              </div>
            </div>
            <div className="w-14 shrink-0 text-left text-xs font-extrabold text-ink">
              {formatValue ? formatValue(d.value) : d.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Donut Chart ----------
export interface DonutSlice {
  label: string;
  value: number;
  tone: Tone;
}

export function DonutChart({
  data,
  size = 180,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const stroke = size * 0.18;
  const r = radius - stroke / 2 - 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
          <circle
            cx={radius}
            cy={radius}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={stroke}
            className="text-foreground"
          />
          {data.map((s, i) => {
            const len = (s.value / total) * circ;
            const dasharray = `${len} ${circ - len}`;
            const dashoffset = -offset;
            offset += len;
            return (
              <circle
                key={i}
                cx={radius}
                cy={radius}
                r={r}
                fill="none"
                stroke={TONE_HEX[s.tone]}
                strokeWidth={stroke}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${radius} ${radius})`}
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && (
            <div className="text-xl font-extrabold text-ink leading-none">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="mt-1 text-[10px] font-semibold text-muted-foreground">
              {centerLabel}
            </div>
          )}
        </div>
      </div>
      <ul className="space-y-1.5 text-xs">
        {data.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: TONE_HEX[s.tone] }}
            />
            <span className="font-semibold text-ink">{s.label}</span>
            <span className="text-muted-foreground">
              ({Math.round((s.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Sparkline (compact) ----------
export function Sparkline({
  values,
  tone = "primary",
  height = 36,
}: {
  values: number[];
  tone?: Tone;
  height?: number;
}) {
  const id = useId();
  const w = 120;
  const h = height;
  if (values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = w / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;
  const color = TONE_HEX[tone];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

// ---------- Progress Ring ----------
export function ProgressRing({
  value,
  size = 80,
  tone = "primary",
  label,
}: {
  value: number; // 0..100
  size?: number;
  tone?: Tone;
  label?: string;
}) {
  const radius = size / 2;
  const stroke = 8;
  const r = radius - stroke / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={radius}
          cy={radius}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={stroke}
          className="text-foreground"
        />
        <circle
          cx={radius}
          cy={radius}
          r={r}
          fill="none"
          stroke={TONE_HEX[tone]}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-base font-extrabold text-ink leading-none">{value}%</div>
        {label && <div className="mt-0.5 text-[9px] font-semibold text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}
