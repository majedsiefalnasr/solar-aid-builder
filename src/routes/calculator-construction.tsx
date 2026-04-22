import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  HardHat,
  ArrowLeft,
  ArrowRight,
  Layers,
  Construction,
  Package,
  Calculator,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
import { arabicNumber } from "@/components/calculator-shell";

export const Route = createFileRoute("/calculator-construction")({
  head: () => ({
    meta: [
      { title: "حاسبة كميات البناء | بنيان" },
      {
        name: "description",
        content:
          "احسب كميات الخرسانة والحديد والبلوك المطلوبة لمشروعك بناءً على المساحة والارتفاع.",
      },
      { property: "og:title", content: "حاسبة كميات البناء | بنيان" },
      {
        property: "og:description",
        content: "تقدير دقيق لكميات مواد البناء وتكلفتها التقديرية.",
      },
    ],
  }),
  component: ConstructionCalculator,
});

type ProjectType = "residential" | "commercial" | "wall";

const projectPresets: Record<
  ProjectType,
  { label: string; concretePerM2: number; rebarKgPerM2: number; blocksPerM2: number }
> = {
  residential: {
    label: "مبنى سكني",
    concretePerM2: 0.35,
    rebarKgPerM2: 45,
    blocksPerM2: 12.5,
  },
  commercial: {
    label: "مبنى تجاري",
    concretePerM2: 0.45,
    rebarKgPerM2: 65,
    blocksPerM2: 13,
  },
  wall: {
    label: "سور / جدار",
    concretePerM2: 0.12,
    rebarKgPerM2: 18,
    blocksPerM2: 12.5,
  },
};

// Approximate prices (SAR/YER unified placeholder)
const prices = {
  concretePerM3: 285,
  rebarPerKg: 4.2,
  blockPerUnit: 3.5,
  cementPerBag: 28,
};

