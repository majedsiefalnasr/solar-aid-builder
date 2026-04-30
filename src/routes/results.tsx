import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  ChevronDown,
  Package,
  Lightbulb,
  Refrigerator,
  Monitor,
  Fan,
  WashingMachine,
  Microwave,
  Wifi,
  AirVent,
  Cable,
  LayoutGrid,
  CircuitBoard,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
import { calculate, loadState, type CalcResult, type CalcState } from "@/lib/calculator";
import { arabicNumber } from "@/components/calculator-shell";
import {
  RoiHero,
  SavingsChart,
  TrustGrid,
  SocialProof,
  FinancingOptions,
  buildTrustItems,
  computeRoi,
} from "@/components/results-roi";
import { MediaGallery } from "@/components/media-gallery";
import {
  AccessoriesCard,
  computeAccessoryAdjustment,
  defaultAccessories,
  type AccessoriesState,
} from "@/components/accessories-card";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "نتائج حاسبة الطاقة الشمسية | تم" },
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
  const [baseResult, setBaseResult] = useState<CalcResult | null>(null);
  const [accessories, setAccessories] = useState<AccessoriesState>(defaultAccessories);
  const [pid] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000",
  );

  useEffect(() => {
    const s = loadState();
    setState(s);
    setBaseResult(calculate(s));
  }, []);

  const result = useMemo<CalcResult | null>(() => {
    if (!baseResult) return null;
    const adj = computeAccessoryAdjustment(accessories);
    return { ...baseResult, totalSAR: Math.max(0, baseResult.totalSAR + adj) };
  }, [baseResult, accessories]);

  const appliances = useMemo(() => {
    if (!state) return [];
    if (state.mode === "loads") {
      return state.devices.map((d) => `${d.label} — ${arabicNumber(d.qty)}× ${d.watts}W`);
    }
    return [];
  }, [state]);

  const addToCart = (paymentOption: "cash" | "installments" = "cash") => {
    if (!state || !result) return;
    const cart = {
      state,
      result,
      accessories,
      pid,
      paymentOption,
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

  const roi = computeRoi(state, result);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="relative h-40 w-full overflow-hidden md:h-48">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-6 text-center">
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
            نظامك الشمسي المقترح
          </h1>
          <p className="mt-1.5 text-xs text-foreground/80 md:text-sm">
            تقدير دقيق بناءً على أحمالك والاعتمادية المطلوبة.
          </p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-6 max-w-5xl space-y-6 px-4 pb-20 md:px-8">
        <RoiHero roi={roi} />

        {appliances.length > 0 ? <AppliancesCard appliances={appliances} /> : null}

        <ComponentsSummaryCard result={result} />

        <AccessoriesCard value={accessories} onChange={setAccessories} />

        <MediaGallery />

        <SavingsChart roi={roi} />

        <TechnicalDetails state={state} result={result} />

        <TrustGrid items={buildTrustItems(state, result)} city={state.city} />

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
              <div className="mt-1 text-[11px] opacity-80">
                قابل للتخفيض بحسب المسافة من السطح إلى مكان المنظومة
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <button
                onClick={() => addToCart("cash")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary shadow-md transition hover:bg-white/95"
              >
                <ShoppingCart className="h-4 w-4" />
                إضافة للسلة
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <SocialProof city={state.city} />

        <FinancingOptions total={result.totalSAR} onChoose={(opt) => addToCart(opt)} />

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

// ---------- Appliance icons ----------
function getApplianceIcon(text: string) {
  const t = text;
  if (/لمب|إضاءة|اضاءة/.test(t)) return Lightbulb;
  if (/ثلاج|فريزر/.test(t)) return Refrigerator;
  if (/شاش|تلفاز|تلفزيون/.test(t)) return Monitor;
  if (/مروح/.test(t)) return Fan;
  if (/غسال/.test(t)) return WashingMachine;
  if (/خلاط|محضرة|ميكروويف|مطبخ/.test(t)) return Microwave;
  if (/مودم|راوتر|اتصال|واي/.test(t)) return Wifi;
  if (/مكيف|تكييف/.test(t)) return AirVent;
  return CheckCircle2;
}

function AppliancesCard({ appliances }: { appliances: string[] }) {
  if (!appliances.length) return null;
  return (
    <Card>
      <SectionTitle
        icon={<Lightbulb className="h-5 w-5" />}
        title="الأجهزة التي يمكن تشغيلها"
      />
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
        {appliances.map((a, i) => {
          const Icon = getApplianceIcon(a);
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-foreground/90">{a}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---------- Components summary ----------
function ComponentsSummaryCard({ result }: { result: CalcResult }) {
  const batteryUnitKWh = 5;
  const batteryUnits = Math.max(
    result.batteryKWh > 0 ? 1 : 0,
    Math.ceil(result.batteryKWh / batteryUnitKWh),
  );
  const rackingArea = result.panelCount * 4;
  const items: Array<{ icon: typeof Sun; title: string; detail: string }> = [
    {
      icon: Sun,
      title: "الألواح الشمسية",
      detail: `${arabicNumber(result.panelCount)} لوح × 650 وات (${result.panelKWp} kWp)`,
    },
    {
      icon: BatteryCharging,
      title: "البطاريات",
      detail:
        result.batteryKWh > 0
          ? `${arabicNumber(batteryUnits)} بطارية ليثيوم — السعة الإجمالية ${result.batteryKWh} kWh`
          : "بدون بطاريات (نهاري فقط)",
    },
    {
      icon: Zap,
      title: "الإنفرتر",
      detail: `${result.inverterKVA} kVA — هجين 48V`,
    },
    {
      icon: LayoutGrid,
      title: "قواعد التركيب",
      detail: `مساحة تقريبية ${arabicNumber(rackingArea)} م² (${arabicNumber(result.panelCount)} × 4 م²)`,
    },
    {
      icon: Cable,
      title: "الأسلاك",
      detail: "18 م — أسلاك DC/AC مقاومة للحرارة",
    },
    {
      icon: CircuitBoard,
      title: "الطبلون",
      detail: "طبلون توزيع مع قواطع حماية",
    },
  ];
  return (
    <Card>
      <SectionTitle icon={<Package className="h-5 w-5" />} title="ملخص مكونات الحزمة" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <it.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-extrabold text-ink">{it.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{it.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Advanced technical details (collapsible) ----------
function TechnicalDetails({ state, result }: { state: CalcState; result: CalcResult }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-3xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-right md:px-8"
        aria-expanded={open}
      >
        <span className="text-sm font-extrabold text-primary">معلومات تقنية متقدمة</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="space-y-6 border-t border-border px-6 pb-6 pt-6 md:px-8">
          <div>
            <SectionTitle icon={<Zap className="h-5 w-5" />} title="ملخص الاستهلاك" />
            {state.mode === "bill" ? (
              <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">حساب بحسب الفاتورة التجارية</span>
                  <span className="text-muted-foreground">
                    {arabicNumber(state.bill.kWh15Days)} kWh / 15 يوم
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  نهار: {arabicNumber(state.bill.dayHours)}h · ليل:{" "}
                  {arabicNumber(state.bill.nightHours)}h
                </div>
              </div>
            ) : (
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
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat label="إجمالي يومي" value={`${result.totalDailyKWh} kWh`} />
              <Stat label="استهلاك ليلي" value={`${result.nightKWh} kWh`} />
              <Stat
                label="نمط الاستخدام"
                value={state.autonomy > 0 ? "ليلي ونهاري" : "نهاري فقط"}
              />
            </div>
          </div>

          <div>
            <SectionTitle icon={<Sun className="h-5 w-5" />} title="الألواح الشمسية" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Stat label="عدد الألواح" value={`${arabicNumber(result.panelCount)} لوح`} highlight />
              <Stat label="قدرة اللوح" value="650 وات" />
              <Stat label="القدرة الإجمالية" value={`${result.panelKWp} kWp`} />
            </div>
            <Note tone="muted">
              الحساب مبني على متوسط ساعات ذروة شمسية = 5.5 ساعة في {state.city}.
            </Note>
          </div>

          {state.autonomy > 0 && result.batteryKWh > 0 ? (
            <div>
              <SectionTitle
                icon={<BatteryCharging className="h-5 w-5" />}
                title="بنك البطاريات"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <Stat label="السعة" value={`${result.batteryKWh} kWh`} highlight />
                <Stat label="السعة بـ Ah" value={`${arabicNumber(result.batteryAh)} Ah`} />
                <Stat label="الجهد" value="48V" />
                <Stat label="النوع" value="ليثيوم LiFePO4" />
              </div>
              <Note>
                <strong>توصية:</strong> الليثيوم (LiFePO4) هو الاستثمار الأفضل: عمر أطول،
                شحن أسرع، وتفريغ عميق آمن.
              </Note>
            </div>
          ) : (
            <div>
              <SectionTitle
                icon={<BatteryCharging className="h-5 w-5" />}
                title="بنك البطاريات"
              />
              <Note tone="muted">
                نظامك مهيّأ للاستخدام النهاري فقط — بدون بطاريات.
              </Note>
            </div>
          )}

          <div>
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
          </div>
        </div>
      ) : null}
    </section>
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
    <div className={`rounded-xl px-4 py-3 ${highlight ? "bg-primary-soft" : "bg-muted"}`}>
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-extrabold ${highlight ? "text-primary" : "text-ink"}`}>
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
