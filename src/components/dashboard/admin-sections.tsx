import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  Eye,
  Folder,
  Image as ImageIcon,
  Landmark,
  MessageCircle,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShoppingBag,
  Store as StoreIcon,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wallet,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import { DISPUTES, MOCK_PROJECT, PAYMENT_REQUESTS, PLATFORM_STATS } from "@/lib/dashboard-data";
import { AdminDashboard } from "./admin-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectDetail } from "./project-detail";
import { AreaChart, BarChart, DonutChart, Sparkline } from "./charts";

export function AdminSection({
  section,
  projectId,
  categoryId,
  orderId,
}: {
  section: string;
  projectId?: string;
  categoryId?: string;
  orderId?: string;
}) {
  switch (section) {
    case "overview":
      return <AdminDashboard />;
    case "projects":
      return <AdminProjects />;
    case "project-detail":
      return <ProjectDetail role="admin" projectId={projectId} />;
    case "assignments":
      return <AdminAssignments />;
    case "payments":
      return <AdminPayments />;
    case "users":
      return <AdminUsers />;
    case "workflow":
      return <AdminWorkflow />;
    case "finance":
      return <AdminFinance />;
    case "store":
      return <AdminStore />;
    case "products":
      return <AdminProducts />;
    case "categories":
      return <AdminCategories />;
    case "category-detail":
      return <AdminCategoryDetail categoryId={categoryId} />;
    case "orders":
      return <AdminOrders />;
    case "order-detail":
      return <AdminOrderDetail orderId={orderId} />;
    default:
      return <AdminDashboard />;
  }
}

// =============================================================
// Projects (clickable rows -> project detail)
// =============================================================

const PROJECTS_LIST = [
  {
    id: MOCK_PROJECT.id,
    name: MOCK_PROJECT.name,
    city: MOCK_PROJECT.city,
    owner: MOCK_PROJECT.owner,
    status: "active" as const,
    progress: 42,
    startedAt: "2026-01-12",
    daysAgo: 102,
  },
  {
    id: "PRJ-2055",
    name: "شقة المعلا",
    city: "عدن",
    owner: "فهد المنصور",
    status: "active" as const,
    progress: 28,
    startedAt: "2026-03-04",
    daysAgo: 50,
  },
  {
    id: "PRJ-2068",
    name: "محل تجاري — حي السلام",
    city: "تعز",
    owner: "خالد العبسي",
    status: "pending" as const,
    progress: 0,
    startedAt: "2026-04-19",
    daysAgo: 4,
  },
  {
    id: "PRJ-2099",
    name: "مجمع النور التجاري",
    city: "صنعاء",
    owner: "ريم السقاف",
    status: "active" as const,
    progress: 18,
    startedAt: "2026-04-01",
    daysAgo: 22,
  },
  {
    id: "PRJ-1988",
    name: "فيلا الصافي",
    city: "صنعاء",
    owner: "م. صالح القاسمي",
    status: "completed" as const,
    progress: 100,
    startedAt: "2025-08-12",
    daysAgo: 254,
  },
  {
    id: "PRJ-1820",
    name: "شقة كريتر",
    city: "عدن",
    owner: "ليلى السقاف",
    status: "completed" as const,
    progress: 100,
    startedAt: "2025-04-22",
    daysAgo: 366,
  },
];

const PERIOD_FILTERS = [
  { k: "all", label: "كل الفترات", days: Infinity },
  { k: "7d", label: "آخر 7 أيام", days: 7 },
  { k: "30d", label: "آخر 30 يوم", days: 30 },
  { k: "90d", label: "آخر 3 أشهر", days: 90 },
  { k: "1y", label: "آخر سنة", days: 365 },
] as const;

