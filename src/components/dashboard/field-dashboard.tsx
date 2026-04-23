import { useMemo, useState } from "react";
import { AlertCircle, Calendar, Clock, HardHat, MapPin, Plus } from "lucide-react";
import {
  reportSchedule,
  reportsForFieldEngineer,
  ROLE_USER,
  useWorkflow,
  type FieldReportDoc,
  type ProjectDoc,
} from "@/lib/workflow-store";
import { Pill, SectionCard, StatCard } from "./dashboard-ui";
import { AddReportDialog, ReportRow, ReportViewerDialog } from "./reports-shared";
import { FieldEngineerAcceptDialog, ProjectStatusPill } from "./project-flow-shared";

export function FieldDashboard() {
  const store = useWorkflow();
  const engineerName = ROLE_USER.field;
  const [addOpen, setAddOpen] = useState(false);
  const [openReport, setOpenReport] = useState<FieldReportDoc | null>(null);
  const [acceptProject, setAcceptProject] = useState<ProjectDoc | null>(null);

  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Projects assigned to me but not yet accepted
  const pendingAcceptance = useMemo(
    () =>
      store.projects.filter(
        (p) => p.fieldEngineerName === engineerName && !p.fieldEngineerAcceptedAt,
      ),
    [store.projects, engineerName],
  );

  // Active projects for this engineer (accepted)
  const myProjects = useMemo(
    () =>
      store.projects.filter(
        (p) =>
          p.fieldEngineerName === engineerName &&
          !!p.fieldEngineerAcceptedAt &&
          (p.status === "in_progress" || p.status === "verifying_payment"),
      ),
    [store.projects, engineerName],
  );

  const myReports = useMemo(
    () => reportsForFieldEngineer(store, engineerName),
    [store, engineerName],
  );

  const todayCount = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return myReports.filter((r) => r.date.slice(0, 10) === d).length;
  }, [myReports]);

  const weekCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    return myReports.filter((r) => new Date(r.date).getTime() >= weekAgo).length;
  }, [myReports]);

  const lateReports = useMemo(
    () =>
      myReports.filter((r) => {
        const s = reportSchedule(r);
        return r.status === "pending" && s.state === "late";
      }),
    [myReports],
  );

  const upcoming = useMemo(
    () =>
      myReports.filter((r) => {
        const s = reportSchedule(r);
        return r.status === "pending" && s.state === "soon";
      }),
    [myReports],
  );

  const projectName = (id: string) => store.projects.find((p) => p.id === id)?.name;
  const primary = myProjects[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl border border-border bg-gradient-to-l from-purple-500/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-purple-600">جولة اليوم</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{today}</h1>
            {primary && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {primary.name} — {primary.city}
                </span>
              </div>
            )}
          </div>
          {myProjects.length > 0 && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
            >
              <Plus className="h-4 w-4" /> رفع تقرير جديد
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="تقاريري اليوم" value={todayCount} icon={<Calendar className="h-5 w-5" />} />
        <StatCard
          label="هذا الأسبوع"
          value={weekCount}
          tone="primary"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="متأخرة"
          value={lateReports.length}
          tone="danger"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* Alerts: late + upcoming */}
      {(lateReports.length > 0 || upcoming.length > 0) && (
        <SectionCard
          title="تنبيهات الجدولة"
          subtitle="تقارير دورية اقترب موعدها أو متأخرة عن الرفع"
        >
          <div className="space-y-3">
            {lateReports.map((r) => {
              const s = reportSchedule(r);
              return (
                <button
                  key={r.id}
                  onClick={() => setOpenReport(r)}
                  className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-right transition hover:border-rose-400"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-rose-700">{r.title}</span>
                      <Pill tone="danger">متأخر {Math.abs(s.daysOff)} يوم</Pill>
                    </div>
                    <div className="text-[11px] text-rose-600/70">{projectName(r.projectId)}</div>
                  </div>
                </button>
              );
            })}
            {upcoming.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenReport(r)}
                className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-right transition hover:border-amber-400"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-800">{r.title}</span>
                    <Pill tone="accent">قريب الموعد</Pill>
                  </div>
                  <div className="text-[11px] text-amber-700/70">{projectName(r.projectId)}</div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="آخر تقاريري">
        {myReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لم ترفع أي تقرير بعد. اضغط "رفع تقرير جديد" لتبدأ.
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.slice(0, 6).map((r) => (
              <ReportRow
                key={r.id}
                report={r}
                projectName={projectName(r.projectId)}
                onOpen={() => setOpenReport(r)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {addOpen && (
        <AddReportDialog
          projects={myProjects}
          engineerName={engineerName}
          onClose={() => setAddOpen(false)}
        />
      )}
      {openReport && (
        <ReportViewerDialog
          report={openReport}
          project={store.projects.find((p) => p.id === openReport.projectId)}
          onClose={() => setOpenReport(null)}
        />
      )}
    </div>
  );
}
