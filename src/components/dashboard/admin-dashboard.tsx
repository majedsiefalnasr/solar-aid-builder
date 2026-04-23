import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Building2, ChevronLeft, Coins, CreditCard, ExternalLink, Eye, FileText, TrendingUp, Users, X } from "lucide-react";
import { DISPUTES, MOCK_PROJECT, PLATFORM_STATS } from "@/lib/dashboard-data";
import { useWorkflow } from "@/lib/workflow-store";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { AreaChart, DonutChart, HBarChart, Sparkline } from "./charts";

const ACTIVITY_12M = [
  { label: "مايو", value: 78 },
  { label: "يونيو", value: 92 },
  { label: "يوليو", value: 85 },
  { label: "أغسطس", value: 102 },
  { label: "سبتمبر", value: 98 },
  { label: "أكتوبر", value: 115 },
  { label: "نوفمبر", value: 108 },
  { label: "ديسمبر", value: 124 },
  { label: "يناير", value: 132 },
  { label: "فبراير", value: 118 },
  { label: "مارس", value: 138 },
  { label: "أبريل", value: 152 },
];

const ACTIVE_PROJECTS = [
  { id: MOCK_PROJECT.id, name: MOCK_PROJECT.name, city: "صنعاء", owner: "م. أحمد الشامي", progress: 42, status: "active" as const },
  { id: "PRJ-2055", name: "شقة المعلا", city: "عدن", owner: "فهد المنصور", progress: 28, status: "active" as const },
  { id: "PRJ-2099", name: "مجمع النور التجاري", city: "صنعاء", owner: "ريم السقاف", progress: 18, status: "active" as const },
  { id: "PRJ-2068", name: "محل تجاري — حي السلام", city: "تعز", owner: "خالد العبسي", progress: 5, status: "pending" as const },
];

const ALL_DISPUTES = [
  ...DISPUTES,
  {
    id: "DSP-15",
    project: "محل السلام التجاري",
    raisedBy: "صاحب المشروع",
    topic: "تأخر تنفيذ مرحلة الكهرباء",
    status: "open" as const,
    openedAt: "2026-04-18",
  },
  {
    id: "DSP-08",
    project: "فيلا الصافي",
    raisedBy: "المقاول",
    topic: "خلاف على إضافة بند خرسانة",
    status: "resolved" as const,
    openedAt: "2026-04-05",
  },
  {
    id: "DSP-07",
    project: "شقة كريتر",
    raisedBy: "صاحب المشروع",
    topic: "جودة دهانات الواجهة",
    status: "resolved" as const,
    openedAt: "2026-03-28",
  },
];

