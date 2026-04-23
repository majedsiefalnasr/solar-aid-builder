import { Camera, FileUp, HardHat, Hourglass, Send, Wallet } from "lucide-react";
import {
  FIELD_REPORTS,
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
} from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";

export function ContractorDashboard() {
  const activePhase = MOCK_PROJECT.phases.find((p) => p.status === "in_progress");
  const collected = PAYMENT_REQUESTS.filter((x) => x.status === "released").reduce(
    (s, x) => s + x.amount,
    0,
  );
  const inReview = PAYMENT_REQUESTS.filter(
    (x) => x.status === "pending" || x.status === "approved",
  ).reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-l from-accent/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-accent">المرحلة النشطة</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">
              {activePhase?.name ?? "—"}
            </h1>
            <div className="mt-2 text-xs text-muted-foreground">
              مشروع: {MOCK_PROJECT.name}
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-muted-foreground">قيمة المرحلة</div>
            <div className="text-2xl font-extrabold text-ink">
              {activePhase ? fmtMoney(activePhase.amount) : "—"}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">تقدم المرحلة</span>
            <span className="text-ink">{activePhase?.progress ?? 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-accent to-orange-300"
              style={{ width: `${activePhase?.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="مستحقات محصّلة"
          value={fmtMoney(collected)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="بانتظار التحرير"
          value={fmtMoney(inReview)}
          icon={<Hourglass className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="عمالة بالموقع"
          value="24"
          hint="نشطون اليوم"
          icon={<HardHat className="h-5 w-5" />}
        />
        <StatCard
          label="تقاريري الأخيرة"
          value={FIELD_REPORTS.length}
          icon={<FileUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="رفع تقرير إنجاز"
          subtitle="أرفق صور وفيديو لإثبات نسبة الإنجاز"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">المرحلة</span>
              <select className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                {MOCK_PROJECT.phases
                  .filter((p) => p.status === "in_progress" || p.status === "awaiting_funding")
                  .map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">نسبة الإنجاز اليوم</span>
              <input
                type="number"
                placeholder="مثال: 65"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">ملاحظات</span>
              <textarea
                rows={3}
                placeholder="اكتب وصفاً للعمل المنجز…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background py-6 text-center transition hover:border-primary">
              <Camera className="h-7 w-7 text-muted-foreground" />
              <span className="mt-1.5 text-sm font-bold text-ink">إرفاق صور</span>
              <span className="text-[11px] text-muted-foreground">حتى 20 صورة</span>
              <input type="file" multiple className="hidden" />
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95">
              <Send className="h-4 w-4" />
              رفع التقرير للمراجعة
            </button>
          </div>
        </SectionCard>

        <SectionCard title="حالة طلبات الدفع">
          <div className="space-y-3">
            {PAYMENT_REQUESTS.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-ink">{req.phase}</div>
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
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{req.submittedAt}</span>
                  <span className="font-extrabold text-ink">{fmtMoney(req.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
