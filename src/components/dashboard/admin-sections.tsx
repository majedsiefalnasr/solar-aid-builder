import { Link } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  Folder,
  Package,
  Settings2,
  ShoppingBag,
  Store as StoreIcon,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { DISPUTES, MOCK_PROJECT, PAYMENT_REQUESTS, PLATFORM_STATS } from "@/lib/dashboard-data";
import { AdminDashboard } from "./admin-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";

export function AdminSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <AdminDashboard />;
    case "projects":
      return <AdminProjects />;
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
    case "orders":
      return <AdminOrders />;
    default:
      return <AdminDashboard />;
  }
}

const PROJECTS_LIST = [
  {
    id: MOCK_PROJECT.id,
    name: MOCK_PROJECT.name,
    city: MOCK_PROJECT.city,
    owner: MOCK_PROJECT.owner,
    status: "active",
    progress: 42,
  },
  {
    id: "PRJ-2055",
    name: "شقة المعلا",
    city: "عدن",
    owner: "فهد المنصور",
    status: "active",
    progress: 28,
  },
  {
    id: "PRJ-2068",
    name: "محل تجاري — حي السلام",
    city: "تعز",
    owner: "خالد العبسي",
    status: "pending",
    progress: 0,
  },
  {
    id: "PRJ-2099",
    name: "مجمع النور التجاري",
    city: "صنعاء",
    owner: "ريم السقاف",
    status: "active",
    progress: 18,
  },
];