export function AdminDashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const store = useWorkflow();
  const pendingAdmin = useMemo(
    () => store.projects.filter((p) => p.status === "pending_admin"),
    [store.projects],
  );
  const pendingPayments = useMemo(
    () =>
      store.projects.flatMap((p) =>
        p.payments.filter((pm) => pm.status === "pending").map(() => p.id),
      ),
    [store.projects],
  );
  const pendingReports = useMemo(
    () => store.reports.filter((r) => r.status === "pending"),
    [store.reports],
  );

  return (
    <div className="space-y-6">
      {(pendingAdmin.length > 0 || pendingPayments.length > 0 || pendingReports.length > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          {pendingAdmin.length > 0 && (
            <BannerCard
              tone="primary"
              icon={<Building2 className="h-4 w-4" />}
              title={`${pendingAdmin.length} طلب مشروع جديد`}
              subtitle="بانتظار قبولك وتعيين مشرف"
              to="/dashboard"
              search={{ role: "admin", section: "projects" }}
            />
          )}
          {pendingPayments.length > 0 && (
            <BannerCard
              tone="accent"
              icon={<CreditCard className="h-4 w-4" />}
              title={`${pendingPayments.length} إثبات دفع للتحقق`}
              subtitle="حوالات بنكية رفعها العملاء"
              to="/dashboard"
              search={{ role: "admin", section: "projects" }}
            />
          )}
          {pendingReports.length > 0 && (
            <BannerCard
              tone="info"
              icon={<FileText className="h-4 w-4" />}
              title={`${pendingReports.length} تقرير ميداني`}
              subtitle="رُفعت من المهندسين الميدانيين"
              to="/dashboard"
              search={{ role: "admin", section: "reports" }}
            />
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="مشاريع نشطة"
          value={PLATFORM_STATS.activeProjects}
          hint="+8 خلال آخر 7 أيام"
          icon={<Building2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="مقاولون مسجلون"
          value={PLATFORM_STATS.contractors}
          hint="+12 هذا الشهر"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="إجمالي مدفوعات متتبَّعة"
          value={fmtMoney(PLATFORM_STATS.totalTracked)}
          hint="+18% عن الشهر السابق"
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="نزاعات مفتوحة"
          value={PLATFORM_STATS.openDisputes}
          hint="2 بانتظار قرار"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      {/* Mini KPIs with sparklines */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat title="مشاريع جديدة/أسبوع" value="+18" tone="primary" trend={[6, 9, 7, 12, 10, 14, 18]} />
        <MiniStat title="دفعات مُحرّرة/يوم" value={fmtMoney(48)} tone="accent" trend={[20, 28, 24, 32, 38, 42, 48]} />
        <MiniStat title="معدل اعتماد المراحل" value="92%" tone="info" trend={[78, 82, 80, 85, 88, 90, 92]} />
        <MiniStat title="رضا العملاء" value="4.7/5" tone="primary" trend={[42, 44, 46, 45, 47, 47, 47]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="نشاط المنصة"
            subtitle="عدد المشاريع المُفعّلة شهرياً خلال السنة الحالية"
          >
            <AreaChart data={ACTIVITY_12M} tone="primary" />
          </SectionCard>
        </div>

        <SectionCard title="توزيع المشاريع حسب الحالة">
          <DonutChart
            size={170}
            centerLabel="مشروع"
            centerValue={String(PLATFORM_STATS.activeProjects)}
            data={[
              { label: "قيد التنفيذ", value: 78, tone: "primary" },
              { label: "بانتظار التمويل", value: 24, tone: "accent" },
              { label: "بانتظار التعيين", value: 14, tone: "info" },
              { label: "متوقفة", value: 8, tone: "danger" },
            ]}
          />
        </SectionCard>
      </div>

      {/* Active projects table */}
      <SectionCard
        title="المشاريع النشطة"
        subtitle="آخر المشاريع المُفعّلة على المنصة"
        action={
          <Link
            to="/dashboard"
            search={{ role: "admin", section: "projects" }}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
          >
            عرض الكل <ExternalLink className="h-3 w-3" />
          </Link>
        }
      >
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
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {ACTIVE_PROJECTS.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
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
                  <td className="px-4 py-3">
                    <Link
                      to="/dashboard"
                      search={{ role: "admin", section: "project-detail", projectId: p.id }}
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

      <SectionCard
        title="النزاعات النشطة"
        subtitle="منصة تم تتدخل كطرف ضامن لحل الخلافات"
        action={
          <button
            onClick={() => setLogOpen(true)}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"
          >
            فتح سجل كامل
          </button>
        }
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">المعرف</th>
                <th className="px-4 py-3 font-bold">المشروع</th>
                <th className="px-4 py-3 font-bold">رفعها</th>
                <th className="px-4 py-3 font-bold">الموضوع</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {DISPUTES.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{d.id}</td>
                  <td className="px-4 py-3 font-bold text-ink">{d.project}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.raisedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.topic}</td>
                  <td className="px-4 py-3">
                    <Pill
                      tone={
                        d.status === "resolved"
                          ? "primary"
                          : d.status === "mediating"
                            ? "info"
                            : "danger"
                      }
                    >
                      {d.status === "resolved"
                        ? "محلولة"
                        : d.status === "mediating"
                          ? "وساطة"
                          : "مفتوحة"}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.openedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="تسجيلات المستخدمين الأسبوعية" subtitle="حسب نوع المستخدم">
          <HBarChart
            data={[
              { label: "أصحاب مشاريع", value: 28, tone: "primary" },
              { label: "مقاولون", value: 14, tone: "accent" },
              { label: "مهندسون مشرفون", value: 8, tone: "info" },
              { label: "ميدانيون", value: 12, tone: "danger" },
            ]}
            formatValue={(v) => `${v}+`}
          />
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
            <div>
              <div className="text-[11px] text-muted-foreground">إجمالي تسجيلات الأسبوع</div>
              <div className="text-xl font-extrabold text-ink">+62</div>
            </div>
            <div className="text-[11px] font-bold text-primary">+34% عن الأسبوع الماضي</div>
          </div>
        </SectionCard>

        <SectionCard title="آخر التسجيلات">
          <ul className="space-y-3 text-sm">
            {[
              { name: "م. خالد العبسي", role: "مهندس مشرف", time: "قبل ساعة" },
              { name: "شركة بناة الشمال", role: "مقاول", time: "قبل 3 ساعات" },
              { name: "السيد فهد المنصور", role: "صاحب مشروع", time: "اليوم" },
              { name: "م. ريم السقاف", role: "مهندس ميداني", time: "أمس" },
            ].map((u) => (
              <li
                key={u.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <div className="text-sm font-bold text-ink">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{u.role}</div>
                </div>
                <span className="text-[11px] text-muted-foreground">{u.time}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="hidden">
        <TrendingUp />
      </div>

      {logOpen && <DisputesLogDialog disputes={ALL_DISPUTES} onClose={() => setLogOpen(false)} />}
    </div>
  );
}

function MiniStat({
  title,
  value,
  tone,
  trend,
}: {
  title: string;
  value: string;
  tone: "primary" | "accent" | "info" | "danger";
  trend: number[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] font-semibold text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="text-xl font-extrabold text-ink">{value}</div>
        <Sparkline values={trend} tone={tone} />
      </div>
    </div>
  );
}

function DisputesLogDialog({
  disputes,
  onClose,
}: {
  disputes: typeof ALL_DISPUTES;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "open" | "mediating" | "resolved">("all");
  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);
  const counts = {
    open: disputes.filter((d) => d.status === "open").length,
    mediating: disputes.filter((d) => d.status === "mediating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">سجل النزاعات الكامل</h2>
            <p className="text-xs text-muted-foreground">جميع النزاعات منذ بداية المنصة</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 p-4">
          {(
            [
              { k: "all", label: `الكل (${disputes.length})` },
              { k: "open", label: `مفتوحة (${counts.open})` },
              { k: "mediating", label: `وساطة (${counts.mediating})` },
              { k: "resolved", label: `محلولة (${counts.resolved})` },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === t.k ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground/70 hover:border-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-4">
          <div className="space-y-3">
            {filtered.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{d.id}</span>
                    <span className="text-sm font-extrabold text-ink">{d.project}</span>
                  </div>
                  <Pill
                    tone={
                      d.status === "resolved"
                        ? "primary"
                        : d.status === "mediating"
                          ? "info"
                          : "danger"
                    }
                  >
                    {d.status === "resolved" ? "محلولة" : d.status === "mediating" ? "وساطة" : "مفتوحة"}
                  </Pill>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">رفعها: {d.raisedBy} • {d.openedAt}</div>
                <p className="mt-2 text-sm text-foreground/90">{d.topic}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground">
                    فتح المحادثة
                  </button>
                  <button className="rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-bold hover:border-primary">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