function ConstructionCalculator() {
  const [type, setType] = useState<ProjectType>("residential");
  const [area, setArea] = useState(150);
  const [floors, setFloors] = useState(2);
  const [wallHeight, setWallHeight] = useState(3);

  const result = useMemo(() => {
    const preset = projectPresets[type];
    const totalArea = area * floors;
    const wallArea = type === "wall" ? area * wallHeight : totalArea * 0.8;

    const concreteM3 = +(totalArea * preset.concretePerM2).toFixed(1);
    const rebarKg = Math.round(totalArea * preset.rebarKgPerM2);
    const blocksCount = Math.round(wallArea * preset.blocksPerM2);
    // Cement bags ~ 7 bags per m³ of concrete
    const cementBags = Math.round(concreteM3 * 7);

    const cost =
      concreteM3 * prices.concretePerM3 +
      rebarKg * prices.rebarPerKg +
      blocksCount * prices.blockPerUnit +
      cementBags * prices.cementPerBag;

    return {
      totalArea,
      concreteM3,
      rebarKg,
      blocksCount,
      cementBags,
      totalCost: Math.round(cost),
    };
  }, [type, area, floors, wallHeight]);

  const reset = () => {
    setType("residential");
    setArea(150);
    setFloors(2);
    setWallHeight(3);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <div className="relative h-40 w-full overflow-hidden md:h-52">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-6 text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
            <HardHat className="h-3 w-3" />
            حاسبة الإنشاءات
          </span>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
            احسب كميات مواد البناء
          </h1>
          <p className="mt-1.5 max-w-xl text-xs text-foreground/80 md:text-sm">
            تقدير سريع لكميات الخرسانة والحديد والبلوك حسب نوع المشروع.
          </p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 pb-20 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Inputs card */}
          <div className="overflow-hidden rounded-3xl bg-card shadow-elevated ring-1 ring-border">
            <div className="border-b border-border/60 px-6 py-5 md:px-8">
              <h2 className="text-lg font-extrabold text-ink">تفاصيل المشروع</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                املأ الحقول التالية لحساب كميات المواد المطلوبة.
              </p>
            </div>

            <div className="space-y-7 px-6 py-7 md:px-8 md:py-8">
              {/* Project type */}
              <div>
                <label className="mb-3 block text-sm font-extrabold text-ink">
                  نوع المشروع
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(projectPresets) as ProjectType[]).map((k) => {
                    const active = type === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setType(k)}
                        className={`rounded-2xl border-2 p-4 text-center transition ${
                          active
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground/60"
                          }`}
                        >
                          {k === "residential" && <Layers className="h-5 w-5" />}
                          {k === "commercial" && <Construction className="h-5 w-5" />}
                          {k === "wall" && <Package className="h-5 w-5" />}
                        </div>
                        <div className="text-sm font-bold text-ink">
                          {projectPresets[k].label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Area */}
              <NumberField
                label={type === "wall" ? "طول السور (متر)" : "مساحة الدور الواحد (م²)"}
                value={area}
                onChange={setArea}
                min={10}
                max={2000}
                step={10}
                hint={type === "wall" ? "مثال: 50 متر طولي" : "مثال: 150 متر مربع"}
              />

              {/* Floors or wall height */}
              {type === "wall" ? (
                <NumberField
                  label="ارتفاع السور (متر)"
                  value={wallHeight}
                  onChange={setWallHeight}
                  min={1}
                  max={6}
                  step={0.5}
                  hint="مثال: 3 متر"
                />
              ) : (
                <NumberField
                  label="عدد الأدوار"
                  value={floors}
                  onChange={setFloors}
                  min={1}
                  max={10}
                  step={1}
                  hint="بما فيها الدور الأرضي"
                />
              )}

              <div className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-foreground/85">
                <strong className="text-primary">إجمالي المساحة:</strong>{" "}
                {arabicNumber(result.totalArea.toLocaleString("en-US"))} م²
              </div>
            </div>
          </div>

          {/* Live results panel */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-6 text-primary-foreground shadow-elevated">
              <div className="flex items-center gap-2 text-xs font-semibold opacity-90">
                <Calculator className="h-4 w-4" />
                التكلفة التقديرية
              </div>
              <div className="mt-2 text-3xl font-extrabold md:text-4xl">
                {arabicNumber(result.totalCost.toLocaleString("en-US"))}
                <span className="ms-1 text-sm opacity-80">ر.س</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] opacity-90">
                <CheckCircle2 className="h-3 w-3" />
                شامل المواد الأساسية
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-4 text-sm font-extrabold text-ink">الكميات المقدّرة</h3>
              <div className="space-y-2.5">
                <ResultRow
                  label="الخرسانة"
                  value={`${arabicNumber(result.concreteM3)} م³`}
                />
                <ResultRow
                  label="حديد التسليح"
                  value={`${arabicNumber(result.rebarKg.toLocaleString("en-US"))} كجم`}
                />
                <ResultRow
                  label="البلوك"
                  value={`${arabicNumber(result.blocksCount.toLocaleString("en-US"))} قطعة`}
                />
                <ResultRow
                  label="أكياس الإسمنت"
                  value={`${arabicNumber(result.cementBags)} كيس`}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  to="/store"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                >
                  تصفح المنتجات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground/80 transition hover:border-primary hover:text-primary"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  إعادة تعيين
                </button>
              </div>
            </div>

            <Link
              to="/tools"
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground transition hover:text-primary"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة إلى الأدوات
            </Link>
          </aside>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          * الأرقام تقديرية مبنية على متوسطات صناعية. للحصول على عرض دقيق يُرجى
          استشارة مهندس مختص.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-extrabold text-ink">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-32 rounded-xl border border-border bg-card px-4 py-2.5 text-center text-base font-extrabold text-ink outline-none focus:border-primary"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-extrabold text-ink">{value}</span>
    </div>
  );
}
