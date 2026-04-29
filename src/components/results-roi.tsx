import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Sparkles,
  MapPin,
  Camera,
  CreditCard,
  Banknote,
} from "lucide-react";
import type { CalcResult, CalcState } from "@/lib/calculator";
import { arabicNumber } from "@/components/calculator-shell";
import install1 from "@/assets/install-1.jpg";
import install2 from "@/assets/install-2.jpg";
import install3 from "@/assets/install-3.jpg";

// Commercial electricity price per kWh (SAR) — موحّد لجميع المدن.
// مثال: فاتورة نصف شهرية 450 kWh => فاتورة شهرية = 450 × 2 × 3.4 = 3,060 ر.س
const COMMERCIAL_RATE_BY_CITY: Record<string, number> = {
  عدن: 3.4,
  صنعاء: 3.4,
  تعز: 3.4,
  حضرموت: 3.4,
  المكلا: 3.4,
  إب: 3.4,
};

const DEFAULT_RATE = 3.4;

export interface RoiData {
  monthlySavingSAR: number;
  yearlySavingSAR: number;
  paybackMonths: number;
  ratePerKWh: number;
  systemCost: number;
}

export function computeRoi(state: CalcState, result: CalcResult): RoiData {
  const rate = COMMERCIAL_RATE_BY_CITY[state.city] ?? DEFAULT_RATE;
  const dailyKWh = Math.max(0.5, result.totalDailyKWh);
  const monthlySaving = Math.round(dailyKWh * 30 * rate);
  const yearlySaving = monthlySaving * 12;
  const paybackMonths =
    monthlySaving > 0 ? Math.max(6, Math.round(result.totalSAR / monthlySaving)) : 0;
  return {
    monthlySavingSAR: monthlySaving,
    yearlySavingSAR: yearlySaving,
    paybackMonths,
    ratePerKWh: rate,
    systemCost: result.totalSAR,
  };
}

// ---------- ROI hero strip ----------
export function RoiHero({ roi }: { roi: RoiData }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-amber-50 p-6 shadow-card md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            عائد الاستثمار · ROI
          </div>
          <h3 className="mt-1 text-xl font-extrabold leading-snug text-ink md:text-2xl">
            احصل على هذه المنظومة، ووفر{" "}
            <span className="text-emerald-700">
              {arabicNumber(roi.monthlySavingSAR.toLocaleString("en-US"))} ر.س
            </span>{" "}
            شهرياً، وستسترد كامل قيمة استثمارك خلال{" "}
            <span className="text-emerald-700">
              {arabicNumber(roi.paybackMonths)} شهراً
            </span>{" "}
            فقط.
          </h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RoiStat
          icon={<Wallet className="h-4 w-4" />}
          label="توفير شهري"
          value={`${arabicNumber(roi.monthlySavingSAR.toLocaleString("en-US"))} ر.س`}
        />
        <RoiStat
          icon={<Wallet className="h-4 w-4" />}
          label="توفير سنوي"
          value={`${arabicNumber(roi.yearlySavingSAR.toLocaleString("en-US"))} ر.س`}
          highlight
        />
        <RoiStat
          icon={<TrendingUp className="h-4 w-4" />}
          label="فترة الاسترداد"
          value={`${arabicNumber(roi.paybackMonths)} شهر`}
        />
        <RoiStat
          icon={<Sparkles className="h-4 w-4" />}
          label="سعر الكهرباء التجاري"
          value={`${roi.ratePerKWh.toFixed(2)} ر.س / kWh`}
        />
      </div>
    </section>
  );
}

