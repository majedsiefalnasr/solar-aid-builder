import { AlertTriangle, Building2, Coins, TrendingUp, Users } from "lucide-react";
import { DISPUTES, PLATFORM_STATS } from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { AreaChart, BarChart, DonutChart, Sparkline } from "./charts";

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

export function AdminDashboard() {
  return (
    <div className="space-y-6">
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

      <SectionCard
        title="النزاعات النشطة"
        subtitle="منصة تم تتدخل كطرف ضامن لحل الخلافات"
        action={
          <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
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
          <BarChart
            tone="primary"
            data={[
              { label: "أصحاب", value: 28 },
              { label: "مقاولون", value: 14 },
              { label: "مشرفون", value: 8 },
              { label: "ميدانيون", value: 12 },
            ]}
          />
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
