import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Coins,
  Layers,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { AreaChart, DonutChart, ProgressRing } from "./charts";

type PayStatus = "pending" | "approved" | "rejected";

export function OwnerDashboard() {
  const p = MOCK_PROJECT;
  const remaining = p.totalBudget - p.releasedAmount;
  const [payStatus, setPayStatus] = useState<Record<string, PayStatus>>(() =>
    Object.fromEntries(PAYMENT_REQUESTS.map((r) => [r.id, r.status as PayStatus])),
  );
  const pendingPayments = PAYMENT_REQUESTS.filter((x) => payStatus[x.id] === "pending");

  const handleApprove = (id: string, phase: string, amount: number) => {
    setPayStatus((s) => ({ ...s, [id]: "approved" }));
    toast.success("تم تحرير الدفعة", {
      description: `${phase} — ${fmtMoney(amount)}`,
    });
  };

  const handleReject = (id: string, phase: string) => {
    setPayStatus((s) => ({ ...s, [id]: "rejected" }));
    toast.error("تم رفض طلب الدفع", {
      description: phase,
    });
  };

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-l from-primary/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary">المشروع النشط #{p.id}</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>📍 {p.city}</span>
              <span>👷 {p.contractor}</span>
              <span>📐 {p.supervisor}</span>
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-muted-foreground">إجمالي الميزانية</div>
            <div className="text-2xl font-extrabold text-ink">{fmtMoney(p.totalBudget)}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">نسبة الإنجاز الإجمالية</span>
            <span className="text-ink">{p.overallProgress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
              style={{ width: `${p.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="المبلغ المُحرّر"
          value={fmtMoney(p.releasedAmount)}
          hint={`${Math.round((p.releasedAmount / p.totalBudget) * 100)}% من الميزانية`}
          icon={<Coins className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="المتبقي محجوز"
          value={fmtMoney(remaining)}
          hint="بانتظار اكتمال المراحل"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="مراحل مكتملة"
          value={`${p.phases.filter((x) => x.status === "completed").length} / ${p.phases.length}`}
          icon={<Layers className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="طلبات بانتظار الموافقة"
          value={pendingPayments.length}
          hint="تحتاج مراجعتك"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      {/* Visual analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="مصروفات المشروع شهرياً" subtitle="بآلاف الريالات">
            <AreaChart
              tone="primary"
              formatValue={(v) => fmtMoney(v)}
              data={[
                { label: "ديسمبر", value: 2.4 },
                { label: "يناير", value: 4.2 },
                { label: "فبراير", value: 6.8 },
                { label: "مارس", value: 3.6 },
                { label: "أبريل", value: 2.2 },
              ]}
            />
          </SectionCard>
        </div>
        <SectionCard title="نسبة الإنجاز" subtitle="توزيع حالات المراحل">
          <div className="flex flex-col items-center gap-5">
            <ProgressRing value={p.overallProgress} size={130} tone="primary" label="إنجاز كلي" />
            <div className="h-px w-full bg-border" />
            <DonutChart
              size={130}
              centerLabel="مرحلة"
              centerValue={`${p.phases.filter((x) => x.status === "completed").length}/${p.phases.length}`}
              data={[
                { label: "مكتملة", value: p.phases.filter((x) => x.status === "completed").length, tone: "primary" },
                { label: "قيد التنفيذ", value: p.phases.filter((x) => x.status === "in_progress").length || 1, tone: "accent" },
                { label: "بانتظار", value: p.phases.filter((x) => x.status === "awaiting_funding").length || 1, tone: "danger" },
                { label: "مقفلة", value: p.phases.filter((x) => x.status === "locked").length || 1, tone: "info" },
              ]}
            />
          </div>
        </SectionCard>
      </div>
      {/* Phases */}
      <SectionCard
        title="مراحل المشروع"
        subtitle="لا تبدأ المرحلة التالية إلا بعد تأمين قيمتها المالية"
      >
        <div className="space-y-3">
          {p.phases.map((ph, idx) => (
            <div
              key={ph.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3 md:w-72">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    ph.status === "completed"
                      ? "bg-primary text-primary-foreground"
                      : ph.status === "in_progress"
                        ? "bg-amber-400 text-white"
                        : "bg-muted text-foreground/60"
                  }`}
                >
                  {ph.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink">{ph.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    استحقاق: {ph.dueDate}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>التقدم</span>
                  <span className="text-ink">{ph.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${ph.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:w-56 md:justify-end">
                <div className="text-sm font-extrabold text-ink">{fmtMoney(ph.amount)}</div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[ph.status]}`}
                >
                  {STATUS_LABEL[ph.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Pending payments */}
      <SectionCard
        title="طلبات الدفع بانتظارك"
        subtitle="راجع التقارير ثم حرّر الدفعة لبدء المرحلة التالية"
      >
        {pendingPayments.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            لا توجد طلبات بانتظار الموافقة حالياً.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div className="font-bold text-ink">{req.phase}</div>
                    <Pill tone="info">{req.id}</Pill>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {req.contractor} — {req.submittedAt}
                  </div>
                </div>
                <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground transition hover:border-rose-400 hover:text-rose-600">
                    رفض
                  </button>
                  <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95">
                    تحرير الدفعة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
