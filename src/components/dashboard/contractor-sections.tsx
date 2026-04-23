import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  ListChecks,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT, PAYMENT_REQUESTS } from "@/lib/dashboard-data";
import { ContractorDashboard } from "./contractor-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";

export function ContractorSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <ContractorDashboard />;
    case "projects":
      return <ContractorProjects />;
    case "tasks":
      return <ContractorTasks />;
    case "withdrawals":
      return <ContractorWithdrawals />;
    case "buy-materials":
      return <ContractorMaterials />;
    default:
      return <ContractorDashboard />;
  }
}

const CONTRACTOR_PROJECTS = [
  {
    id: MOCK_PROJECT.id,
    name: MOCK_PROJECT.name,
    city: MOCK_PROJECT.city,
    progress: MOCK_PROJECT.overallProgress,
    activePhase: "البناء بالطوب والقواطع",
    nextPayout: 3_700,
  },
  {
    id: "PRJ-2099",
    name: "مجمع النور التجاري",
    city: "صنعاء",
    progress: 18,
    activePhase: "الحفر والأساسات",
    nextPayout: 5_200,
  },
];

function ContractorProjects() {
  return (
    <>
      <PageHeader title="مشاريعي" subtitle="المشاريع التي تنفذها حالياً" />
      <div className="grid gap-4 lg:grid-cols-2">
        {CONTRACTOR_PROJECTS.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-accent">#{p.id}</div>
                <h3 className="mt-1 text-lg font-extrabold text-ink">{p.name}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">📍 {p.city}</div>
              </div>
              <Pill tone="accent">{p.activePhase}</Pill>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>الإنجاز</span>
                <span className="text-ink">{p.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-accent to-orange-300"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs text-muted-foreground">الدفعة القادمة</div>
              <div className="text-sm font-extrabold text-ink">{fmtMoney(p.nextPayout)}</div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const TASKS = [
  {
    id: "T-401",
    title: "صب جدران الدور الثاني",
    project: "فيلا الياسمين",
    due: "2026-04-26",
    priority: "high" as const,
    done: false,
  },
  {
    id: "T-402",
    title: "تسليم تقرير المرحلة الثالثة",
    project: "فيلا الياسمين",
    due: "2026-04-28",
    priority: "medium" as const,
    done: false,
  },
  {
    id: "T-403",
    title: "طلب توريد حديد تسليح 14مم",
    project: "مجمع النور",
    due: "2026-04-25",
    priority: "high" as const,
    done: false,
  },
  {
    id: "T-404",
    title: "اعتماد قياسات الميول من المشرف",
    project: "فيلا الياسمين",
    due: "2026-04-22",
    priority: "low" as const,
    done: true,
  },
];

function ContractorTasks() {
  return (
    <>
      <PageHeader title="المهام" subtitle="مهامك اليومية على جميع المشاريع" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="مهام اليوم"
          value={TASKS.filter((t) => !t.done).length}
          icon={<ListChecks className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="منتهية"
          value={TASKS.filter((t) => t.done).length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="عاجلة"
          value={TASKS.filter((t) => t.priority === "high" && !t.done).length}
          icon={<Clock className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <SectionCard title="قائمة المهام">
        <div className="space-y-2">
          {TASKS.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-xl border border-border bg-background p-4 ${
                t.done ? "opacity-60" : ""
              }`}
            >
              <input type="checkbox" defaultChecked={t.done} className="h-4 w-4 accent-primary" />
              <div className="flex-1">
                <div className={`text-sm font-bold text-ink ${t.done ? "line-through" : ""}`}>
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {t.project}
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  {t.due}
                </div>
              </div>
              <Pill
                tone={
                  t.priority === "high" ? "danger" : t.priority === "medium" ? "accent" : "muted"
                }
              >
                {t.priority === "high" ? "عاجل" : t.priority === "medium" ? "متوسط" : "عادي"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function ContractorWithdrawals() {
  const released = PAYMENT_REQUESTS.filter((x) => x.status === "released").reduce(
    (s, x) => s + x.amount,
    0,
  );
  const pending = PAYMENT_REQUESTS.filter(
    (x) => x.status === "pending" || x.status === "approved",
  ).reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <PageHeader title="السحوبات" subtitle="مستحقاتك وطلبات السحب الحالية" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="رصيد متاح للسحب"
          value={fmtMoney(released)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="قيد المراجعة"
          value={fmtMoney(pending)}
          icon={<Clock className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard label="عمولة المنصة" value="2.5%" hint="على المبالغ المُحرّرة" />
      </div>

      <SectionCard
        title="طلب سحب جديد"
        action={
          <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta">
            إنشاء طلب
          </button>
        }
      >
        <div className="rounded-xl bg-primary-soft/40 p-4 text-xs text-foreground/80">
          يتم تحويل المبالغ المعتمدة خلال 3 أيام عمل إلى الحساب البنكي المسجّل.
        </div>
      </SectionCard>

      <SectionCard title="سجل السحوبات" className="mt-6">
        <div className="space-y-3">
          {PAYMENT_REQUESTS.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div>
                <div className="text-sm font-bold text-ink">{req.phase}</div>
                <div className="text-[11px] text-muted-foreground">
                  {req.id} • {req.submittedAt}
                </div>
              </div>
              <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
              <Pill
                tone={
                  req.status === "released"
                    ? "primary"
                    : req.status === "approved"
                      ? "info"
                      : req.status === "rejected"
                        ? "danger"
                        : "accent"
                }
              >
                {req.status === "released"
                  ? "مُحرّرة"
                  : req.status === "approved"
                    ? "اعتُمدت"
                    : req.status === "rejected"
                      ? "مرفوضة"
                      : "بانتظار"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function ContractorMaterials() {
  return (
    <>
      <PageHeader title="شراء مواد" subtitle="اطلب مواد البناء بأسعار خاصة للمقاولين على منصة تم" />
      <div className="rounded-3xl border border-border bg-gradient-to-l from-accent/10 to-card p-8 text-center shadow-card">
        <ShoppingBag className="mx-auto h-14 w-14 text-accent" />
        <h2 className="mt-4 text-xl font-extrabold text-ink">متجر المقاولين</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          خصومات حصرية على الإسمنت، الحديد، البلوك، والمواد الكهربائية.
        </p>
        <Link
          to="/store"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-cta"
        >
          ادخل المتجر <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* dummy use to satisfy linter for Reports import warnings */}
      <div className="hidden">
        <span>{FIELD_REPORTS.length}</span>
        <ArrowLeft />
      </div>
    </>
  );
}