function RoiStat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        highlight
          ? "border-emerald-300 bg-white shadow-sm"
          : "border-emerald-100 bg-white/70"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 text-base font-extrabold ${
          highlight ? "text-emerald-700" : "text-ink"
        } md:text-lg`}
      >
        {value}
      </div>
    </div>
  );
}

// ---------- Savings chart ----------
export function SavingsChart({ roi }: { roi: RoiData }) {
  const data = useMemo(() => {
    // 60 months horizon (5 years)
    const months = 60;
    const monthlyGrid = roi.monthlySavingSAR;
    const rows: Array<{
      month: string;
      grid: number;
      tamm: number;
    }> = [];
    let gridCum = 0;
    for (let m = 1; m <= months; m++) {
      gridCum += monthlyGrid;
      // Tamm: starts at full system cost, drops linearly to 0 at payback, then 0
      const tammRemaining =
        m >= roi.paybackMonths
          ? 0
          : Math.max(0, roi.systemCost - (roi.systemCost / roi.paybackMonths) * m);
      rows.push({
        month: `${m}`,
        grid: Math.round(gridCum),
        tamm: Math.round(tammRemaining),
      });
    }
    return rows;
  }, [roi]);

  const breakEvenMonth = roi.paybackMonths;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            رحلة التوفير · 5 سنوات
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-ink md:text-xl">
            متى تصبح كهرباؤك مجانية؟
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            مقارنة بصرية بين فاتورتك الحالية مع شبكة الكهرباء التجارية ومنظومة "تم".
          </p>
        </div>
        <div className="rounded-xl bg-emerald-100 px-3 py-2 text-center">
          <div className="text-[10px] font-bold text-emerald-700">نقطة التعادل</div>
          <div className="text-base font-extrabold text-emerald-800">
            {arabicNumber(breakEvenMonth)} شهر
          </div>
        </div>
      </div>

      <div className="mt-5 h-64 w-full md:h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gridFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="tammFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              ticks={["1", "12", "24", "36", "48", "60"]}
              label={{ value: "شهر", position: "insideBottom", offset: -2, fontSize: 10 }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12, direction: "rtl" }}
              formatter={(v: number, name: string) => [
                `${v.toLocaleString("en-US")} ر.س`,
                name === "grid" ? "كهرباء تجارية (متراكم)" : "تكلفة منظومة تم",
              ]}
              labelFormatter={(l) => `الشهر ${l}`}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              formatter={(v) =>
                v === "grid" ? "كهرباء تجارية (متراكم)" : "تكلفة منظومة تم"
              }
            />
            <Area
              type="monotone"
              dataKey="grid"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#gridFill)"
            />
            <Area
              type="monotone"
              dataKey="tamm"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#tammFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          الكهرباء التجارية لا تتوقف عن الصعود.
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          منظومة "تم" تنبسط عند الصفر بعد {arabicNumber(breakEvenMonth)} شهر.
        </span>
      </div>
    </section>
  );
}

// ---------- Trust / verified badges ----------
export interface TrustItem {
  id: "panel" | "inverter" | "battery";
  title: string;
  spec: string;
  why: string;
}

const WARRANTY_LIFE: Record<TrustItem["id"], { warranty: string; lifespan: string; label: string }> = {
  panel: { label: "اللوح الشمسي", warranty: "12 سنة", lifespan: "25–30 سنة" },
  inverter: { label: "الإنفرتر", warranty: "5 سنوات", lifespan: "10–15 سنة" },
  battery: { label: "البطارية (LiFePO4)", warranty: "5 سنوات", lifespan: "10–15 سنة" },
};

export function TrustGrid({ items, city: _city }: { items: TrustItem[]; city: string }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            ضمان الجودة · فحص المصنع
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-ink md:text-xl">
            كل قطعة في منظومتك مفحوصة وأصلية ١٠٠٪
          </h3>
        </div>
        <ShieldCheck className="hidden h-10 w-10 text-emerald-600 md:block" />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((it) => {
          const wl = WARRANTY_LIFE[it.id];
          return (
            <div
              key={it.id}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  تم الفحص: أصلي 100%
                </span>
              </div>
              <div className="mt-2 text-sm font-extrabold text-ink">{it.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{it.spec}</div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">
                  <div className="text-[10px] font-bold text-emerald-700">مدة الضمان</div>
                  <div className="mt-0.5 text-sm font-extrabold text-ink">{wl.warranty}</div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-center">
                  <div className="text-[10px] font-bold text-amber-700">العمر الافتراضي</div>
                  <div className="mt-0.5 text-sm font-extrabold text-ink">{wl.lifespan}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Social proof ----------
export function SocialProof({ city }: { city: string }) {
  const photos = [
    { src: install1, caption: `تركيب سكني — ${city}`, kw: "5.2 kWp" },
    { src: install2, caption: `غرفة الإنفرتر والبطاريات — ${city}`, kw: "8 kWh" },
    { src: install3, caption: `تركيب فيلا — ${city}`, kw: "7.8 kWp" },
  ];
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <MapPin className="h-3.5 w-3.5" />
            تركيبات حقيقية في {city}
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-ink md:text-xl">
            عملاء بدأوا قبلك بالفعل
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            صور موثّقة من فريق "تم" — بإذن العملاء.
          </p>
        </div>
        <Camera className="hidden h-9 w-9 text-emerald-600 md:block" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {photos.map((p) => (
          <figure
            key={p.src}
            className="group relative overflow-hidden rounded-2xl border border-border bg-background"
          >
            <img
              src={p.src}
              alt={p.caption}
              loading="lazy"
              width={1024}
              height={640}
              className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-[11px] font-bold text-white">
              <span>{p.caption}</span>
              <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px]">
                {p.kw}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ---------- Financing options ----------
export function FinancingOptions({
  total,
  onChoose,
}: {
  total: number;
  onChoose: (option: "cash" | "installments") => void;
}) {
  const months = 18;
  const monthly = Math.round(total / months);
  return (
    <section className="rounded-3xl border border-emerald-200/60 bg-gradient-to-bl from-amber-50 to-emerald-50/40 p-6 shadow-card md:p-8">
      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
        خيارات السداد
      </div>
      <h3 className="mt-1 text-lg font-extrabold text-ink md:text-xl">
        ابدأ اليوم — وادفع بالطريقة التي تناسبك
      </h3>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("cash")}
          className="group rounded-2xl border border-border bg-card p-4 text-right transition hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <Banknote className="h-6 w-6 text-emerald-600" />
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              خصم 5%
            </span>
          </div>
          <div className="mt-2 text-base font-extrabold text-ink">دفع كاش / تحويل بنكي</div>
          <div className="mt-1 text-xs text-muted-foreground">
            استفد من خصم فوري عند السداد الكامل.
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-700 group-hover:underline">
            اختر هذا الخيار ←
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChoose("installments")}
          className="group relative rounded-2xl border-2 border-emerald-500 bg-card p-4 text-right transition hover:shadow-md"
        >
          <span className="absolute -top-2 right-4 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
            الأكثر طلباً
          </span>
          <div className="flex items-center justify-between">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
              {arabicNumber(months)} شهر
            </span>
          </div>
          <div className="mt-2 text-base font-extrabold text-ink">تقسيط / تمويل</div>
          <div className="mt-1 text-xs text-muted-foreground">
            بدءاً من{" "}
            <span className="font-extrabold text-ink">
              {arabicNumber(monthly.toLocaleString("en-US"))} ر.س
            </span>{" "}
            شهرياً.
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-700 group-hover:underline">
            اطلب التقسيط ←
          </div>
        </button>
      </div>
    </section>
  );
}

export function buildTrustItems(state: CalcState, result: CalcResult): TrustItem[] {
  const city = state.city;
  return [
    {
      id: "panel",
      title: "لوح شمسي JA Solar 650W",
      spec: `${arabicNumber(result.panelCount)} لوح · ${result.panelKWp} kWp`,
      why: `لأنه مصمم للجو الحار في ${city} ويتحمل الرطوبة العالية والغبار. درجة كفاءة عالية حتى عند ٤٥°م، وزجاج مزدوج مقاوم للملوحة الجوية في المدن الساحلية.`,
    },
    {
      id: "inverter",
      title: "إنفرتر هايبرد Deye / Growatt",
      spec: `${result.inverterKVA} kVA · Surge ≥ ${result.surgeKVA} kVA`,
      why: `يدير الأحمال المنزلية الكبيرة (مكيفات، مضخات) بانسيابية، ويتعامل مع انقطاع الشبكة في ${city} بسلاسة بفضل دعم الطاقة الهجينة.`,
    },
    {
      id: "battery",
      title: "بطارية ليثيوم LiFePO4",
      spec: `${result.batteryKWh} kWh · 48V`,
      why: `تقنية الليثيوم فوسفات أكثر أماناً في الحرارة المرتفعة، وعمر ٦٠٠٠ دورة شحن، ما يعني عمر تشغيلي يتجاوز ١٢ سنة في ظروف ${city}.`,
    },
  ];
}
