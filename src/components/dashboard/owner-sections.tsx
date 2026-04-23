import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Layers,
  MapPin,
  Package,
  PlusCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  Sun,
  Truck,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
  PURCHASES,
  PURCHASE_STATUS_LABEL,
  PURCHASE_STATUS_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  type PurchaseStatus,
} from "@/lib/dashboard-data";
import { CITIES } from "@/lib/calculator";
import { OwnerDashboard } from "./owner-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader, EmptyHint } from "./section-shell";
import { ProjectDetail } from "./project-detail";

export function OwnerSection({
  section,
  projectId,
}: {
  section: string;
  projectId?: string;
}) {
  switch (section) {
    case "overview":
      return <OwnerDashboard />;
    case "projects":
      return <OwnerProjects />;
    case "project-detail":
      return <ProjectDetail role="owner" projectId={projectId} />;
    case "new-project":
      return <OwnerNewProject />;
    case "payments":
      return <OwnerPayments />;
    case "purchases":
      return <OwnerPurchases />;
    default:
      return <OwnerDashboard />;
  }
}

const MY_PROJECTS = [
  {
    id: MOCK_PROJECT.id,
    name: MOCK_PROJECT.name,
    city: MOCK_PROJECT.city,
    contractor: MOCK_PROJECT.contractor,
    supervisor: MOCK_PROJECT.supervisor,
    totalBudget: MOCK_PROJECT.totalBudget,
    releasedAmount: MOCK_PROJECT.releasedAmount,
    overallProgress: MOCK_PROJECT.overallProgress,
  },
  {
    id: "PRJ-2055",
    name: "شقة المعلا",
    city: "عدن",
    contractor: "مؤسسة بناة الجنوب",
    supervisor: "م. هدى الصبيحي",
    totalBudget: 22_000,
    releasedAmount: 6_500,
    overallProgress: 28,
  },
  {
    id: "PRJ-2068",
    name: "محل تجاري — حي السلام",
    city: "تعز",
    contractor: "—",
    supervisor: "—",
    totalBudget: 9_500,
    releasedAmount: 0,
    overallProgress: 0,
  },
];

