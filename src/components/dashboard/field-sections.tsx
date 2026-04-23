import { FIELD_REPORTS } from "@/lib/dashboard-data";
import { FieldDashboard } from "./field-dashboard";
import { Pill, SectionCard } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { MessagesScreen } from "./messages-screen";

export function FieldSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <FieldDashboard />;
    case "reports":
      return <FieldReports />;
    case "messages":
      return <MessagesScreen role="field" />;
    default:
      return <FieldDashboard />;
  }
}

function FieldReports() {
  return (
    <>
      <PageHeader title="تقاريري" subtitle="جميع التقارير التي رفعتها من الموقع" />
      <SectionCard title="السجل الكامل">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Pill tone="info">{r.id}</Pill>
                  <span className="text-sm font-bold text-ink">{r.phase}</span>
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
              <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {r.date} • 📷 {r.photos} صورة
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
