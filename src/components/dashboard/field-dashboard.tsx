import { Camera, MapPin, Mic, Upload } from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT } from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard } from "./dashboard-ui";

export function FieldDashboard() {
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-l from-purple-500/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="text-xs font-bold text-purple-600">جولة اليوم</div>
        <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{today}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{MOCK_PROJECT.name} — {MOCK_PROJECT.city}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="تقاريري اليوم" value="3" />
        <StatCard label="هذا الأسبوع" value="12" tone="primary" />
        <StatCard label="صور مرفوعة" value="48" tone="accent" />
      </div>

      <SectionCard
        title="رفع تقرير سريع من الموقع"
        subtitle="مصمم للاستخدام من الجوال مباشرة"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">المرحلة</span>
            <select className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none">
              {MOCK_PROJECT.phases.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-6 transition hover:border-primary hover:bg-primary-soft/40">
              <Camera className="h-7 w-7 text-primary" />
              <span className="text-xs font-bold text-ink">التقاط صورة</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-6 transition hover:border-primary hover:bg-primary-soft/40">
              <Upload className="h-7 w-7 text-primary" />
              <span className="text-xs font-bold text-ink">رفع من المعرض</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-6 transition hover:border-primary hover:bg-primary-soft/40">
              <Mic className="h-7 w-7 text-primary" />
              <span className="text-xs font-bold text-ink">ملاحظة صوتية</span>
            </button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">وصف موجز</span>
            <textarea
              rows={3}
              placeholder="ما الذي تم اليوم؟"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95">
            إرسال للمشرف
          </button>
        </div>
      </SectionCard>

      <SectionCard title="آخر تقاريري">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Pill tone="info">{r.id}</Pill>
                  <span className="text-sm font-bold text-ink">{r.phase}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.note}</p>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {r.date} • 📷 {r.photos}
                </div>
              </div>
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
                    ? "بحاجة تعديل"
                    : "قيد المراجعة"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
