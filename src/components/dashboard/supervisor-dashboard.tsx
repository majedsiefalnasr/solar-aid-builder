import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, FileText, HardHat, MapPin, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  FIELD_REPORTS,
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
} from "@/lib/dashboard-data";
import { ROLE_USER, useWorkflow } from "@/lib/workflow-store";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { BannerCard } from "./admin-dashboard";

type ReportStatus = "approved" | "pending" | "rejected";
type PayStatus = "pending" | "approved" | "released" | "rejected";

export function SupervisorDashboard() {
  const [reportStatus, setReportStatus] = useState<Record<string, ReportStatus>>(() =>
    Object.fromEntries(FIELD_REPORTS.map((r) => [r.id, r.status])),
  );
  const [payStatus, setPayStatus] = useState<Record<string, PayStatus>>(() =>
    Object.fromEntries(PAYMENT_REQUESTS.map((r) => [r.id, r.status])),
  );

  const pendingReports = FIELD_REPORTS.filter((r) => reportStatus[r.id] === "pending");
  const approved = FIELD_REPORTS.filter((r) => reportStatus[r.id] === "approved");
  const rejected = FIELD_REPORTS.filter((r) => reportStatus[r.id] === "rejected");

  const handleApproveReport = (id: string, phase: string) => {
    setReportStatus((s) => ({ ...s, [id]: "approved" }));
    toast.success("تم اعتماد التقرير", { description: `${id} — ${phase}` });
  };
  const handleRejectReport = (id: string, phase: string) => {
    setReportStatus((s) => ({ ...s, [id]: "rejected" }));
    toast.error("تم رفض التقرير", { description: `${id} — ${phase} • تم إعلام المهندس الميداني` });
  };
  const handleSignPayment = (id: string, phase: string, amount: number) => {
    setPayStatus((s) => ({ ...s, [id]: "approved" }));
    toast.success("تم التوقيع التقني على الدفعة", {
      description: `${phase} — ${fmtMoney(amount)} • تم إرسالها لصاحب المشروع`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="بانتظار المراجعة" value={pendingReports.length} icon={<ClipboardList className="h-5 w-5" />} tone="accent" />
        <StatCard label="معتمدة هذا الشهر" value={approved.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="بحاجة إعادة" value={rejected.length} icon={<XCircle className="h-5 w-5" />} tone="danger" />
        <StatCard label="مشاريع تحت إشرافي" value="6" icon={<MapPin className="h-5 w-5" />} />
      </div>

      <SectionCard title="تقارير ميدانية بانتظار قرارك">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => {
            const status = reportStatus[r.id];
            return (
              <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="info">{r.id}</Pill>
                    <span className="text-sm font-bold text-ink">{r.phase}</span>
                    <Pill tone={status === "approved" ? "primary" : status === "rejected" ? "danger" : "accent"}>
                      {status === "approved" ? "معتمد" : status === "rejected" ? "مرفوض" : "بانتظار"}
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
                {status === "pending" && (
                  <div className="flex gap-2 md:shrink-0">
                    <button
                      onClick={() => handleRejectReport(r.id, r.phase)}
                      className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground transition hover:border-rose-400 hover:text-rose-600"
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => handleApproveReport(r.id, r.phase)}
                      className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                    >
                      اعتماد
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="طلبات دفع تحتاج توقيعك التقني"
        subtitle="بعد اعتمادك ترسل لصاحب المشروع لتحرير المبلغ"
      >
        <div className="space-y-3">
          {PAYMENT_REQUESTS.filter((r) => payStatus[r.id] === "pending").map((req) => (
            <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{req.phase}</div>
                <div className="text-[11px] text-muted-foreground">
                  مشروع {MOCK_PROJECT.name} • {req.submittedAt}
                </div>
              </div>
              <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
              <button
                onClick={() => handleSignPayment(req.id, req.phase, req.amount)}
                className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta"
              >
                مراجعة وتوقيع
              </button>
            </div>
          ))}
          {PAYMENT_REQUESTS.filter((r) => payStatus[r.id] === "pending").length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              لا توجد طلبات دفع بانتظار توقيعك حالياً.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
