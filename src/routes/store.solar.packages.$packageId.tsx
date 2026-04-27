import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sun,
  BatteryCharging,
  Zap,
  ShoppingCart,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
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

        <Card>
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
        </Card>

        <Card>
          <SectionTitle icon={<Sun className="h-5 w-5" />} title="الألواح الشمسية" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="عدد الألواح" value={`${arabicNumber(result.panelCount)} لوح`} highlight />
            <Stat label="قدرة اللوح" value="650 وات" />
            <Stat label="القدرة الإجمالية" value={`${result.panelKWp} kWp`} />
          </div>
          <Note tone="muted">حساب مبني على متوسط ساعات ذروة شمسية = 5 ساعات يومياً.</Note>
        </Card>

        <Card>
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
        </Card>

        <Card>
          <SectionTitle icon={<Zap className="h-5 w-5" />} title="محول الطاقة (الإنفرتر)" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="القدرة" value={`${result.inverterKVA} kVA`} highlight />
            <Stat label="الحمل الأقصى" value={`${result.maxLoadKW} kW`} />
            <Stat label="Surge موصى" value={`≥ ${result.surgeKVA} kVA`} />
          </div>
          <Note>
            <strong>ملاحظة:</strong> قدرة الإنفرتر أكبر من إجمالي قدرة الألواح لضمان الأداء.
          </Note>
        </Card>

        <TrustGrid items={buildTrustItems(state, result)} city={state.city} />
        <SavingsChart roi={roi} />
        <SocialProof city={state.city} />

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

        <FinancingOptions total={result.totalSAR} onChoose={(opt) => addToCart(opt)} />
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
