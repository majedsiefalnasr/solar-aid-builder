import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Eye, MapPin } from "lucide-react";
import { ROLE_USER, useWorkflow } from "@/lib/workflow-store";
import { FieldDashboard } from "./field-dashboard";
import { ReportsSection } from "./reports-section";
import { MessagesScreen } from "./messages-screen";
import { SettingsSection } from "./settings-section";
import { ProjectDetail } from "./project-detail";
import { Pill, SectionCard } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectStatusPill } from "./project-flow-shared";

export function FieldSection({
  section,
  projectId,
}: {
  section: string;
  projectId?: string;
}) {
  switch (section) {
    case "overview":
      return <FieldDashboard />;
    case "projects":
      return <FieldProjects />;
    case "project-detail":
      return <ProjectDetail role="field" projectId={projectId} />;
    case "reports":
      return <ReportsSection role="field" />;
    case "messages":
      return <MessagesScreen role="field" />;
    case "settings":
      return <SettingsSection role="field" />;
    default:
      return <FieldDashboard />;
  }
}

function FieldProjects() {
  const store = useWorkflow();
  const engineerName = ROLE_USER.field;
  const myProjects = useMemo(
    () => store.projects.filter((p) => p.fieldEngineerName === engineerName),
    [store.projects, engineerName],
  );

  return (
    <>
      <PageHeader title="مشاريعي" subtitle="جميع المشاريع المسندة إليك" />
      {myProjects.length === 0 ? (
        <SectionCard title="لا توجد مشاريع">
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            لم يتم تعيينك على أي مشروع بعد.
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myProjects.map((p) => {
            const overall = p.phases.length
              ? Math.round(p.phases.reduce((s, ph) => s + ph.progress, 0) / p.phases.length)
              : 0;
            const activePhase =
              p.phases.find((ph) => ph.status === "in_progress")?.name ?? "—";
            return (
              <Link
                key={p.id}
                to="/dashboard"
                search={{ role: "field", section: "project-detail", projectId: p.id }}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary hover:shadow-cta"
              >
                <article>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-primary">#{p.id}</div>
                      <h3 className="mt-1 text-lg font-extrabold text-ink group-hover:text-primary">
                        {p.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.city}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ProjectStatusPill status={p.status} />
                      {activePhase !== "—" && <Pill tone="info">{activePhase}</Pill>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>الإنجاز</span>
                      <span className="text-ink">{overall}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
                        style={{ width: `${overall}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:bg-primary-soft hover:text-primary">
                    <Eye className="h-3.5 w-3.5" />
                    فتح تفاصيل المشروع
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