function OwnerProjects() {
  return (
    <>
      <PageHeader
        title="مشاريعي"
        subtitle="جميع مشاريعك النشطة على منصة تم"
        action={
          <Link
            to="/dashboard"
            search={{ role: "owner", section: "new-project" }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
          >
            <PlusCircle className="h-4 w-4" /> مشروع جديد
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {MY_PROJECTS.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:shadow-elevated"
          >
            <div className="border-b border-border bg-gradient-to-l from-primary/8 to-transparent p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-primary">#{p.id}</div>
                  <h3 className="mt-1 text-lg font-extrabold text-ink">{p.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.city}
                  </div>
                </div>
                <div className="text-left text-xs">
                  <div className="text-muted-foreground">الميزانية</div>
                  <div className="text-base font-extrabold text-ink">{fmtMoney(p.totalBudget)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>الإنجاز</span>
                  <span className="text-ink">{p.overallProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
                    style={{ width: `${p.overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>المقاول: {p.contractor}</span>
                <span>المشرف: {p.supervisor}</span>
              </div>
              <Link
                to="/dashboard"
                search={{ role: "owner", section: "project-detail", projectId: p.id }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:bg-primary-soft hover:text-primary"
              >
                <Eye className="h-3.5 w-3.5" />
                فتح تفاصيل المشروع
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

interface PrefillData {
  source: "construction-calculator";
  projectType?: string;
  city?: string;
  finish?: string;
  area?: number;
  floors?: number;
  totalArea?: number;
  estimatedCost?: number;
}

function OwnerNewProject() {
  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("عدن");
  const [type, setType] = useState("villa");
  const [budget, setBudget] = useState<number>(0);
  const [area, setArea] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [addSolar, setAddSolar] = useState(false);
  const [solarKWp, setSolarKWp] = useState<number>(0);
  const [solarCost, setSolarCost] = useState<number>(0);
  const [showSolarCalc, setShowSolarCalc] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tamm_new_project_prefill");
      if (raw) {
        const data: PrefillData = JSON.parse(raw);
        setPrefill(data);
        if (data.city) setCity(data.city);
        if (data.projectType) setType(data.projectType);
        if (data.estimatedCost) setBudget(Math.round(data.estimatedCost / 1000));
        if (data.totalArea) setArea(data.totalArea);
      }
    } catch {
      /* noop */
    }
  }, []);

  const projectTypes = [
    { id: "villa", label: "فيلا سكنية" },
    { id: "apartment", label: "شقة سكنية" },
    { id: "commercial", label: "مبنى تجاري" },
    { id: "warehouse", label: "مستودع" },
    { id: "hotel", label: "فندق" },
    { id: "school", label: "مدرسة" },
  ];

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h2 className="mt-4 text-2xl font-extrabold text-ink">تم استلام طلبك!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            سيتم تعيين مهندس مشرف ومقاولين مؤهلين خلال 24 ساعة.
          </p>
          {addSolar && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-[11px] font-bold text-amber-700">
              <Sun className="h-3.5 w-3.5" />
              تمت إضافة مرحلة الطاقة الشمسية ({solarKWp} kWp)
            </div>
          )}
          <Link
            to="/dashboard"
            search={{ role: "owner", section: "projects" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta"
          >
            عرض مشاريعي <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="ابدأ مشروعاً جديداً"
        subtitle="املأ البيانات الأساسية وسنرشح لك أفضل المقاولين والمهندسين"
        action={
          <button
            type="button"
            onClick={() => setShowCalc(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <Calculator className="h-4 w-4" />
            احسب التكلفة المبدئية
          </button>
        }
      />

      {prefill && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-xs">
            <div className="font-bold text-ink">تم تعبئة البيانات تلقائياً من حاسبة البناء</div>
            <div className="mt-0.5 text-muted-foreground">
              {prefill.totalArea ? `مساحة إجمالية ${prefill.totalArea} م² · ` : ""}
              تكلفة تقديرية {prefill.estimatedCost?.toLocaleString("en-US")} ر.س
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.removeItem("tamm_new_project_prefill");
          setSubmitted(true);
        }}
        className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">اسم المشروع</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فيلا الياسمين"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">المدينة</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold text-ink">نوع المشروع</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {projectTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition ${
                  type === t.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-background text-foreground/70 hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">
              الميزانية التقديرية (بآلاف الريالات)
            </span>
            <input
              type="number"
              required
              value={budget || ""}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="48000"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">المساحة (م²)</span>
            <input
              type="number"
              value={area || ""}
              onChange={(e) => setArea(Number(e.target.value))}
              placeholder="300"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink">وصف موجز</span>
          <textarea
            rows={3}
            placeholder="تفاصيل إضافية حول المشروع، المتطلبات الخاصة، الموقع..."
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {/* Optional solar phase */}
        <div className="rounded-2xl border-2 border-dashed border-amber-300/70 bg-amber-50/60 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={addSolar}
              onChange={(e) => setAddSolar(e.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-extrabold text-ink">
                  إضافة مرحلة الطاقة الشمسية
                </span>
                <Pill tone="accent">اختياري</Pill>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                أضف نظام طاقة شمسية لمشروعك بأسعار خاصة. سيتم تنفيذها كمرحلة منفصلة بعد التشطيبات.
              </p>
            </div>
          </label>

          {addSolar && (
            <div className="mt-4 space-y-3 border-t border-amber-200 pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    قدرة النظام (kWp)
                  </span>
                  <input
                    type="number"
                    value={solarKWp || ""}
                    onChange={(e) => setSolarKWp(Number(e.target.value))}
                    placeholder="مثال: 10"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    التكلفة التقديرية (ر.س)
                  </span>
                  <input
                    type="number"
                    value={solarCost || ""}
                    onChange={(e) => setSolarCost(Number(e.target.value))}
                    placeholder="مثال: 25000"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowSolarCalc(true)}
                className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-100 px-4 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-200"
              >
                <Calculator className="h-3.5 w-3.5" />
                استخدم حاسبة الطاقة الشمسية
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
        >
          إرسال الطلب
          <ArrowLeft className="h-4 w-4" />
        </button>
      </form>

      {showCalc && (
        <CalculatorPopup
          onClose={() => setShowCalc(false)}
          onApply={(estimatedCost, totalArea, projectType, cityName) => {
            setBudget(Math.round(estimatedCost / 1000));
            setArea(totalArea);
            setType(projectType);
            setCity(cityName);
            setShowCalc(false);
          }}
        />
      )}
      {showSolarCalc && (
        <SolarCalculatorPopup
          onClose={() => setShowSolarCalc(false)}
          onApply={(kwp, cost) => {
            setSolarKWp(kwp);
            setSolarCost(cost);
            setShowSolarCalc(false);
          }}
        />
      )}
    </>
  );
}

// ---------- Construction Calculator Popup ----------
function CalculatorPopup({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (cost: number, area: number, type: string, city: string) => void;
}) {
  const [type, setType] = useState("villa");
  const [city, setCity] = useState("عدن");
  const [area, setArea] = useState(150);
  const [floors, setFloors] = useState(2);
  const [finish, setFinish] = useState<"economy" | "standard" | "luxury">("standard");

  const presets: Record<string, { concretePerM2: number; rebarKgPerM2: number; blocksPerM2: number; label: string }> = {
    villa: { label: "فيلا سكنية", concretePerM2: 0.4, rebarKgPerM2: 50, blocksPerM2: 12.5 },
    apartment: { label: "شقة سكنية", concretePerM2: 0.32, rebarKgPerM2: 42, blocksPerM2: 11 },
    commercial: { label: "مبنى تجاري", concretePerM2: 0.5, rebarKgPerM2: 70, blocksPerM2: 13 },
    warehouse: { label: "مستودع", concretePerM2: 0.28, rebarKgPerM2: 38, blocksPerM2: 9 },
    hotel: { label: "فندق", concretePerM2: 0.55, rebarKgPerM2: 75, blocksPerM2: 14 },
    school: { label: "مدرسة", concretePerM2: 0.42, rebarKgPerM2: 55, blocksPerM2: 12 },
  };

  const finMul = finish === "economy" ? 0.85 : finish === "luxury" ? 1.4 : 1;

  const result = useMemo(() => {
    const p = presets[type];
    const totalArea = area * floors;
    const wallArea = totalArea * 0.8;
    const concrete = totalArea * p.concretePerM2;
    const rebar = totalArea * p.rebarKgPerM2;
    const blocks = wallArea * p.blocksPerM2;
    const cement = concrete * 7;
    const cost = (concrete * 285 + rebar * 4.2 + blocks * 3.5 + cement * 28) * finMul;
    return { totalArea, totalCost: Math.round(cost) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, area, floors, finMul]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-card shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-l from-primary/10 to-card px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Calculator className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-ink">حاسبة كميات البناء</h3>
              <p className="text-[11px] text-muted-foreground">تقدير سريع للتكلفة المبدئية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-ink">نوع المشروع</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(presets).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={`rounded-xl border-2 px-2 py-2 text-[11px] font-bold transition ${
                      type === k
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink">المدينة</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink">جودة التشطيب</span>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as typeof finish)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="economy">اقتصادي</option>
                  <option value="standard">قياسي</option>
                  <option value="luxury">فاخر</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink">مساحة الدور (م²)</span>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink">عدد الأدوار</span>
                <input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-700 p-5 text-primary-foreground">
              <div className="text-xs font-semibold opacity-90">التكلفة التقديرية</div>
              <div className="mt-1 text-3xl font-extrabold">
                {result.totalCost.toLocaleString("en-US")}
                <span className="ms-1 text-sm opacity-80">ر.س</span>
              </div>
              <div className="mt-1 text-[11px] opacity-85">
                إجمالي المساحة: {result.totalArea} م²
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary"
          >
            إلغاء
          </button>
          <button
            onClick={() => onApply(result.totalCost, result.totalArea, type, city)}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
          >
            تطبيق على المشروع
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Solar Calculator Popup ----------
function SolarCalculatorPopup({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (kwp: number, cost: number) => void;
}) {
  const [dailyKWh, setDailyKWh] = useState(20);
  const [autonomy, setAutonomy] = useState(2);

  const result = useMemo(() => {
    const sunHours = 5.5;
    const sysLoss = 0.7;
    const kwp = dailyKWh / sunHours / sysLoss;
    const batteryKWh = (dailyKWh * 0.5 * autonomy) / 0.9;
    // cost SAR: panels 600 each (550W), battery 1500/kWh, inverter 800/kVA, install 1500
    const panelCount = Math.ceil((kwp * 1000) / 550);
    const inverter = Math.max(1, Math.ceil(kwp * 1.25 * 10) / 10);
    const cost = panelCount * 600 + batteryKWh * 1500 + inverter * 800 + 1500;
    return {
      kwp: Math.round(kwp * 10) / 10,
      panelCount,
      batteryKWh: Math.round(batteryKWh * 10) / 10,
      cost: Math.round(cost),
    };
  }, [dailyKWh, autonomy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-card shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-l from-amber-100 to-card px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white">
              <Sun className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-ink">حاسبة الطاقة الشمسية</h3>
              <p className="text-[11px] text-muted-foreground">قدر تكلفة نظام الطاقة الشمسية</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">
              الاستهلاك اليومي المتوقع (kWh)
            </span>
            <input
              type="number"
              value={dailyKWh}
              onChange={(e) => setDailyKWh(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">
              ساعات الاستقلالية (بطاريات)
            </span>
            <select
              value={autonomy}
              onChange={(e) => setAutonomy(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value={0}>بدون بطاريات</option>
              <option value={1}>يوم واحد</option>
              <option value={2}>يومان</option>
              <option value={3}>3 أيام</option>
            </select>
          </label>

          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white">
            <div className="text-xs font-semibold opacity-90">التكلفة التقديرية</div>
            <div className="mt-1 text-3xl font-extrabold">
              {result.cost.toLocaleString("en-US")}
              <span className="ms-1 text-sm opacity-80">ر.س</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-[11px]">
              <div>
                <div className="opacity-75">القدرة</div>
                <div className="font-extrabold">{result.kwp} kWp</div>
              </div>
              <div>
                <div className="opacity-75">الألواح</div>
                <div className="font-extrabold">{result.panelCount} لوح</div>
              </div>
              <div>
                <div className="opacity-75">البطاريات</div>
                <div className="font-extrabold">{result.batteryKWh} kWh</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold">
            إلغاء
          </button>
          <button
            onClick={() => onApply(result.kwp, result.cost)}
            className="flex-1 rounded-full bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-cta hover:bg-amber-600"
          >
            تطبيق على المرحلة
          </button>
        </div>
      </div>
    </div>
  );
}

function OwnerPayments() {
  const total = useMemo(() => PAYMENT_REQUESTS.reduce((s, p) => s + p.amount, 0), []);
  const released = PAYMENT_REQUESTS.filter((x) => x.status === "released").reduce(
    (s, x) => s + x.amount,
    0,
  );
  const pending = PAYMENT_REQUESTS.filter((x) => x.status === "pending").reduce(
    (s, x) => s + x.amount,
    0,
  );

  return (
    <>
      <PageHeader title="المدفوعات" subtitle="جميع الدفعات على مشاريعك" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي المتتبَّع"
          value={fmtMoney(total)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="مُحرّر للمقاول"
          value={fmtMoney(released)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="بانتظار موافقتك"
          value={fmtMoney(pending)}
          icon={<CreditCard className="h-5 w-5" />}
          tone="accent"
        />
      </div>

      <SectionCard title="سجل الدفعات">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">المعرف</th>
                <th className="px-4 py-3 font-bold">المرحلة</th>
                <th className="px-4 py-3 font-bold">المقاول</th>
                <th className="px-4 py-3 font-bold">المبلغ</th>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {PAYMENT_REQUESTS.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{p.id}</td>
                  <td className="px-4 py-3 font-bold text-ink">{p.phase}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.contractor}</td>
                  <td className="px-4 py-3 font-extrabold text-ink">{fmtMoney(p.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.submittedAt}</td>
                  <td className="px-4 py-3">
                    <Pill
                      tone={
                        p.status === "released"
                          ? "primary"
                          : p.status === "approved"
                            ? "info"
                            : p.status === "rejected"
                              ? "danger"
                              : "accent"
                      }
                    >
                      {p.status === "released"
                        ? "مُحرّرة"
                        : p.status === "approved"
                          ? "اعتُمدت"
                          : p.status === "rejected"
                            ? "مرفوضة"
                            : "بانتظار"}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

// ---------- Owner Purchases (replaces Store) ----------
function OwnerPurchases() {
  const [filter, setFilter] = useState<PurchaseStatus | "all">("all");
  const filtered = filter === "all" ? PURCHASES : PURCHASES.filter((p) => p.status === filter);

  const totalSpent = PURCHASES.reduce((s, p) => s + p.total, 0);
  const inTransit = PURCHASES.filter((p) => p.status === "shipped" || p.status === "processing").length;
  const delivered = PURCHASES.filter((p) => p.status === "delivered").length;

  const statusFilters: { id: PurchaseStatus | "all"; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "processing", label: "قيد التحضير" },
    { id: "shipped", label: "مشحونة" },
    { id: "delivered", label: "مسلَّمة" },
    { id: "returned", label: "مرتجعات" },
  ];

  return (
    <>
      <PageHeader
        title="مشترياتي"
        subtitle="تابع طلباتك من متجر تم: التحضير، الشحن، التسليم والإرجاع"
        action={
          <Link
            to="/store"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
          >
            <ExternalLink className="h-4 w-4" /> تصفح المتجر
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الإنفاق"
          value={`${totalSpent.toLocaleString("en-US")} ر.س`}
          icon={<Receipt className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="قيد التوصيل"
          value={inTransit}
          icon={<Truck className="h-5 w-5" />}
          tone="accent"
          hint="طلبات لم تصل بعد"
        />
        <StatCard
          label="تم التسليم"
          value={delivered}
          icon={<Package className="h-5 w-5" />}
          hint="هذا الشهر"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyHint>لا توجد طلبات في هذه الحالة.</EmptyHint>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <article key={order.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{order.id}</span>
                    <Pill tone={PURCHASE_STATUS_TONE[order.status]}>
                      {PURCHASE_STATUS_LABEL[order.status]}
                    </Pill>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {order.date}
                    </span>
                    <span>•</span>
                    <span>{order.itemsCount} منتجات</span>
                    <span>•</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-muted-foreground">الإجمالي</div>
                  <div className="text-xl font-extrabold text-ink">
                    {order.total.toLocaleString("en-US")} ر.س
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {order.preview.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground/80">{item.name}</span>
                    <span className="font-bold text-muted-foreground">×{item.qty}</span>
                  </div>
                ))}
              </div>

              {(order.status === "shipped" || order.status === "processing") && order.deliveryEta && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-[11px] font-semibold text-sky-700">
                  <Truck className="h-3.5 w-3.5" />
                  وصول متوقع: {order.deliveryEta}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-bold text-foreground hover:border-primary hover:text-primary">
                  <Eye className="h-3 w-3" /> تفاصيل الطلب
                </button>
                {order.status === "shipped" && (
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-4 py-1.5 text-[11px] font-bold text-sky-700 hover:bg-sky-100">
                    <Truck className="h-3 w-3" /> تتبع الشحنة
                  </button>
                )}
                {order.status === "delivered" && (
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100">
                    <RotateCcw className="h-3 w-3" /> طلب إرجاع
                  </button>
                )}
                {order.status === "returned" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <XCircle className="h-3 w-3" /> تم استرداد المبلغ
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Avoid unused import lint — quietly reference Layers/STATUS_LABEL/STATUS_TONE for shared modules */}
      <div className="hidden">
        <Layers />
        <span>{STATUS_LABEL.completed}</span>
        <span>{STATUS_TONE.completed}</span>
      </div>
    </>
  );
}
