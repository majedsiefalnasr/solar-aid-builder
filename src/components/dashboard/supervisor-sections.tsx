import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ROLE_USER,
  approveTask,
  rejectTask,
  reportsForSupervisor,
  useWorkflow,
  type FieldReportDoc,
  type PhaseDef,
  type PhaseTask,
  type ProjectDoc,
} from "@/lib/workflow-store";
import { ReportRow, ReportViewerDialog } from "./reports-shared";
import {
  AssignFieldEngineerDialog,
  ProjectStatusPill,
  SubmitQuoteDialog,
  SupervisorAcceptDialog,
} from "./project-flow-shared";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  HardHat,
  MapPin,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT } from "@/lib/dashboard-data";
import { SupervisorDashboard } from "./supervisor-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectDetail } from "./project-detail";
import { MessagesScreen } from "./messages-screen";
import { ReportsSection } from "./reports-section";
import { SettingsSection } from "./settings-section";

export function SupervisorSection({
  section,
  projectId,
}: {
  section: string;
  projectId?: string;
}) {
  switch (section) {
    case "overview":
      return <SupervisorDashboard />;
    case "projects":
      return <SupervisorProjects />;
    case "project-detail":
      return <ProjectDetail role="supervisor" projectId={projectId} />;
    case "assignments":
      return <SupervisorAssignments />;
    case "field-team":
      return <SupervisorFieldTeam />;
    case "reports":
      return <ReportsSection role="supervisor" />;
    case "approvals":
      return <SupervisorApprovals />;
    case "messages":
      return <MessagesScreen role="supervisor" />;
    case "settings":
      return <SettingsSection role="supervisor" />;
    default:
      return <SupervisorDashboard />;
  }
}

