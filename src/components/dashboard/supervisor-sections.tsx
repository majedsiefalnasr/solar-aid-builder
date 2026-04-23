import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  HardHat,
  MapPin,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT } from "@/lib/dashboard-data";
import { SupervisorDashboard } from "./supervisor-dashboard";
import { Pill, SectionCard, StatCard } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectDetail } from "./project-detail";
import { MessagesScreen } from "./messages-screen";
import { ReportsSection } from "./reports-section";

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
    default:
      return <SupervisorDashboard />;
  }
}

const SUPERVISED = [
  { id: "PRJ-2041", name: "فيلا الياسمين", city: "صنعاء", phase: "البناء بالطوب", progress: 42 },
  { id: "PRJ-2055", name: "شقة المعلا", city: "عدن", phase: "الأساسات", progress: 28 },
  { id: "PRJ-2099", name: "مجمع النور التجاري", city: "صنعاء", phase: "الحفر", progress: 18 },
];

function SupervisorProjects() {
  return (
    <>
      <PageHeader title="المشاريع" subtitle="مشاريع تحت إشرافك الفني" />
      <div className="grid gap-4 lg:grid-cols-2">
        {SUPERVISED.map((p) => (
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
                <Pill tone="info">{p.phase}</Pill>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>الإنجاز</span>
                  <span className="text-ink">{p.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-l from-sky-500 to-sky-300" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}

const ASSIGNMENT_REQUESTS = [
  { id: "ASN-501", project: "محل تجاري — حي السلام", owner: "فهد المنصور", type: "مهندس مشرف", submittedAt: "2026-04-22" },
  { id: "ASN-502", project: "فيلا الشاطئ — المكلا", owner: "ريم العولقي", type: "مهندس مشرف", submittedAt: "2026-04-21" },
];

function SupervisorAssignments() {
  const [items, setItems] = useState(ASSIGNMENT_REQUESTS);
  const accept = (id: string, project: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.success("تم قبول طلب التعيين", { description: `${id} — ${project}` });
  };
  const reject = (id: string, project: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.error("تم رفض طلب التعيين", { description: `${id} — ${project}` });
  };
  return (
    <>
      <PageHeader title="طلبات التعيين" subtitle="طلبات الإشراف الجديدة المُسندة إليك من المنصة" />
      <SectionCard title="طلبات بانتظار قرارك">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد طلبات تعيين بانتظارك حالياً.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Pill tone="info">{r.id}</Pill>
                    <span className="text-sm font-bold text-ink">{r.project}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    المالك: {r.owner} • {r.type} • {r.submittedAt}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => reject(r.id, r.project)}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground hover:border-rose-400 hover:text-rose-600"
                  >
                    رفض
                  </button>
                  <button
                    onClick={() => accept(r.id, r.project)}
                    className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta"
                  >
                    قبول
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}

const FIELD_TEAM_SEED = [
  { name: "م. سامي الحاج", project: "فيلا الياسمين", reportsThisWeek: 8, status: "active" as const },
  { name: "م. ياسر القباطي", project: "فيلا الياسمين", reportsThisWeek: 5, status: "active" as const },
  { name: "م. أمل الزبيدي", project: "مجمع النور", reportsThisWeek: 3, status: "leave" as const },
];

function SupervisorFieldTeam() {
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
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, project: string) => void;
}) {
  const [name, setName] = useState("");
  const [project, setProject] = useState(SUPERVISED[0].name);
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
  const [status, setStatus] = useState<Record<string, ApprovalStatus>>(() =>
    Object.fromEntries(FIELD_REPORTS.map((r) => [r.id, r.status])),
  );
  const pending = FIELD_REPORTS.filter((r) => status[r.id] === "pending");
  const approved = FIELD_REPORTS.filter((r) => status[r.id] === "approved");
  const rejected = FIELD_REPORTS.filter((r) => status[r.id] === "rejected");

  const approve = (id: string, phase: string) => {
    setStatus((s) => ({ ...s, [id]: "approved" }));
    toast.success("تم اعتماد التقرير", { description: `${id} — ${phase}` });
  };
  const reject = (id: string, phase: string) => {
    setStatus((s) => ({ ...s, [id]: "rejected" }));
    toast.error("تم رفض التقرير", { description: `${id} — ${phase} • تم إعلام المهندس الميداني` });
  };

  return (
    <>
      <PageHeader title="الاعتمادات" subtitle="جميع التقارير الميدانية ودفعات المراحل" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="بانتظار اعتمادك" value={pending.length} icon={<ClipboardCheck className="h-5 w-5" />} tone="accent" />
        <StatCard label="معتمدة" value={approved.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="مرفوضة" value={rejected.length} icon={<XCircle className="h-5 w-5" />} tone="danger" />
      </div>

      <SectionCard title="آخر التقارير">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => {
            const st = status[r.id];
            return (
              <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pill tone="info">{r.id}</Pill>
                    <span className="text-sm font-bold text-ink">{r.phase}</span>
                    <Pill tone={st === "approved" ? "primary" : st === "rejected" ? "danger" : "accent"}>
                      {st === "approved" ? "معتمد" : st === "rejected" ? "مرفوض" : "بانتظار"}
                    </Pill>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {r.engineer} • {r.date} • 📷 {r.photos}
                  </div>
                </div>
                {st === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(r.id, r.phase)}
                      className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold hover:border-rose-400 hover:text-rose-600"
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => approve(r.id, r.phase)}
                      className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta"
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

      <div className="hidden">{MOCK_PROJECT.id}</div>
    </>
  );
}