function AdminProjects() {
  const [period, setPeriod] = useState<typeof PERIOD_FILTERS[number]["k"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "completed">("all");

  const filtered = useMemo(() => {
    const days = PERIOD_FILTERS.find((p) => p.k === period)?.days ?? Infinity;
    return PROJECTS_LIST.filter(
      (p) => p.daysAgo <= days && (statusFilter === "all" || p.status === statusFilter),
    );
  }, [period, statusFilter]);

  return (
    <>
      <PageHeader
        title="المشاريع"
        subtitle={`${PLATFORM_STATS.activeProjects} مشروع نشط على المنصة — اضغط على أي مشروع لفتح التفاصيل`}
      />

      <SectionCard
        title="جميع المشاريع"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-bold focus:border-primary focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="pending">بانتظار</option>
              <option value="completed">مكتمل</option>
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-bold focus:border-primary focus:outline-none"
            >
              {PERIOD_FILTERS.map((p) => (
                <option key={p.k} value={p.k}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            لا توجد مشاريع ضمن هذه المعايير.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-right text-sm">
              <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">المعرف</th>
                  <th className="px-4 py-3 font-bold">المشروع</th>
                  <th className="px-4 py-3 font-bold">المدينة</th>
                  <th className="px-4 py-3 font-bold">المالك</th>
                  <th className="px-4 py-3 font-bold">تاريخ البدء</th>
                  <th className="px-4 py-3 font-bold">الإنجاز</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                  <th className="px-4 py-3 font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{p.id}</td>
                    <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.startedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill
                        tone={
                          p.status === "active" ? "primary" : p.status === "completed" ? "info" : "accent"
                        }
                      >
                        {p.status === "active" ? "نشط" : p.status === "completed" ? "مكتمل" : "بانتظار"}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard"
                        search={{
                          role: "admin",
                          section: "project-detail",
                          projectId: p.id,
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Eye className="h-3 w-3" /> عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}

// =============================================================
// Assignments (matches mockup: pending project + engineer picker)
// =============================================================

interface PendingProject {
  id: string;
  name: string;
  city: string;
  client: string;
  date: string;
  area: string;
  type: string;
  budget: string;
}

const PENDING_PROJECTS: PendingProject[] = [
  {
    id: "PRJ-3001",
    name: "فيلا سكنية - تعز",
    city: "تعز",
    client: "نشوان صادق",
    date: "2026-04-01",
    area: "غير محدد م²",
    type: "غير محدد",
    budget: "غير محدد",
  },
  {
    id: "PRJ-3002",
    name: "شقة سكنية - عدن",
    city: "عدن",
    client: "محمد ياسين",
    date: "2026-04-12",
    area: "180 م²",
    type: "سكني",
    budget: "12,000K ر.س",
  },
  {
    id: "PRJ-3003",
    name: "مجمع تجاري - صنعاء",
    city: "صنعاء",
    client: "شركة المنال",
    date: "2026-04-15",
    area: "1,200 م²",
    type: "تجاري",
    budget: "85,000K ر.س",
  },
  {
    id: "PRJ-3004",
    name: "مستودع صناعي - الحديدة",
    city: "الحديدة",
    client: "أحمد المخلافي",
    date: "2026-04-18",
    area: "2,400 م²",
    type: "صناعي",
    budget: "62,000K ر.س",
  },
  {
    id: "PRJ-3005",
    name: "فيلا فاخرة - عدن",
    city: "عدن",
    client: "سالم باعلوي",
    date: "2026-04-20",
    area: "520 م²",
    type: "سكني",
    budget: "38,000K ر.س",
  },
];

interface Engineer {
  id: string;
  name: string;
  active: number;
}

const ENGINEERS: Engineer[] = [
  { id: "E1", name: "م. خالد الأهدل", active: 3 },
  { id: "E2", name: "م. محمد الرشيدي", active: 5 },
  { id: "E3", name: "م. نبيل الصنوي", active: 3 },
  { id: "E4", name: "م. عادل العميسي", active: 5 },
  { id: "E5", name: "م. أنس الحديدي", active: 3 },
  { id: "E6", name: "م. طارق السقاف", active: 5 },
];

function AdminAssignments() {
  const [projects, setProjects] = useState<PendingProject[]>(PENDING_PROJECTS);
  const [activeId, setActiveId] = useState<string>(PENDING_PROJECTS[0].id);
  const [selectedEngineer, setSelectedEngineer] = useState<string>("");

  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  const assign = () => {
    if (!selectedEngineer) {
      toast.error("يرجى اختيار مهندس مشرف أولاً");
      return;
    }
    const eng = ENGINEERS.find((e) => e.id === selectedEngineer);
    toast.success("تم إرسال طلب التعيين", {
      description: `تم تعيين ${eng?.name} للمشروع ${active.name}`,
    });
    setProjects((prev) => prev.filter((p) => p.id !== active.id));
    setSelectedEngineer("");
    const next = projects.find((p) => p.id !== active.id);
    if (next) setActiveId(next.id);
  };

  const reject = () => {
    toast("تم رفض المشروع", { description: `${active.name} — تم إعلام صاحب المشروع.` });
    setProjects((prev) => prev.filter((p) => p.id !== active.id));
    setSelectedEngineer("");
  };

  if (projects.length === 0) {
    return (
      <>
        <PageHeader title="طلبات تعيين المهندسين" subtitle="مطابقة المهندسين بالمشاريع المناسبة" />
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-sm font-bold text-ink">لا توجد طلبات تعيين بانتظارك حالياً</p>
          <p className="mt-1 text-xs text-muted-foreground">جميع المشاريع تم تعيين مشرف لها.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="طلبات تعيين المهندسين"
        subtitle={`${projects.length} مشاريع بانتظار تعيين مشرف — اختر مشروعاً من القائمة`}
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Pending projects list (left) */}
        <SectionCard title={`المشاريع المعلّقة (${projects.length})`}>
          <div className="space-y-2">
            {projects.map((p) => {
              const isActive = p.id === active.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveId(p.id);
                    setSelectedEngineer("");
                  }}
                  className={`group w-full rounded-2xl border p-3 text-right transition ${
                    isActive
                      ? "border-primary bg-primary-soft shadow-cta"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          #{p.id}
                        </span>
                        <Pill tone={isActive ? "primary" : "accent"}>{p.city}</Pill>
                      </div>
                      <div className="mt-1 truncate text-sm font-extrabold text-ink">{p.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {p.client} • {p.date}
                      </div>
                    </div>
                    {isActive && (
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Active project + engineer assignment */}
        <div className="space-y-4">
          <SectionCard title="تفاصيل المشروع المختار">
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-ink">{active.name}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">العميل: {active.client}</div>
                  <div className="text-xs text-muted-foreground">تاريخ الطلب: {active.date}</div>
                </div>
                <Pill tone="accent">بانتظار التعيين</Pill>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/40 p-3 text-right">
                  <div className="text-[10px] text-muted-foreground">المساحة</div>
                  <div className="mt-1 text-sm font-extrabold text-ink">{active.area}</div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-right">
                  <div className="text-[10px] text-muted-foreground">النوع</div>
                  <div className="mt-1 text-sm font-extrabold text-ink">{active.type}</div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-right">
                  <div className="text-[10px] text-muted-foreground">الميزانية المتوقعة</div>
                  <div className="mt-1 text-sm font-extrabold text-ink">{active.budget}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-xs font-bold text-ink">اختيار مهندس مشرف:</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ENGINEERS.map((e) => {
                    const checked = selectedEngineer === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setSelectedEngineer(e.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${
                          checked
                            ? "border-primary bg-primary-soft shadow-cta"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            checked ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-extrabold text-ink">{e.name}</div>
                          <div className="text-[10px] text-muted-foreground">{e.active} مشاريع حالية</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={assign}
                  className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-cta hover:bg-primary/95"
                >
                  تعيين وإرسال طلب
                </button>
                <button
                  onClick={reject}
                  className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
                >
                  رفض المشروع
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

// =============================================================
// Payments
// =============================================================

const PAYMENTS_TREND = [
  { label: "نوفمبر", value: 180 },
  { label: "ديسمبر", value: 230 },
  { label: "يناير", value: 200 },
  { label: "فبراير", value: 280 },
  { label: "مارس", value: 320 },
  { label: "أبريل", value: 410 },
];

function AdminPayments() {
  const total = PAYMENT_REQUESTS.reduce((s, x) => s + x.amount, 0);
  return (
    <>
      <PageHeader title="المدفوعات" subtitle="جميع الدفعات المتتبَّعة على المنصة" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي المتتبَّع"
          value={fmtMoney(PLATFORM_STATS.totalTracked)}
          icon={<Coins className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="مُحرّر هذا الشهر"
          value={fmtMoney(total)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard label="عمولة المنصة" value="2.5%" icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <SectionCard
        title="حركة الدفعات الشهرية"
        subtitle="إجمالي المبالغ المُحرّرة خلال آخر 6 أشهر (بآلاف الريالات)"
        className="mb-6"
      >
        <AreaChart
          data={PAYMENTS_TREND}
          tone="primary"
          formatValue={(v) => fmtMoney(v)}
        />
      </SectionCard>

      <SectionCard title="آخر الحركات">
        <div className="space-y-3">
          {PAYMENT_REQUESTS.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div>
                <div className="text-sm font-bold text-ink">{p.phase}</div>
                <div className="text-[11px] text-muted-foreground">
                  {p.contractor} • {p.submittedAt}
                </div>
              </div>
              <div className="text-base font-extrabold text-ink">{fmtMoney(p.amount)}</div>
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
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

// =============================================================
// Users
// =============================================================

const USERS = [
  { name: "م. أحمد الشامي", role: "صاحب مشروع", joined: "2026-01-12", status: "active" },
  { name: "شركة البناء المتقن", role: "مقاول", joined: "2025-11-08", status: "active" },
  { name: "م. ليلى العمراني", role: "مهندس مشرف", joined: "2025-09-22", status: "active" },
  { name: "م. سامي الحاج", role: "مهندس ميداني", joined: "2026-02-04", status: "active" },
  { name: "فهد المنصور", role: "صاحب مشروع", joined: "2026-04-19", status: "pending" },
];

function AdminUsers() {
  const [users, setUsers] = useState(USERS);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleInvite = (data: { name: string; email: string; role: string }) => {
    setUsers((prev) => [
      { name: data.name, role: data.role, joined: new Date().toISOString().slice(0, 10), status: "pending" },
      ...prev,
    ]);
    setInviteOpen(false);
    toast.success("تم إرسال الدعوة بنجاح", {
      description: `${data.email} • ${data.role}`,
    });
  };

  return (
    <>
      <PageHeader
        title="المستخدمون"
        subtitle={`${PLATFORM_STATS.contractors}+ مستخدم مسجّل`}
        action={
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            <UserPlus className="h-3.5 w-3.5" /> دعوة مستخدم
          </button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="توزيع المستخدمين">
          <DonutChart
            size={160}
            centerLabel="إجمالي"
            centerValue={String(PLATFORM_STATS.contractors)}
            data={[
              { label: "أصحاب مشاريع", value: 142, tone: "primary" },
              { label: "مقاولون", value: 86, tone: "accent" },
              { label: "مهندسون مشرفون", value: 48, tone: "info" },
              { label: "مهندسون ميدانيون", value: 36, tone: "danger" },
            ]}
          />
        </SectionCard>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <SectionCard title="تسجيلات هذا الأسبوع">
            <div className="text-3xl font-extrabold text-ink">+24</div>
            <div className="mt-1 text-[11px] text-muted-foreground">مقارنة بـ +18 الأسبوع الماضي</div>
            <div className="mt-3"><Sparkline values={[8, 12, 9, 14, 10, 16, 24]} tone="primary" /></div>
          </SectionCard>
          <SectionCard title="نشاط يومي">
            <div className="text-3xl font-extrabold text-ink">312</div>
            <div className="mt-1 text-[11px] text-muted-foreground">مستخدم نشط اليوم</div>
            <div className="mt-3"><Sparkline values={[120, 180, 150, 240, 210, 280, 312]} tone="accent" /></div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="قاعدة المستخدمين">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">الاسم</th>
                <th className="px-4 py-3 font-bold">الدور</th>
                <th className="px-4 py-3 font-bold">تاريخ الانضمام</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {users.map((u) => (
                <tr key={u.name}>
                  <td className="px-4 py-3 font-bold text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3">
                    <Pill tone={u.status === "active" ? "primary" : "accent"}>
                      {u.status === "active" ? "نشط" : "بانتظار التحقق"}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toast(`عرض ملف ${u.name}`, { description: u.role })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="hidden">
        <Users />
      </div>

      {inviteOpen && <InviteUserDialog onClose={() => setInviteOpen(false)} onInvite={handleInvite} />}
    </>
  );
}

function InviteUserDialog({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (data: { name: string; email: string; role: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("صاحب مشروع");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("يرجى إدخال الاسم والبريد الإلكتروني");
      return;
    }
    onInvite({ name: name.trim(), email: email.trim(), role });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">دعوة مستخدم جديد</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">الاسم الكامل</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: م. خالد العمري"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">البريد الإلكتروني</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">الدور</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option>صاحب مشروع</option>
              <option>مقاول</option>
              <option>مهندس مشرف</option>
              <option>مهندس ميداني</option>
              <option>مدير منصة</option>
            </select>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              إرسال الدعوة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// Workflow
// =============================================================

const WORKFLOW_STAGES = [
  { id: 1, name: "استلام طلب المشروع", auto: true },
  { id: 2, name: "تعيين مهندس مشرف", auto: false },
  { id: 3, name: "ترشيح المقاولين", auto: true },
  { id: 4, name: "اعتماد المقاول", auto: false },
  { id: 5, name: "تقسيم المراحل المالية", auto: false },
  { id: 6, name: "بدء التنفيذ", auto: true },
];

function AdminWorkflow() {
  const [stages, setStages] = useState(WORKFLOW_STAGES);
  const [commission, setCommission] = useState(2.5);
  const [holdDays, setHoldDays] = useState(3);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const tid = toast.loading("جارٍ حفظ التغييرات…");
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("تم حفظ إعدادات سير العمل بنجاح", {
      id: tid,
      description: `${stages.filter((s) => s.auto).length} خطوة تلقائية • عمولة ${commission}% • تجميد ${holdDays} أيام`,
    });
  };

  const toggle = (id: number) =>
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, auto: !s.auto } : s)));

  return (
    <>
      <PageHeader
        title="إعدادات سير العمل"
        subtitle="تحكم في خطوات إنشاء المشروع والاعتمادات"
        action={
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
          </button>
        }
      />
      <SectionCard title="خطوات دورة حياة المشروع">
        <div className="space-y-3">
          {stages.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-extrabold text-primary">
                  {s.id}
                </span>
                <span className="text-sm font-bold text-ink">{s.name}</span>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">تلقائي</span>
                <input
                  type="checkbox"
                  checked={s.auto}
                  onChange={() => toggle(s.id)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="حدود مالية" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">عمولة المنصة (%)</span>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              step={0.5}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">مدة تجميد الدفعة (أيام)</span>
            <input
              type="number"
              value={holdDays}
              onChange={(e) => setHoldDays(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>
        <div className="hidden">
          <Settings2 />
          <Workflow />
        </div>
      </SectionCard>
    </>
  );
}

// =============================================================
// Finance (with charts)
// =============================================================

const REVENUE_MONTHS = [
  { label: "مايو", value: 132 },
  { label: "يونيو", value: 158 },
  { label: "يوليو", value: 142 },
  { label: "أغسطس", value: 178 },
  { label: "سبتمبر", value: 168 },
  { label: "أكتوبر", value: 192 },
  { label: "نوفمبر", value: 184 },
  { label: "ديسمبر", value: 215 },
  { label: "يناير", value: 198 },
  { label: "فبراير", value: 232 },
  { label: "مارس", value: 248 },
  { label: "أبريل", value: 268 },
];

interface Withdrawal {
  id: string;
  contractor: string;
  contractorOrg: string;
  project: string;
  amount: number; // SAR
  bank: string;
  iban: string;
  status: "pending" | "completed";
}

const WITHDRAWALS_SEED: Withdrawal[] = [
  {
    id: "WTH-1001",
    contractor: "مؤسسة الأهدل للمقاولات",
    contractorOrg: "مؤسسة الأهدل للمقاولات",
    project: "فيلا سكنية - تعز",
    amount: 300_000,
    bank: "بنك الكريمي الإسلامي",
    iban: "YE12 0000 0000 0000 0000 0000",
    status: "pending",
  },
  {
    id: "WTH-1002",
    contractor: "شركة القميري الإنشائية",
    contractorOrg: "شركة القميري الإنشائية",
    project: "شقة سكنية - عدن",
    amount: 150_000,
    bank: "بنك عدن الأول",
    iban: "YE34 1111 2222 3333 4444 5555",
    status: "completed",
  },
  {
    id: "WTH-1003",
    contractor: "شركة البناء المتقن",
    contractorOrg: "شركة البناء المتقن",
    project: "مجمع النور التجاري",
    amount: 425_000,
    bank: "بنك التضامن الإسلامي",
    iban: "YE99 8888 7777 6666 5555 4444",
    status: "pending",
  },
];

function AdminFinance() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(WITHDRAWALS_SEED);
  const [transferTarget, setTransferTarget] = useState<Withdrawal | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Withdrawal | null>(null);

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const pendingTotal = withdrawals.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0);

  const confirmTransfer = (id: string, ref: string) => {
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: "completed" } : w)));
    setTransferTarget(null);
    toast.success("تم تنفيذ التحويل البنكي", {
      description: `رقم المرجع: ${ref}`,
    });
  };

  return (
    <>
      <PageHeader title="الإدارة المالية" subtitle="الرصيد، المستحقات، وطلبات التحويل البنكية" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Available balance — accent green card per mockup */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-card">
          <div className="text-xs font-semibold opacity-90">الرصيد المتاح</div>
          <div className="mt-2 text-3xl font-extrabold">2,450,000 ر.س</div>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold opacity-95">
            <ArrowUpRight className="h-3 w-3" /> +12% عن الشهر الماضي
          </div>
        </div>

        <StatCard
          label="مستحقات المقاولين"
          value="850,000 ر.س"
          hint={`${pendingCount} طلبات بانتظار الاعتماد`}
          icon={<Wallet className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="مصروفات الشهر"
          value="1,200,000 ر.س"
          hint="شهر أبريل 2026"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <SectionCard
        title="طلبات السحب والتحويلات البنكية"
        subtitle={`${pendingTotal.toLocaleString()} ر.س بانتظار التحويل`}
        className="mb-6"
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">المقاول</th>
                <th className="px-4 py-3 font-bold">المشروع</th>
                <th className="px-4 py-3 font-bold">المبلغ</th>
                <th className="px-4 py-3 font-bold">البنك</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="text-sm font-extrabold text-ink">{w.contractor}</div>
                    <div className="text-[11px] text-muted-foreground">{w.contractorOrg}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{w.project}</td>
                  <td className="px-4 py-3 font-extrabold text-ink">{w.amount.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.bank}</td>
                  <td className="px-4 py-3">
                    <Pill tone={w.status === "completed" ? "primary" : "accent"}>
                      {w.status === "completed" ? "تم التحويل" : "بانتظار التحويل"}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    {w.status === "pending" ? (
                      <button
                        onClick={() => setTransferTarget(w)}
                        className="rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-bold text-white shadow-cta hover:bg-emerald-600"
                      >
                        تنفيذ التحويل
                      </button>
                    ) : (
                      <button
                        onClick={() => setDetailsTarget(w)}
                        className="rounded-full border border-border px-4 py-1.5 text-[11px] font-bold text-primary hover:border-primary hover:bg-primary-soft"
                      >
                        عرض التفاصيل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="نشاط الإيرادات الشهري"
            subtitle="بآلاف الريالات — آخر 12 شهراً"
          >
            <AreaChart data={REVENUE_MONTHS} tone="primary" formatValue={(v) => fmtMoney(v)} />
          </SectionCard>
        </div>
        <SectionCard title="مصادر الإيرادات">
          <DonutChart
            size={160}
            centerLabel="هذا الشهر"
            centerValue={fmtMoney(212)}
            data={[
              { label: "عمولات الدفعات", value: 48, tone: "primary" },
              { label: "مبيعات المتجر", value: 85, tone: "accent" },
              { label: "اشتراكات شهرية", value: 62, tone: "info" },
              { label: "خدمات إضافية", value: 17, tone: "danger" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="مقارنة العمولات حسب الفئة">
        <BarChart
          tone="accent"
          data={[
            { label: "بناء", value: 28 },
            { label: "كهرباء", value: 12 },
            { label: "سباكة", value: 9 },
            { label: "طاقة", value: 18 },
            { label: "تشطيبات", value: 22 },
            { label: "أخرى", value: 6 },
          ]}
          formatValue={(v) => fmtMoney(v)}
        />
      </SectionCard>

      <div className="hidden">
        <Activity />
        <CreditCard />
        <Coins />
        <TrendingUp />
        <span>{DISPUTES.length}</span>
      </div>

      {transferTarget && (
        <BankTransferDialog
          withdrawal={transferTarget}
          onClose={() => setTransferTarget(null)}
          onConfirm={confirmTransfer}
        />
      )}

      {detailsTarget && (
        <WithdrawalDetailsDialog
          withdrawal={detailsTarget}
          onClose={() => setDetailsTarget(null)}
        />
      )}
    </>
  );
}

function WithdrawalDetailsDialog({
  withdrawal,
  onClose,
}: {
  withdrawal: Withdrawal;
  onClose: () => void;
}) {
  const isCompleted = withdrawal.status === "completed";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">تفاصيل التحويل البنكي</h2>
            <p className="text-xs text-muted-foreground">رقم الطلب: {withdrawal.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
            <div>
              <div className="text-[11px] font-semibold text-emerald-700">الحالة</div>
              <Pill tone={isCompleted ? "primary" : "accent"}>
                {isCompleted ? "تم التحويل بنجاح" : "بانتظار التحويل"}
              </Pill>
            </div>
            <div className="text-left">
              <div className="text-[11px] font-semibold text-emerald-700">المبلغ</div>
              <div className="text-2xl font-extrabold text-emerald-700">
                {withdrawal.amount.toLocaleString()} ر.س
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="المقاول" value={withdrawal.contractor} />
            <DetailRow label="المؤسسة" value={withdrawal.contractorOrg} />
            <DetailRow label="المشروع" value={withdrawal.project} />
            <DetailRow label="البنك" value={withdrawal.bank} />
            <div className="sm:col-span-2">
              <DetailRow label="رقم الآيبان (IBAN)" value={withdrawal.iban} mono />
            </div>
          </div>

          {isCompleted && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
              <div className="font-extrabold">تم تنفيذ التحويل البنكي بنجاح</div>
              <div className="mt-1 text-xs">سيظهر الإيصال في سجل العمليات المالية.</div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-sm font-bold hover:bg-muted"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-extrabold text-ink ${mono ? "font-mono tracking-tight" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function BankTransferDialog({
  withdrawal,
  onClose,
  onConfirm,
}: {
  withdrawal: Withdrawal;
  onClose: () => void;
  onConfirm: (id: string, ref: string) => void;
}) {
  const [ref, setRef] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) {
      toast.error("يرجى إدخال رقم مرجع العملية");
      return;
    }
    onConfirm(withdrawal.id, ref.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">تنفيذ التحويل البنكي</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink">
              <Landmark className="h-4 w-4 text-primary" /> تفاصيل المستفيد
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المقاول:</span>
                <span className="font-bold text-ink">{withdrawal.contractor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البنك:</span>
                <span className="font-bold text-ink">{withdrawal.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحساب:</span>
                <span className="font-mono text-xs font-bold text-ink">{withdrawal.iban}</span>
              </div>
              <div className="mt-2 flex items-end justify-between border-t border-sky-200 pt-3">
                <span className="text-xs text-muted-foreground">المبلغ:</span>
                <span className="text-2xl font-extrabold text-ink">{withdrawal.amount.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">رقم مرجع العملية</span>
            <input
              autoFocus
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="TRX-2026-XXX"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white shadow-cta hover:bg-emerald-600"
            >
              تأكيد التحويل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Store overview (with charts) =====

function AdminStore() {
  return (
    <>
      <PageHeader title="المتجر" subtitle="نظرة سريعة على أداء متجر تم" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="منتجات نشطة"
          value="847"
          hint="من أصل 912 منتج"
          icon={<Package className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="طلبات الشهر"
          value="1,243"
          hint="+18% عن الشهر السابق"
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="إيرادات المتجر"
          value={fmtMoney(85_400)}
          hint="متوسط 68 ر.س/طلب"
          icon={<Coins className="h-5 w-5" />}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="مبيعات آخر 7 أيام" subtitle="عدد الطلبات اليومية">
          <BarChart
            tone="primary"
            data={[
              { label: "س", value: 32 },
              { label: "ح", value: 48 },
              { label: "ن", value: 41 },
              { label: "ث", value: 56 },
              { label: "ر", value: 62 },
              { label: "خ", value: 58 },
              { label: "ج", value: 72 },
            ]}
          />
        </SectionCard>
        <SectionCard title="أكثر الفئات مبيعاً">
          <DonutChart
            size={160}
            centerLabel="فئة"
            centerValue="5"
            data={[
              { label: "مواد البناء", value: 312, tone: "primary" },
              { label: "كهرباء", value: 184, tone: "accent" },
              { label: "طاقة شمسية", value: 142, tone: "info" },
              { label: "سباكة", value: 96, tone: "danger" },
            ]}
          />
        </SectionCard>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <StoreIcon className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-lg font-extrabold text-ink">واجهة المتجر العامة</h2>
        <p className="mt-2 text-sm text-muted-foreground">عرض المتجر كما يراه العملاء</p>
        <Link
          to="/store"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
        >
          فتح المتجر <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

// =============================================================
// Products (with working "Add Product" dialog)
// =============================================================

interface ProductRow {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image?: string;
}

const SEED_PRODUCTS: ProductRow[] = [
  { id: "P-001", name: "إسمنت بورتلاندي 50كغ", category: "مواد بناء", stock: 1240, price: 28 },
  { id: "P-002", name: "حديد تسليح 12مم", category: "مواد بناء", stock: 580, price: 4.2 },
  { id: "P-003", name: "بلوك إسمنتي 20×40", category: "مواد بناء", stock: 8500, price: 3.5 },
  { id: "P-004", name: "بطارية ليثيوم 48V 100Ah", category: "طاقة", stock: 18, price: 2400 },
  { id: "P-005", name: "لوح شمسي 550W", category: "طاقة", stock: 64, price: 380 },
];

const CATEGORY_OPTIONS = ["مواد بناء", "كهرباء", "سباكة", "طاقة", "أدوات يدوية"];

function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>(SEED_PRODUCTS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setOpen(true);
  };

  const handleSave = (data: Omit<ProductRow, "id"> & { id?: string }) => {
    if (data.id) {
      setProducts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } as ProductRow : p)));
      toast.success("تم حفظ تعديلات المنتج", { description: data.name });
    } else {
      const nextId = `P-${String(products.length + 1).padStart(3, "0")}`;
      setProducts((prev) => [{ id: nextId, ...data }, ...prev]);
      toast.success("تم إضافة المنتج", { description: data.name });
    }
    setOpen(false);
  };

  const handleDelete = (p: ProductRow) => {
    if (!confirm(`حذف المنتج "${p.name}"؟`)) return;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast("تم حذف المنتج", { description: p.name });
  };

  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = products.filter((p) => p.stock < 50).length;

  return (
    <>
      <PageHeader
        title="إدارة المنتجات"
        subtitle="أضف وعدّل منتجات متجر تم"
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta"
          >
            <Plus className="h-3.5 w-3.5" /> منتج جديد
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي المنتجات"
          value={products.length}
          icon={<PackageSearch className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="قيمة المخزون"
          value={`$${totalValue.toLocaleString()}`}
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="منتجات بمخزون منخفض"
          value={lowStock}
          icon={<Activity className="h-5 w-5" />}
          tone={lowStock > 0 ? "danger" : "default"}
        />
      </div>

      <SectionCard title="المخزون الحالي">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">SKU</th>
                <th className="px-4 py-3 font-bold">المنتج</th>
                <th className="px-4 py-3 font-bold">الفئة</th>
                <th className="px-4 py-3 font-bold">المخزون</th>
                <th className="px-4 py-3 font-bold">السعر</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="font-bold text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <Pill tone={p.stock < 50 ? "danger" : "primary"}>{p.stock}</Pill>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-ink">${p.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <Pencil className="h-3 w-3" /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" /> حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {open && (
        <ProductDialog
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      )}

      <div className="hidden">
        <Folder />
      </div>
    </>
  );
}

function ProductDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: ProductRow | null;
  onClose: () => void;
  onSave: (data: Omit<ProductRow, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORY_OPTIONS[0]);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [image, setImage] = useState<string | undefined>(initial?.image);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 4 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: initial?.id, name: name.trim(), category, stock: Number(stock), price: Number(price), image });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">
            {initial ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">صورة المنتج</span>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                {image ? (
                  <img src={image} alt="معاينة" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {image ? "تغيير الصورة" : "رفع صورة"}
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="inline-flex w-fit items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> إزالة
                  </button>
                )}
                <span className="text-[10px] text-muted-foreground">PNG / JPG حتى 4 ميجابايت</span>
              </div>
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">اسم المنتج</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              placeholder="مثلاً: إسمنت بورتلاندي 50كغ"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">الفئة</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">المخزون</span>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">السعر ($)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              {initial ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// Categories (separate section + detail)
// =============================================================

interface Category {
  id: string;
  name: string;
  products: number;
  revenue: number; // SAR thousands
  trend: number[];
}

const CATEGORIES_DATA: Category[] = [
  { id: "CAT-01", name: "مواد البناء", products: 312, revenue: 142, trend: [40, 55, 48, 62, 70, 85, 92] },
  { id: "CAT-02", name: "الكهرباء", products: 184, revenue: 86, trend: [30, 38, 42, 50, 48, 56, 62] },
  { id: "CAT-03", name: "السباكة", products: 96, revenue: 48, trend: [18, 22, 20, 26, 30, 28, 34] },
  { id: "CAT-04", name: "الطاقة الشمسية", products: 142, revenue: 118, trend: [45, 52, 60, 58, 72, 80, 88] },
  { id: "CAT-05", name: "الأدوات اليدوية", products: 113, revenue: 32, trend: [12, 14, 16, 18, 22, 20, 24] },
];

interface CategoryDialogState {
  mode: "create" | "edit";
  category: Category | null;
}

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null);

  const openCreate = () => setDialog({ mode: "create", category: null });
  const openEdit = (c: Category) => setDialog({ mode: "edit", category: c });

  const handleSave = (data: { id?: string; name: string }) => {
    if (data.id) {
      setCategories((prev) => prev.map((c) => (c.id === data.id ? { ...c, name: data.name } : c)));
      toast.success("تم تحديث الفئة", { description: data.name });
    } else {
      const nextId = `CAT-${String(categories.length + 1).padStart(2, "0")}`;
      setCategories((prev) => [
        ...prev,
        { id: nextId, name: data.name, products: 0, revenue: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
      ]);
      toast.success("تم إنشاء الفئة", { description: data.name });
    }
    setDialog(null);
  };

  const handleDelete = (c: Category, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`حذف الفئة "${c.name}"؟ سيتم نقل منتجاتها إلى "غير مصنف".`)) return;
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
    toast("تم حذف الفئة", { description: c.name });
  };

  const handleEditClick = (c: Category, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEdit(c);
  };

  return (
    <>
      <PageHeader
        title="الفئات"
        subtitle="فئات منتجات المتجر — اضغط على فئة لعرض منتجاتها"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            <Plus className="h-3.5 w-3.5" /> فئة جديدة
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/dashboard"
            search={{ role: "admin", section: "category-detail", categoryId: c.id }}
            className="group relative rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary hover:shadow-cta"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold text-primary">#{c.id}</div>
                <h3 className="mt-1 text-base font-extrabold text-ink group-hover:text-primary">
                  {c.name}
                </h3>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Folder className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-2xl font-extrabold text-ink">{c.products}</div>
                <div className="text-[10px] text-muted-foreground">منتج</div>
              </div>
              <div className="text-left">
                <div className="text-sm font-extrabold text-ink">{fmtMoney(c.revenue)}</div>
                <div className="text-[10px] text-muted-foreground">إيرادات الشهر</div>
              </div>
            </div>
            <div className="mt-3"><Sparkline values={c.trend} tone="primary" /></div>

            {/* Quick actions */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                onClick={(e) => handleEditClick(c, e)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-bold text-ink hover:border-primary hover:text-primary"
              >
                <Pencil className="h-3 w-3" /> تعديل
              </button>
              <button
                onClick={(e) => handleDelete(c, e)}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3 w-3" /> حذف
              </button>
            </div>
          </Link>
        ))}
      </div>

      {dialog && (
        <CategoryDialog
          initial={dialog.category}
          onClose={() => setDialog(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function CategoryDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: Category | null;
  onClose: () => void;
  onSave: (data: { id?: string; name: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الفئة");
      return;
    }
    onSave({ id: initial?.id, name: name.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">
            {initial ? "تعديل الفئة" : "إنشاء فئة جديدة"}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">اسم الفئة</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: مواد عزل"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              {initial ? "حفظ التعديلات" : "إنشاء"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminCategoryDetail({ categoryId }: { categoryId?: string }) {
  const initialCat = CATEGORIES_DATA.find((c) => c.id === categoryId) ?? CATEGORIES_DATA[0];
  const [cat, setCat] = useState<Category>(initialCat);
  const [editing, setEditing] = useState(false);

  const matchesCat = (p: ProductRow, name: string) =>
    p.category === name || name.includes(p.category) || p.category.includes(name.split(" ")[0]);

  const [products, setProducts] = useState<ProductRow[]>(() =>
    SEED_PRODUCTS.filter((p) => matchesCat(p, initialCat.name)),
  );

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSave = (data: { id?: string; name: string }) => {
    setCat((c) => ({ ...c, name: data.name }));
    setEditing(false);
    toast.success("تم تحديث الفئة", { description: data.name });
  };

  const handleAddNewProduct = (data: Omit<ProductRow, "id"> & { id?: string }) => {
    const nextId = `P-${String(SEED_PRODUCTS.length + products.length + 1).padStart(3, "0")}`;
    const newProduct: ProductRow = { id: nextId, ...data, category: cat.name };
    setProducts((prev) => [newProduct, ...prev]);
    setCat((c) => ({ ...c, products: c.products + 1 }));
    setProductDialogOpen(false);
    toast.success("تم إضافة المنتج إلى الفئة", { description: data.name });
  };

  const handleAddExistingProducts = (selected: ProductRow[]) => {
    const newOnes = selected.filter((s) => !products.some((p) => p.id === s.id));
    setProducts((prev) => [...newOnes.map((p) => ({ ...p, category: cat.name })), ...prev]);
    setCat((c) => ({ ...c, products: c.products + newOnes.length }));
    setPickerOpen(false);
    if (newOnes.length > 0) {
      toast.success(`تم إضافة ${newOnes.length} منتج إلى الفئة`);
    }
  };

  const handleRemoveProduct = (p: ProductRow) => {
    if (!confirm(`إزالة "${p.name}" من هذه الفئة؟`)) return;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setCat((c) => ({ ...c, products: Math.max(0, c.products - 1) }));
    toast.success("تم إزالة المنتج من الفئة", { description: p.name });
  };

  const availableToAdd = SEED_PRODUCTS.filter((p) => !products.some((x) => x.id === p.id));

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        search={{ role: "admin", section: "categories" }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary"
      >
        <ArrowRight className="h-3.5 w-3.5" /> العودة إلى الفئات
      </Link>

      <div className="rounded-3xl border border-border bg-gradient-to-l from-primary/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary">#{cat.id}</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{cat.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {cat.products} منتج • إيرادات الشهر {fmtMoney(cat.revenue)}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            <Pencil className="h-3.5 w-3.5" /> تعديل الفئة
          </button>
        </div>
      </div>

      {editing && (
        <CategoryDialog initial={cat} onClose={() => setEditing(false)} onSave={handleSave} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="عدد المنتجات" value={cat.products} icon={<PackageSearch className="h-5 w-5" />} tone="primary" />
        <StatCard label="إيرادات الشهر" value={fmtMoney(cat.revenue)} icon={<Coins className="h-5 w-5" />} tone="accent" />
        <StatCard label="متوسط نمو أسبوعي" value="+18%" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <SectionCard title="حركة المبيعات (آخر 7 أيام)">
        <BarChart
          tone="primary"
          data={cat.trend.map((v, i) => ({ label: ["س", "ح", "ن", "ث", "ر", "خ", "ج"][i] ?? "", value: v }))}
        />
      </SectionCard>

      <SectionCard
        title="منتجات الفئة"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPickerOpen(true)}
              disabled={availableToAdd.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] font-bold text-ink hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PackageSearch className="h-3.5 w-3.5" /> إضافة منتجات موجودة
            </button>
            <button
              onClick={() => setProductDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              <Plus className="h-3.5 w-3.5" /> منتج جديد
            </button>
          </div>
        }
      >
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <PackageSearch className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <div className="text-sm font-bold text-ink">لا توجد منتجات بعد في هذه الفئة</div>
            <p className="mt-1 text-xs text-muted-foreground">ابدأ بإضافة منتج جديد أو اختر من المنتجات الموجودة.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPickerOpen(true)}
                disabled={availableToAdd.length === 0}
                className="rounded-full border border-border px-4 py-1.5 text-[11px] font-bold hover:border-primary hover:text-primary disabled:opacity-50"
              >
                إضافة منتجات موجودة
              </button>
              <button
                onClick={() => setProductDialogOpen(true)}
                className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
              >
                + منتج جديد
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-right text-sm">
              <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">SKU</th>
                  <th className="px-4 py-3 font-bold">المنتج</th>
                  <th className="px-4 py-3 font-bold">المخزون</th>
                  <th className="px-4 py-3 font-bold">السعر</th>
                  <th className="px-4 py-3 font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{p.id}</td>
                    <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
                    <td className="px-4 py-3"><Pill tone={p.stock < 50 ? "danger" : "primary"}>{p.stock}</Pill></td>
                    <td className="px-4 py-3 font-extrabold text-ink">{p.price} ر.س</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveProduct(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-bold text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" /> إزالة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {productDialogOpen && (
        <ProductDialog
          initial={null}
          onClose={() => setProductDialogOpen(false)}
          onSave={handleAddNewProduct}
        />
      )}

      {pickerOpen && (
        <ProductPickerDialog
          available={availableToAdd}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleAddExistingProducts}
        />
      )}
    </div>
  );
}

function ProductPickerDialog({
  available,
  onClose,
  onConfirm,
}: {
  available: ProductRow[];
  onClose: () => void;
  onConfirm: (selected: ProductRow[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = available.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = () => {
    if (selectedIds.size === 0) {
      toast.error("اختر منتجاً واحداً على الأقل");
      return;
    }
    onConfirm(available.filter((p) => selectedIds.has(p.id)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">إضافة منتجات إلى الفئة</h2>
            <p className="text-xs text-muted-foreground">اختر منتجاً أو أكثر من المنتجات الموجودة في المتجر</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنتج أو رمز SKU..."
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />

          <div className="max-h-[360px] overflow-y-auto rounded-xl border border-border">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                لا توجد منتجات متاحة للإضافة
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((p) => {
                  const checked = selectedIds.has(p.id);
                  return (
                    <li key={p.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                          checked ? "bg-primary-soft" : "hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(p.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-primary">{p.id}</span>
                            <span className="text-sm font-bold text-ink">{p.name}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {p.category} • مخزون {p.stock} • {p.price} ر.س
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} منتج محدد
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold hover:bg-muted"
              >
                إلغاء
              </button>
              <button
                onClick={submit}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
              >
                <Plus className="h-3.5 w-3.5" /> إضافة المحدد
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Orders (separate section + detail)
// =============================================================

interface OrderRow {
  id: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  status: "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  payment: string;
  shipping: string;
}

const ORDERS_DATA: OrderRow[] = [
  {
    id: "ORD-9012",
    customer: "شركة البناء المتقن",
    items: [
      { name: "إسمنت بورتلاندي 50كغ", qty: 100, price: 28 },
      { name: "حديد تسليح 12مم", qty: 250, price: 4.2 },
    ],
    status: "shipped",
    date: "2026-04-23",
    payment: "بطاقة بنكية",
    shipping: "صنعاء — حي السبعين",
  },
  {
    id: "ORD-9011",
    customer: "م. أحمد الشامي",
    items: [{ name: "بلوك إسمنتي 20×40", qty: 200, price: 3.5 }, { name: "إسمنت بورتلاندي 50كغ", qty: 30, price: 28 }],
    status: "processing",
    date: "2026-04-22",
    payment: "محفظة إلكترونية",
    shipping: "صنعاء — حدة",
  },
  {
    id: "ORD-9010",
    customer: "مؤسسة بناة الجنوب",
    items: [
      { name: "لوح شمسي 550W", qty: 12, price: 380 },
      { name: "بطارية ليثيوم 48V 100Ah", qty: 1, price: 2400 },
    ],
    status: "delivered",
    date: "2026-04-21",
    payment: "تحويل بنكي",
    shipping: "عدن — كريتر",
  },
  {
    id: "ORD-9009",
    customer: "فهد المنصور",
    items: [{ name: "حديد تسليح 12مم", qty: 200, price: 4.2 }],
    status: "cancelled",
    date: "2026-04-20",
    payment: "الدفع عند الاستلام",
    shipping: "تعز — الحوبان",
  },
];

const ORDER_STATUS_LABEL: Record<OrderRow["status"], string> = {
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "مُسلَّم",
  cancelled: "ملغي",
};

function totalOf(o: OrderRow) {
  return o.items.reduce((s, i) => s + i.qty * i.price, 0);
}

function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderRow["status"]>("all");
  const filtered = statusFilter === "all" ? ORDERS_DATA : ORDERS_DATA.filter((o) => o.status === statusFilter);

  const grandTotal = ORDERS_DATA.reduce((s, o) => s + totalOf(o), 0);
  const counts = {
    processing: ORDERS_DATA.filter((o) => o.status === "processing").length,
    shipped: ORDERS_DATA.filter((o) => o.status === "shipped").length,
    delivered: ORDERS_DATA.filter((o) => o.status === "delivered").length,
    cancelled: ORDERS_DATA.filter((o) => o.status === "cancelled").length,
  };

  return (
    <>
      <PageHeader title="الطلبات" subtitle="جميع طلبات متجر تم — اضغط على طلب لعرض التفاصيل" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الطلبات" value={ORDERS_DATA.length} icon={<ShoppingBag className="h-5 w-5" />} tone="primary" />
        <StatCard label="قيد التجهيز" value={counts.processing} icon={<Activity className="h-5 w-5" />} tone="accent" />
        <StatCard label="تم التسليم" value={counts.delivered} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="إجمالي المبيعات" value={`$${grandTotal.toLocaleString()}`} icon={<Coins className="h-5 w-5" />} tone="accent" />
      </div>

      <SectionCard
        title="قائمة الطلبات"
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-bold focus:border-primary focus:outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="processing">قيد التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">مُسلَّم</option>
            <option value="cancelled">ملغي</option>
          </select>
        }
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">الطلب</th>
                <th className="px-4 py-3 font-bold">العميل</th>
                <th className="px-4 py-3 font-bold">العناصر</th>
                <th className="px-4 py-3 font-bold">الإجمالي</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{o.id}</td>
                  <td className="px-4 py-3 font-bold text-ink">{o.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.items.length} عنصر</td>
                  <td className="px-4 py-3 font-extrabold text-ink">${totalOf(o).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Pill
                      tone={
                        o.status === "delivered"
                          ? "primary"
                          : o.status === "shipped"
                            ? "info"
                            : o.status === "cancelled"
                              ? "danger"
                              : "accent"
                      }
                    >
                      {ORDER_STATUS_LABEL[o.status]}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.date}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/dashboard"
                      search={{ role: "admin", section: "order-detail", orderId: o.id }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye className="h-3 w-3" /> عرض
                    </Link>
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

const ORDER_STATUS_FLOW: OrderRow["status"][] = ["processing", "shipped", "delivered"];

function AdminOrderDetail({ orderId }: { orderId?: string }) {
  const initial = ORDERS_DATA.find((o) => o.id === orderId) ?? ORDERS_DATA[0];
  const [order, setOrder] = useState<OrderRow>(initial);
  const [contactOpen, setContactOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const total = totalOf(order);

  const timeline = [
    { label: "تم استلام الطلب", date: order.date, done: true },
    { label: "تأكيد الدفع", date: order.date, done: true },
    { label: "قيد التجهيز", date: order.date, done: order.status !== "cancelled" },
    { label: "تم الشحن", date: "—", done: order.status === "shipped" || order.status === "delivered" },
    { label: "تم التسليم", date: "—", done: order.status === "delivered" },
  ];

  const advance = () => {
    const idx = ORDER_STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) {
      toast("الطلب وصل المرحلة النهائية", { description: ORDER_STATUS_LABEL[order.status] });
      return;
    }
    const next = ORDER_STATUS_FLOW[idx + 1];
    setOrder((o) => ({ ...o, status: next }));
    setStatusOpen(false);
    toast.success("تم تحديث حالة الطلب", { description: ORDER_STATUS_LABEL[next] });
  };

  const setStatus = (s: OrderRow["status"]) => {
    setOrder((o) => ({ ...o, status: s }));
    setStatusOpen(false);
    toast.success("تم تحديث حالة الطلب", { description: ORDER_STATUS_LABEL[s] });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        search={{ role: "admin", section: "orders" }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary"
      >
        <ArrowRight className="h-3.5 w-3.5" /> العودة إلى الطلبات
      </Link>

      <div className="rounded-3xl border border-border bg-gradient-to-l from-primary/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary">طلب #{order.id}</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{order.customer}</h1>
            <p className="mt-2 text-xs text-muted-foreground">
              {order.date} • {order.payment} • شحن إلى: {order.shipping}
            </p>
          </div>
          <Pill
            tone={
              order.status === "delivered"
                ? "primary"
                : order.status === "shipped"
                  ? "info"
                  : order.status === "cancelled"
                    ? "danger"
                    : "accent"
            }
          >
            {ORDER_STATUS_LABEL[order.status]}
          </Pill>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="عناصر الطلب">
          <div className="space-y-3">
            {order.items.map((it) => (
              <div
                key={it.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink">{it.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {it.qty} × ${it.price}
                    </div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-ink">
                  ${(it.qty * it.price).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>الشحن</span>
              <span>مجاني</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-extrabold text-ink">
              <span>الإجمالي</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="مسار الطلب">
          <ol className="relative space-y-4 border-r-2 border-dashed border-border pe-0 ps-6">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -right-[28px] top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ring-4 ring-card ${
                    t.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.done ? "✓" : i + 1}
                </span>
                <div className="text-sm font-bold text-ink">{t.label}</div>
                <div className="text-[11px] text-muted-foreground">{t.date}</div>
              </li>
            ))}
          </ol>

          <div className="mt-5 space-y-2">
            <button
              onClick={() => setStatusOpen(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              <RefreshCw className="h-3.5 w-3.5" /> تحديث حالة الطلب
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" /> تواصل مع العميل
            </button>
          </div>
        </SectionCard>
      </div>

      {statusOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setStatusOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-extrabold text-ink">تحديث حالة الطلب</h2>
              <button
                onClick={() => setStatusOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 p-5">
              {(["processing", "shipped", "delivered", "cancelled"] as OrderRow["status"][]).map((s) => {
                const active = s === order.status;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-right transition ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-extrabold text-ink">{ORDER_STATUS_LABEL[s]}</span>
                    {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
              <button
                onClick={advance}
                className="mt-2 w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-cta hover:bg-primary/95"
              >
                الانتقال للمرحلة التالية تلقائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <ContactCustomerDialog
          customer={order.customer}
          orderId={order.id}
          onClose={() => setContactOpen(false)}
        />
      )}
    </div>
  );
}

function ContactCustomerDialog({
  customer,
  orderId,
  onClose,
}: {
  customer: string;
  orderId: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("يرجى كتابة رسالة قبل الإرسال");
      return;
    }
    toast.success("تم إرسال الرسالة للعميل", { description: customer });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">تواصل مع العميل</h2>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {customer} • طلب #{orderId}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={send} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">الرسالة</span>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="اكتب رسالتك هنا…"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              إرسال الرسالة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
