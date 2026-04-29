import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sun,
  BatteryCharging,
  Zap,
  ShoppingCart,
  CheckCircle2,
  ChevronLeft,
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
import type { CalcResult } from "@/lib/calculator";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
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
import { getPackage, sizePackage } from "@/lib/solar-packages";

export const Route = createFileRoute("/store/solar/packages/$packageId")({
  loader: ({ params }) => {
    const pkg = getPackage(params.packageId);
    if (!pkg || pkg.comingSoon) throw notFound();
    return { pkg };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.pkg.name ?? "حزمة شمسية"} | تم` },
      {
        name: "description",
        content: loaderData?.pkg.subtitle ?? "تفاصيل الحزمة الشمسية الجاهزة.",
      },
      {
        property: "og:title",
        content: `${loaderData?.pkg.name ?? "حزمة شمسية"} | تم`,
      },
    ],
  }),
  component: PackageDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-xl p-12 text-center">
        <h1 className="text-2xl font-extrabold text-ink">الحزمة غير متوفرة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ربما تكون الحزمة قيد التحضير أو الرابط غير صحيح.
        </p>
        <Link
          to="/store/solar/packages"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          الرجوع للحزم
        </Link>
      </div>
    </div>
  ),
});

function PackageDetail() {
  const { pkg } = Route.useLoaderData();
  const navigate = useNavigate();
  const { state, result } = sizePackage(pkg);
  const roi = computeRoi(state, result);

  const addToCart = (paymentOption: "cash" | "installments" = "cash") => {
    const cart = {
      state,
      result,
      pid: `pkg-${pkg.id}`,
      paymentOption,
      packageId: pkg.id,
      packageName: pkg.name,
      addedAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("mutajadidah:cart:v1", JSON.stringify(cart));
    }
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="border-b border-border/60 bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store" className="hover:text-primary">المتجر</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store/solar" className="hover:text-primary">الطاقة الشمسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store/solar/packages" className="hover:text-primary">حُزم جاهزة</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-ink">{pkg.name}</span>
        </div>
      </div>

      <div className="relative h-40 w-full overflow-hidden md:h-48">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-6 text-center">
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{pkg.name}</h1>
          <p className="mt-1.5 text-xs text-foreground/80 md:text-sm">{pkg.subtitle}</p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-6 max-w-5xl space-y-6 px-4 pb-20 md:px-8">
        <RoiHero roi={roi} />

        <AppliancesCard appliances={pkg.appliances ?? []} />

        <ComponentsSummaryCard result={result} />

        <SavingsChart roi={roi} />

        <TechnicalDetails pkg={pkg} result={result} />

        <TrustGrid items={buildTrustItems(state, result)} city={state.city} />

        <div className="rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-6 text-primary-foreground shadow-elevated md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-semibold opacity-80">سعر الحزمة الشاملة</div>
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
  if (/شاش/.test(t)) return Monitor;
  if (/مروح/.test(t)) return Fan;
  if (/غسال/.test(t)) return WashingMachine;
  if (/خلاط|محضرة|ميكروويف|مطبخ/.test(t)) return Microwave;
  if (/مودم|راوتر|اتصال/.test(t)) return Wifi;
  if (/مكيف/.test(t)) return AirVent;
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

// ---------- Components summary (panels, battery, inverter, racking, wires, panel-board) ----------
function ComponentsSummaryCard({ result }: { result: CalcResult }) {
  const batteryUnitKWh = 5; // assumed unit size
  const batteryUnits = Math.max(1, Math.ceil(result.batteryKWh / batteryUnitKWh));
  const rackingArea = result.panelCount * 4; // m²
  const items: Array<{
    icon: typeof Sun;
    title: string;
    detail: string;
  }> = [
    {
      icon: Sun,
      title: "الألواح الشمسية",
      detail: `${arabicNumber(result.panelCount)} لوح × 650 وات (${result.panelKWp} kWp)`,
    },
    {
      icon: BatteryCharging,
      title: "البطاريات",
      detail: `${arabicNumber(batteryUnits)} بطارية ليثيوم — السعة الإجمالية ${result.batteryKWh} kWh`,
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
function TechnicalDetails({
  pkg,
  result,
}: {
  pkg: ReturnType<typeof getPackage> extends infer T ? Exclude<T, undefined> : never;
  result: CalcResult;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-3xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-right md:px-8"
        aria-expanded={open}
      >
        <span className="text-sm font-extrabold text-primary">
          معلومات تقنية متقدمة
        </span>
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
            <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">حساب بحسب فاتورة 15 يوم</span>
                <span className="text-muted-foreground">
                  {arabicNumber(pkg.kWh15Days)} kWh / 15 يوم
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat label="إجمالي يومي" value={`${result.totalDailyKWh} kWh`} />
              <Stat label="استهلاك ليلي" value={`${result.nightKWh} kWh`} />
              <Stat label="نمط الاستخدام" value="ليلي ونهاري" />
            </div>
          </div>

          <div>
            <SectionTitle icon={<Sun className="h-5 w-5" />} title="الألواح الشمسية" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Stat label="عدد الألواح" value={`${arabicNumber(result.panelCount)} لوح`} highlight />
              <Stat label="قدرة اللوح" value="650 وات" />
              <Stat label="القدرة الإجمالية" value={`${result.panelKWp} kWp`} />
            </div>
            <Note tone="muted">حساب مبني على متوسط ساعات ذروة شمسية = 5 ساعات يومياً.</Note>
          </div>

          <div>
            <SectionTitle icon={<BatteryCharging className="h-5 w-5" />} title="بنك البطاريات" />
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Stat label="السعة" value={`${result.batteryKWh} kWh`} highlight />
              <Stat label="السعة بـ Ah" value={`${arabicNumber(result.batteryAh)} Ah`} />
              <Stat label="الجهد" value="48V" />
              <Stat label="النوع" value="ليثيوم LiFePO4" />
            </div>
            <Note>
              <strong>توصية:</strong> بطاريات الليثيوم LiFePO4 توفر عمراً أطول وتفريغاً عميقاً
              آمناً مقارنة بالجل.
            </Note>
          </div>

          <div>
            <SectionTitle icon={<Zap className="h-5 w-5" />} title="محول الطاقة (الإنفرتر)" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Stat label="القدرة" value={`${result.inverterKVA} kVA`} highlight />
              <Stat label="الحمل الأقصى" value={`${result.maxLoadKW} kW`} />
              <Stat label="Surge موصى" value={`≥ ${result.surgeKVA} kVA`} />
            </div>
            <Note>
              <strong>ملاحظة:</strong> قدرة الإنفرتر أكبر من إجمالي قدرة الألواح لضمان الأداء.
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
