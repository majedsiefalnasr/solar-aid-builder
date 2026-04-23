import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Folder,
  HardHat,
  MapPin,
  PlusCircle,
  Search,
  Sparkles,
  Store as StoreIcon,
  Wallet,
} from "lucide-react";
import { MOCK_PROJECT, PAYMENT_REQUESTS, STATUS_LABEL, STATUS_TONE } from "@/lib/dashboard-data";
import { CITIES } from "@/lib/calculator";
import { OwnerDashboard } from "./owner-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";

export function OwnerSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <OwnerDashboard />;
    case "projects":
      return <OwnerProjects />;
    case "new-project":
      return <OwnerNewProject />;
    case "payments":
      return <OwnerPayments />;
    case "store":
      return <OwnerStoreShortcut />;
    default:
      return <OwnerDashboard />;
  }
}

const MY_PROJECTS = [
  {
    ...MOCK_PROJECT,
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
    phases: [],
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
    phases: [],
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
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
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
                search={{ role: "owner", section: "overview" }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                فتح المشروع <ArrowLeft className="h-3 w-3" />
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tamm_new_project_prefill");
      if (raw) {
        const data: PrefillData = JSON.parse(raw);
        setPrefill(data);
        if (data.city) setCity(data.city);
        if (data.projectType) setType(data.projectType);
        if (data.estimatedCost) setBudget(Math.round(data.estimatedCost / 1000));
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
              defaultValue={prefill?.totalArea ?? ""}
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

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
        >
          إرسال الطلب
          <ArrowLeft className="h-4 w-4" />
        </button>
      </form>
    </>
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

function OwnerStoreShortcut() {
  return (
    <>
      <PageHeader title="المتجر" subtitle="تصفح مواد البناء وأدوات الطاقة بأفضل الأسعار" />
      <div className="rounded-3xl border border-border bg-gradient-to-l from-primary/10 to-card p-8 text-center shadow-card">
        <StoreIcon className="mx-auto h-14 w-14 text-primary" />
        <h2 className="mt-4 text-xl font-extrabold text-ink">متجر تم</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ادخل إلى متجر تم لتصفح آلاف المنتجات من مواد البناء، الكهرباء، السباكة، وأدوات الطاقة
          الشمسية.
        </p>
        <Link
          to="/store"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta"
        >
          فتح المتجر <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
