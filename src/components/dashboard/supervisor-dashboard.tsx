import { CheckCircle2, ClipboardList, MapPin, XCircle } from "lucide-react";
import {
  FIELD_REPORTS,
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
} from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";

export function SupervisorDashboard() {
  const pendingReports = FIELD_REPORTS.filter((r) => r.status === "pending");
  const approved = FIELD_REPORTS.filter((r) => r.status === "approved");
  const rejected = FIELD_REPORTS.filter((r) => r.status === "rejected");
  const pendingPayments = PAYMENT_REQUESTS.filter((x) => x.status === "pending");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="بانتظار المراجعة"
          value={pendingReports.length}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="معتمدة هذا الشهر"
          value={approved.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="بحاجة إعادة"
          value={rejected.length}
          icon={<XCircle className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          label="مشاريع تحت إشرافي"
          value="6"
          icon={<MapPin className="h-5 w-5" />}
        />
      </div>

      <SectionCard title="تقارير ميدانية بانتظار قرارك">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="info">{r.id}</Pill>
                  <span className="text-sm font-bold text-ink">{r.phase}</span>
                  <Pill
                    tone={
                      r.status === "approved"
                        ? "primary"
                        : r.status === "rejected"
                          ? "danger"
                          : "accent"
                    }
                  >
                    {r.status === "approved"
                      ? "معتمد"
                      : r.status === "rejected"
                        ? "مرفوض"
                        : "بانتظار"}
                  </Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{r.engineer}</span>
                  <span>•</span>
                  <span>{r.date}</span>
                  <span>•</span>
                  <span>📷 {r.photos} صورة</span>
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 md:shrink-0">
                  <button className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground transition hover:border-rose-400 hover:text-rose-600">
                    رفض
                  </button>
                  <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95">
                    اعتماد
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="طلبات دفع تحتاج توقيعك التقني"
        subtitle="بعد اعتمادك ترسل لصاحب المشروع لتحرير المبلغ"
      >
        <div className="space-y-3">
          {pendingPayments.map((req) => (
            <div
              key={req.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{req.phase}</div>
                <div className="text-[11px] text-muted-foreground">
                  مشروع {MOCK_PROJECT.name} • {req.submittedAt}
                </div>
              </div>
              <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
              <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta">
                مراجعة وتوقيع
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
