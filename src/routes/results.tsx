import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Sun,
  BatteryCharging,
  Zap,
  Edit3,
  Download,
  Image as ImageIcon,
  Share2,
  RefreshCw,
  ShoppingCart,
  Store,
  CheckCircle2,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
import { calculate, loadState, type CalcResult, type CalcState } from "@/lib/calculator";
import { arabicNumber } from "@/components/calculator-shell";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "نتائج حاسبة الطاقة الشمسية | بنيان" },
      {
        name: "description",
        content: "احصل على تفاصيل نظامك الشمسي المقترح: الألواح، البطاريات، والإنفرتر.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<CalcState | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [pid] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000",
  );

  useEffect(() => {
    const s = loadState();
    setState(s);
    setResult(calculate(s));
  }, []);

  const addToCart = () => {
    if (!state || !result) return;
    const cart = {
      state,
      result,
      pid,
      addedAt: new Date().toISOString(),
    };
    localStorage.setItem("mutajadidah:cart:v1", JSON.stringify(cart));
    navigate({ to: "/cart" });
  };

  if (!state || !result) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          جاري الحساب...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <div className="relative h-44 w-full overflow-hidden md:h-56">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-extrabold text-ink md:text-4xl">
            نظامك الشمسي المقترح
          </h1>
          <p className="mt-1.5 text-sm text-foreground/80">
            تقدير دقيق بناءً على أحمالك والاعتمادية المطلوبة.
          </p>
        </div>
      </div>

      <main className="mx-auto -mt-10 max-w-5xl space-y-6 px-4 pb-20 md:px-8">
        {/* Loads summary */}
        <Card>
          <SectionTitle icon={<Zap className="h-5 w-5" />} title="ملخص الأحمال" />
          <div className="mt-4 space-y-2.5">
            {state.devices.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm"
              >
                <span className="font-bold text-ink">{d.label}</span>
                <span className="text-muted-foreground">
                  {arabicNumber(d.qty)}× {d.watts}W · {arabicNumber(d.hours)}h
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="إجمالي يومي" value={`${result.totalDailyKWh} kWh`} />
            <Stat label="استهلاك ليلي" value={`${result.nightKWh} kWh`} />
            <Stat label="أيام الاستقلالية" value={arabicNumber(state.autonomy || 0.5)} />
          </div>
        </Card>

        {/* Panels */}
        <Card>
          <SectionTitle icon={<Sun className="h-5 w-5" />} title="الألواح الشمسية" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="عدد الألواح" value={`${arabicNumber(result.panelCount)} لوح`} highlight />
            <Stat label="القدرة الإجمالية" value={`${result.panelKWp} kWp`} />
            <Stat label="فقد النظام التقديري" value="~30%" />
          </div>
          <Note tone="muted">
            الحساب مبني على متوسط ساعات ذروة شمسية = 5.5 ساعة في {state.city}.
          </Note>
        </Card>

        {/* Batteries */}
        <Card>
          <SectionTitle
            icon={<BatteryCharging className="h-5 w-5" />}
            title="بنك البطاريات"
          />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Stat label="السعة" value={`${result.batteryKWh} kWh`} highlight />
            <Stat label="السعة بـ Ah" value={`${arabicNumber(result.batteryAh)} Ah`} />
            <Stat label="الجهد" value="48V" />
            <Stat label="أيام الاستقلالية" value={arabicNumber(state.autonomy || 0.5)} />
          </div>
          <Note>
            <strong>توصية:</strong> الليثيوم (LiFePO4) هو الاستثمار الأفضل: عمر أطول،
            شحن أسرع، وتفريغ عميق آمن.
          </Note>
        </Card>

        {/* Inverter */}
        <Card>
          <SectionTitle icon={<Zap className="h-5 w-5" />} title="محول الطاقة (الإنفرتر)" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="القدرة" value={`${result.inverterKVA} kVA`} highlight />
            <Stat label="الحمل الأقصى" value={`${result.maxLoadKW} kW`} />
            <Stat label="Surge موصى" value={`≥ ${result.surgeKVA} kVA`} />
          </div>
          <Note>
            <strong>ملاحظة هامة:</strong> تأكد من أن قدرة الإقلاع (Surge) لا تقل عن{" "}
            {result.surgeKVA} kVA.
          </Note>
        </Card>

        {/* Cost + actions */}
        <div className="rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-6 text-primary-foreground shadow-elevated md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-semibold opacity-80">التكلفة التقديرية الشاملة</div>
              <div className="mt-1 text-4xl font-extrabold md:text-5xl">
                {arabicNumber(result.totalSAR.toLocaleString("en-US"))}{" "}
                <span className="text-lg opacity-80">ر.س</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                <CheckCircle2 className="h-3.5 w-3.5" />
                شامل التركيب والتشغيل
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <button
                onClick={addToCart}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary shadow-md transition hover:bg-white/95"
              >
                <ShoppingCart className="h-4 w-4" />
                إضافة للسلة
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action chips */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionChip icon={<Edit3 className="h-4 w-4" />} onClick={() => navigate({ to: "/calculator/devices" })}>
            تعديل
          </ActionChip>
          <ActionChip icon={<RefreshCw className="h-4 w-4" />} onClick={() => navigate({ to: "/calculator" })}>
            جديد
          </ActionChip>
          <ActionChip icon={<Share2 className="h-4 w-4" />}>نص</ActionChip>
          <ActionChip icon={<ImageIcon className="h-4 w-4" />}>صورة</ActionChip>
          <ActionChip icon={<Download className="h-4 w-4" />} highlight>
            PDF
          </ActionChip>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-xs">
          <span className="font-bold tracking-wider text-muted-foreground">
            مرجع العملية / PROCESS ID
          </span>
          <code className="rounded-md bg-primary-soft px-3 py-1.5 font-mono text-primary">
            {pid}
          </code>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      {children}
    </section>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        highlight ? "bg-primary-soft" : "bg-muted"
      }`}
    >
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-lg font-extrabold ${
          highlight ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Note({
  children,
  tone = "primary",
}: {
  children: React.ReactNode;
  tone?: "primary" | "muted";
}) {
  return (
    <div
      className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed ${
        tone === "muted"
          ? "bg-muted text-muted-foreground"
          : "bg-primary-soft text-foreground/85"
      }`}
    >
      {children}
    </div>
  );
}

function ActionChip({
  children,
  icon,
  onClick,
  highlight,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
        highlight
          ? "bg-primary-soft text-primary hover:bg-primary/15"
          : "bg-muted text-foreground/80 hover:bg-muted/70"
      }`}
    >
      {children}
      {icon}
    </button>
  );
}