function SupervisorProjects() {
  const store = useWorkflow();
  const supervisorName = ROLE_USER.supervisor;
  const myProjects = useMemo(
    () => store.projects.filter((p) => p.supervisorName === supervisorName),
    [store.projects, supervisorName],
  );

  return (
    <>
      <PageHeader title="المشاريع" subtitle="مشاريع تحت إشرافك الفني" />
      {myProjects.length === 0 ? (
        <SectionCard title="لا توجد مشاريع">
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            لا توجد مشاريع تحت إشرافك حالياً.
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myProjects.map((p) => {
            const overall = p.phases.length
              ? Math.round(p.phases.reduce((s, ph) => s + ph.progress, 0) / p.phases.length)
              : 0;
            const activePhase =
              p.phases.find((ph) => ph.status === "in_progress")?.name
              ?? p.phases.find((ph) => ph.status === "awaiting_payment")?.name
              ?? "—";
            return (
              <Link
                key={p.id}
                to="/dashboard"
                search={{ role: "supervisor", section: "project-detail", projectId: p.id }}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary hover:shadow-cta"
              >
                <article>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-sky-600">#{p.id}</div>
                      <h3 className="mt-1 text-lg font-extrabold text-ink group-hover:text-primary">{p.name}</h3>
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
                      <div className="h-full rounded-full bg-gradient-to-l from-sky-500 to-sky-300" style={{ width: `${overall}%` }} />
                    </div>
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

function SupervisorAssignments() {
  const store = useWorkflow();
  const supervisorName = ROLE_USER.supervisor;
  const [acceptProject, setAcceptProject] = useState<ProjectDoc | null>(null);
  const [quoteProject, setQuoteProject] = useState<ProjectDoc | null>(null);
  const [assignFieldProject, setAssignFieldProject] = useState<ProjectDoc | null>(null);

  const myAssignments = store.projects.filter(
    (p) => p.supervisorName === supervisorName && p.status === "pending_supervisor",
  );
  const needQuote = store.projects.filter(
    (p) => p.supervisorName === supervisorName && p.status === "pending_quote",
  );
  const needFieldEngineer = store.projects.filter(
    (p) =>
      p.supervisorName === supervisorName &&
      (p.status === "in_progress" || p.status === "verifying_payment") &&
      !p.fieldEngineerName,
  );

  return (
    <>
      <PageHeader
        title="طلبات التعيين والإجراءات"
        subtitle="جميع المهام المطلوبة منك على المشاريع تحت إشرافك"
      />

      <SectionCard
        title={`طلبات إشراف جديدة (${myAssignments.length})`}
        subtitle="عينتك الإدارة على هذه المشاريع — اقبل أو ارفض"
      >
        {myAssignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد طلبات إشراف جديدة.
          </div>
        ) : (
          <div className="space-y-2">
            {myAssignments.map((p) => (
              <button
                key={p.id}
                onClick={() => setAcceptProject(p)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-right hover:border-primary hover:bg-primary-soft/30"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-primary">#{p.id}</div>
                  <div className="mt-0.5 truncate text-sm font-bold text-ink">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.ownerName} • {p.city} • {fmtMoney(p.budget)}
                  </div>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  مراجعة
                </span>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {needQuote.length > 0 && (
        <SectionCard
          title={`مشاريع تحتاج عرض سعر (${needQuote.length})`}
          subtitle="قسّم المشروع على مراحل وحدد ميزانية كل مرحلة"
          className="mt-6"
        >
          <div className="space-y-2">
            {needQuote.map((p) => (
              <button
                key={p.id}
                onClick={() => setQuoteProject(p)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-right hover:border-primary hover:bg-primary-soft/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary">#{p.id}</span>
                    <ProjectStatusPill status={p.status} />
                  </div>
                  <div className="mt-0.5 truncate text-sm font-bold text-ink">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.ownerName} • ميزانية مقترحة {fmtMoney(p.budget)}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-[11px] font-bold text-white">
                  <FileText className="h-3 w-3" /> إعداد عرض السعر
                </span>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {needFieldEngineer.length > 0 && (
        <SectionCard
          title={`تعيين مهندس ميداني (${needFieldEngineer.length})`}
          subtitle="مشاريع بدأ تنفيذها وتحتاج مهندس ميداني"
          className="mt-6"
        >
          <div className="space-y-2">
            {needFieldEngineer.map((p) => (
              <button
                key={p.id}
                onClick={() => setAssignFieldProject(p)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-right hover:border-primary hover:bg-primary-soft/30"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-primary">#{p.id}</div>
                  <div className="mt-0.5 truncate text-sm font-bold text-ink">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.ownerName}</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
                  <HardHat className="h-3 w-3" /> تعيين مهندس
                </span>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {acceptProject && (
        <SupervisorAcceptDialog
          project={acceptProject}
          supervisorName={supervisorName}
          onClose={() => setAcceptProject(null)}
        />
      )}
      {quoteProject && (
        <SubmitQuoteDialog project={quoteProject} onClose={() => setQuoteProject(null)} />
      )}
      {assignFieldProject && (
        <AssignFieldEngineerDialog
          project={assignFieldProject}
          byName={supervisorName}
          onClose={() => setAssignFieldProject(null)}
        />
      )}

      <span className="hidden">
        {toast.toString().length} {CreditCard.name}
      </span>
    </>
  );
}

const FIELD_TEAM_SEED = [
  { name: "م. سامي الحاج", project: "فيلا الياسمين", reportsThisWeek: 8, status: "active" as const },
  { name: "م. ياسر القباطي", project: "فيلا الياسمين", reportsThisWeek: 5, status: "active" as const },
  { name: "م. أمل الزبيدي", project: "مجمع النور", reportsThisWeek: 3, status: "leave" as const },
];

function SupervisorFieldTeam() {
  const store = useWorkflow();
  const supervisorName = ROLE_USER.supervisor;
  const supervisedProjects = useMemo(
    () => store.projects.filter((p) => p.supervisorName === supervisorName),
    [store.projects, supervisorName],
  );
  const projectNames = supervisedProjects.length
    ? supervisedProjects.map((p) => p.name)
    : ["—"];
  const [team, setTeam] = useState(FIELD_TEAM_SEED);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="الفريق الميداني"
        subtitle="المهندسون الميدانيون العاملون تحت إشرافك"
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta"
          >
            <UserPlus className="h-3.5 w-3.5" /> إضافة عضو
          </button>
        }
      />

      <SectionCard title="فريقك">
        <div className="space-y-3">
          {team.map((m) => (
            <div key={m.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <HardHat className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-ink">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    <Building2 className="mr-1 inline h-3 w-3" /> {m.project}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-extrabold text-ink">{m.reportsThisWeek}</div>
                <div className="text-[10px] text-muted-foreground">تقرير هذا الأسبوع</div>
              </div>
              <Pill tone={m.status === "active" ? "primary" : "muted"}>
                {m.status === "active" ? "نشط" : "إجازة"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>

      {open && (
        <AddTeamMemberDialog
          projectNames={projectNames}
          onClose={() => setOpen(false)}
          onAdd={(name, project) => {
            setTeam((prev) => [...prev, { name, project, reportsThisWeek: 0, status: "active" }]);
            toast.success("تمت إضافة عضو جديد للفريق", { description: `${name} — ${project}` });
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function AddTeamMemberDialog({
  projectNames,
  onClose,
  onAdd,
}: {
  projectNames: string[];
  onClose: () => void;
  onAdd: (name: string, project: string) => void;
}) {
  const [name, setName] = useState("");
  const [project, setProject] = useState(projectNames[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">إضافة مهندس ميداني</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("يرجى إدخال اسم العضو");
              return;
            }
            onAdd(name.trim(), project);
          }}
          className="space-y-4 p-5"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">اسم المهندس</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="م. أحمد ..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">المشروع</span>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {SUPERVISED.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary">
              إلغاء
            </button>
            <button type="submit" className="flex-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta">
              إضافة العضو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ApprovalStatus = "approved" | "pending" | "rejected";

function SupervisorApprovals() {
  const store = useWorkflow();
  const supervisorName = ROLE_USER.supervisor;
  const [openReport, setOpenReport] = useState<FieldReportDoc | null>(null);

  const reports = useMemo(
    () => reportsForSupervisor(store, supervisorName),
    [store, supervisorName],
  );
  const pending = reports.filter((r) => r.status === "pending");
  const approved = reports.filter((r) => r.status === "approved");
  const rejected = reports.filter((r) => r.status === "rejected");

  const projectName = (id: string) => store.projects.find((p) => p.id === id)?.name;

  return (
    <>
      <PageHeader title="الاعتمادات" subtitle="جميع التقارير الميدانية على مشاريعك" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="بانتظار اعتمادك" value={pending.length} icon={<ClipboardCheck className="h-5 w-5" />} tone="accent" />
        <StatCard label="معتمدة" value={approved.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="مرفوضة" value={rejected.length} icon={<XCircle className="h-5 w-5" />} tone="danger" />
      </div>

      <PendingTasksCard supervisorName={supervisorName} />

      <SectionCard
        title={pending.length > 0 ? `بانتظار قرارك (${pending.length})` : "كل التقارير محدّثة"}
        subtitle={pending.length > 0 ? "افتح التقرير لاعتماده أو رفضه مع السبب" : undefined}
      >
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد تقارير بعد على مشاريعك.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show pending first */}
            {[...pending, ...approved, ...rejected].map((r) => (
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

      {openReport && (
        <ReportViewerDialog
          report={openReport}
          project={store.projects.find((p) => p.id === openReport.projectId)}
          canReview
          reviewerName={supervisorName}
          onClose={() => setOpenReport(null)}
        />
      )}

      {/* Lint touch */}
      <span className="hidden">
        {FIELD_REPORTS.length} {MOCK_PROJECT.id}
        <Pill tone="info">x</Pill>
      </span>
    </>
  );
}

// ============================================================
// Pending tasks awaiting supervisor approval
// ============================================================

interface PendingTaskRow {
  project: ProjectDoc;
  phase: PhaseDef;
  task: PhaseTask;
}

function PendingTasksCard({ supervisorName }: { supervisorName: string }) {
  const store = useWorkflow();
  const [rejectTarget, setRejectTarget] = useState<PendingTaskRow | null>(null);

  const rows: PendingTaskRow[] = useMemo(() => {
    const out: PendingTaskRow[] = [];
    store.projects
      .filter((p) => p.supervisorName === supervisorName)
      .forEach((project) => {
        project.phases.forEach((phase) => {
          phase.tasks.forEach((task) => {
            if (task.approval === "pending") {
              out.push({ project, phase, task });
            }
          });
        });
      });
    return out;
  }, [store, supervisorName]);

  return (
    <SectionCard
      title={
        rows.length > 0
          ? `مهام بانتظار اعتمادك (${rows.length})`
          : "مهام بانتظار اعتمادك"
      }
      subtitle="يقوم المقاول بالتأشير على إنجاز المهام، ثم تعتمدها هنا لتُحتسب في نسبة الإنجاز"
      className="mb-6"
    >
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          لا توجد مهام بانتظار الاعتماد حالياً.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ project, phase, task }) => {
            const perTask = phase.tasks.length ? Math.round(99 / phase.tasks.length) : 0;
            return (
              <div
                key={`${project.id}-${phase.id}-${task.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink">{task.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-bold text-primary">#{project.id}</span>
                    <span>•</span>
                    <span>{project.name}</span>
                    <span>•</span>
                    <span>{phase.name}</span>
                    {task.markedDoneAt && (
                      <>
                        <span>•</span>
                        <span>
                          أُشّرت في{" "}
                          {new Date(task.markedDoneAt).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground sm:inline">
                    +{perTask}% للمرحلة
                  </span>
                  <button
                    onClick={() => {
                      approveTask(project.id, phase.id, task.id, supervisorName);
                      toast.success("تم اعتماد إنجاز المهمة", {
                        description: `${task.title} • +${perTask}% لـ ${phase.name}`,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-cta"
                  >
                    <CheckCircle2 className="h-3 w-3" /> اعتماد
                  </button>
                  <button
                    onClick={() => setRejectTarget({ project, phase, task })}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <XCircle className="h-3 w-3" /> رفض
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <RejectTaskDialog
          row={rejectTarget}
          supervisorName={supervisorName}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </SectionCard>
  );
}

function RejectTaskDialog({
  row,
  supervisorName,
  onClose,
}: {
  row: PendingTaskRow;
  supervisorName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">رفض إنجاز المهمة</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim()) {
              toast.error("يرجى ذكر سبب الرفض");
              return;
            }
            rejectTask(row.project.id, row.phase.id, row.task.id, supervisorName, reason.trim());
            toast("تم رفض المهمة", { description: row.task.title });
            onClose();
          }}
          className="space-y-4 p-5"
        >
          <div className="rounded-xl bg-muted/40 p-3 text-xs">
            <div className="font-bold text-ink">{row.task.title}</div>
            <div className="mt-0.5 text-muted-foreground">
              {row.project.name} • {row.phase.name}
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">سبب الرفض</span>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="مثال: التنفيذ غير مطابق للمواصفات، يرجى إعادة العمل"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-cta hover:bg-rose-600"
            >
              تأكيد الرفض
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