function AdminProjects() {
  return (
    <>
      <PageHeader
        title="المشاريع"
        subtitle={`${PLATFORM_STATS.activeProjects} مشروع نشط على المنصة`}
      />
      <SectionCard title="جميع المشاريع">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">المعرف</th>
                <th className="px-4 py-3 font-bold">المشروع</th>
                <th className="px-4 py-3 font-bold">المدينة</th>
                <th className="px-4 py-3 font-bold">المالك</th>
                <th className="px-4 py-3 font-bold">الإنجاز</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {PROJECTS_LIST.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{p.id}</td>
                  <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-ink">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={p.status === "active" ? "primary" : "accent"}>
                      {p.status === "active" ? "نشط" : "بانتظار"}
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

const PENDING_ASSIGNMENTS = [
  {
    id: "ASN-501",
    project: "فيلا الشاطئ",
    role: "مهندس مشرف",
    candidate: "م. ليلى العمراني",
    date: "2026-04-22",
  },
  {
    id: "ASN-502",
    project: "محل تجاري — السلام",
    role: "مقاول",
    candidate: "شركة بناة الجنوب",
    date: "2026-04-21",
  },
  {
    id: "ASN-503",
    project: "مجمع النور",
    role: "مهندس ميداني",
    candidate: "م. أمل الزبيدي",
    date: "2026-04-20",
  },
];

function AdminAssignments() {
  return (
    <>
      <PageHeader title="طلبات التعيين" subtitle="مطابقة المهندسين والمقاولين بالمشاريع المناسبة" />
      <SectionCard
        title="طلبات بانتظار التعيين"
        action={
          <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
            تعيين تلقائي
          </button>
        }
      >
        <div className="space-y-3">
          {PENDING_ASSIGNMENTS.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Pill tone="info">{a.id}</Pill>
                  <span className="text-sm font-bold text-ink">{a.project}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {a.role} مقترح: {a.candidate} • {a.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold hover:border-primary">
                  بحث آخر
                </button>
                <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta">
                  تأكيد التعيين
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

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

const USERS = [
  { name: "م. أحمد الشامي", role: "صاحب مشروع", joined: "2026-01-12", status: "active" },
  { name: "شركة البناء المتقن", role: "مقاول", joined: "2025-11-08", status: "active" },
  { name: "م. ليلى العمراني", role: "مهندس مشرف", joined: "2025-09-22", status: "active" },
  { name: "م. سامي الحاج", role: "مهندس ميداني", joined: "2026-02-04", status: "active" },
  { name: "فهد المنصور", role: "صاحب مشروع", joined: "2026-04-19", status: "pending" },
];

function AdminUsers() {
  return (
    <>
      <PageHeader
        title="المستخدمون"
        subtitle={`${PLATFORM_STATS.contractors}+ مستخدم مسجّل`}
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
            <UserPlus className="h-3.5 w-3.5" /> دعوة مستخدم
          </button>
        }
      />
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
              {USERS.map((u) => (
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
                    <button className="text-xs font-bold text-primary hover:underline">عرض</button>
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
    </>
  );
}

const WORKFLOW_STAGES = [
  { id: 1, name: "استلام طلب المشروع", auto: true },
  { id: 2, name: "تعيين مهندس مشرف", auto: false },
  { id: 3, name: "ترشيح المقاولين", auto: true },
  { id: 4, name: "اعتماد المقاول", auto: false },
  { id: 5, name: "تقسيم المراحل المالية", auto: false },
  { id: 6, name: "بدء التنفيذ", auto: true },
];

function AdminWorkflow() {
  return (
    <>
      <PageHeader
        title="إعدادات سير العمل"
        subtitle="تحكم في خطوات إنشاء المشروع والاعتمادات"
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
            <Workflow className="h-3.5 w-3.5" /> حفظ التغييرات
          </button>
        }
      />
      <SectionCard title="خطوات دورة حياة المشروع">
        <div className="space-y-3">
          {WORKFLOW_STAGES.map((s) => (
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
                <input type="checkbox" defaultChecked={s.auto} className="h-4 w-4 accent-primary" />
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
              defaultValue={2.5}
              step={0.5}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">مدة تجميد الدفعة (أيام)</span>
            <input
              type="number"
              defaultValue={3}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>
        <div className="hidden">
          <Settings2 />
        </div>
      </SectionCard>
    </>
  );
}

function AdminFinance() {
  return (
    <>
      <PageHeader title="المالية" subtitle="الإيرادات والعمولات وحسابات المنصة" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إيرادات الشهر"
          value={fmtMoney(212_500)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="عمولات محصّلة"
          value={fmtMoney(48_300)}
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="مدفوعات معلّقة"
          value={fmtMoney(15_700)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          label="نزاعات بمبلغ مجمَّد"
          value={DISPUTES.length}
          icon={<Activity className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <SectionCard title="نشاط الإيرادات الشهري">
        <div className="flex h-56 items-end gap-2">
          {[55, 70, 60, 85, 65, 95, 80, 92, 75, 100, 88, 110].map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-300"
                style={{ height: `${(v / 110) * 100}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function AdminStore() {
  return (
    <>
      <PageHeader title="المتجر" subtitle="نظرة سريعة على أداء متجر تم" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="منتجات نشطة"
          value="847"
          icon={<Package className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="طلبات الشهر"
          value="1,243"
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="إيرادات المتجر"
          value={fmtMoney(85_400)}
          icon={<Coins className="h-5 w-5" />}
        />
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

const PRODUCTS = [
  { id: "P-001", name: "إسمنت بورتلاندي 50كغ", category: "مواد بناء", stock: 1240, price: 28 },
  { id: "P-002", name: "حديد تسليح 12مم", category: "مواد بناء", stock: 580, price: 4.2 },
  { id: "P-003", name: "بلوك إسمنتي 20×40", category: "مواد بناء", stock: 8500, price: 3.5 },
  { id: "P-004", name: "بطارية ليثيوم 48V 100Ah", category: "طاقة", stock: 18, price: 2400 },
  { id: "P-005", name: "لوح شمسي 550W", category: "طاقة", stock: 64, price: 380 },
];

function AdminProducts() {
  return (
    <>
      <PageHeader
        title="إدارة المنتجات"
        subtitle="أضف وعدّل منتجات متجر تم"
        action={
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta">
            + منتج جديد
          </button>
        }
      />
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
              {PRODUCTS.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.id}</td>
                  <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <Pill tone={p.stock < 50 ? "danger" : "primary"}>{p.stock}</Pill>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-ink">${p.price}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-bold text-primary hover:underline">
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="hidden">
        <Folder />
      </div>
    </>
  );
}

const CATEGORIES = [
  { name: "مواد البناء", products: 312 },
  { name: "الكهرباء", products: 184 },
  { name: "السباكة", products: 96 },
  { name: "الطاقة الشمسية", products: 142 },
  { name: "الأدوات اليدوية", products: 113 },
];

const ORDERS = [
  {
    id: "ORD-9012",
    customer: "شركة البناء المتقن",
    total: 4_850,
    status: "shipped",
    date: "2026-04-23",
  },
  {
    id: "ORD-9011",
    customer: "م. أحمد الشامي",
    total: 1_200,
    status: "processing",
    date: "2026-04-22",
  },
  {
    id: "ORD-9010",
    customer: "مؤسسة بناة الجنوب",
    total: 7_320,
    status: "delivered",
    date: "2026-04-21",
  },
  { id: "ORD-9009", customer: "فهد المنصور", total: 980, status: "cancelled", date: "2026-04-20" },
];

function AdminOrders() {
  return (
    <>
      <PageHeader title="الفئات والطلبات" subtitle="إدارة فئات المتجر ومتابعة الطلبات" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SectionCard title="الفئات">
          <div className="space-y-2">
            {CATEGORIES.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-bold text-ink">{c.name}</span>
                <Pill tone="muted">{c.products}</Pill>
              </div>
            ))}
            <button className="mt-3 w-full rounded-xl border-2 border-dashed border-border py-3 text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary">
              + فئة جديدة
            </button>
          </div>
        </SectionCard>

        <SectionCard title="آخر الطلبات">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-right text-sm">
              <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">الطلب</th>
                  <th className="px-4 py-3 font-bold">العميل</th>
                  <th className="px-4 py-3 font-bold">الإجمالي</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                  <th className="px-4 py-3 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{o.id}</td>
                    <td className="px-4 py-3 font-bold text-ink">{o.customer}</td>
                    <td className="px-4 py-3 font-extrabold text-ink">${o.total}</td>
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
                        {o.status === "delivered"
                          ? "مُسلَّم"
                          : o.status === "shipped"
                            ? "تم الشحن"
                            : o.status === "cancelled"
                              ? "ملغي"
                              : "قيد التجهيز"}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
