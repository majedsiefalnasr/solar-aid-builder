import { AlertTriangle, Building2, Coins, Users } from "lucide-react";
import { DISPUTES, PLATFORM_STATS } from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="مشاريع نشطة"
          value={PLATFORM_STATS.activeProjects}
          icon={<Building2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="مقاولون مسجلون"
          value={PLATFORM_STATS.contractors}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="إجمالي مدفوعات متتبَّعة"
          value={fmtMoney(PLATFORM_STATS.totalTracked)}
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="نزاعات مفتوحة"
          value={PLATFORM_STATS.openDisputes}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
        />
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
        <SectionCard title="نشاط المنصة">
          <div className="flex h-48 items-end gap-2">
            {[40, 65, 50, 80, 55, 90, 75, 88, 70, 95, 82, 100].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-300"
                  style={{ height: `${v}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            عدد المشاريع المُفعّلة شهرياً خلال السنة الحالية
          </p>
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
    </div>
  );
}
