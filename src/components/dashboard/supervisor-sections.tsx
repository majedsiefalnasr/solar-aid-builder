import { Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  HardHat,
  MapPin,
  UserPlus,
  XCircle,
} from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT } from "@/lib/dashboard-data";
import { SupervisorDashboard } from "./supervisor-dashboard";
import { Pill, SectionCard, StatCard } from "./dashboard-ui";
import { PageHeader } from "./section-shell";

import { ProjectDetail } from "./project-detail";

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
                  <h3 className="mt-1 text-lg font-extrabold text-ink group-hover:text-primary">
                    {p.name}
                  </h3>
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
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-sky-500 to-sky-300"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 transition group-hover:opacity-100">
                فتح تفاصيل المشروع ←
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}

const ASSIGNMENT_REQUESTS = [
  {
    id: "ASN-501",
    project: "محل تجاري — حي السلام",
    owner: "فهد المنصور",
    type: "مهندس مشرف",
    submittedAt: "2026-04-22",
  },
  {
    id: "ASN-502",
    project: "فيلا الشاطئ — المكلا",
    owner: "ريم العولقي",
    type: "مهندس مشرف",
    submittedAt: "2026-04-21",
  },
];

function SupervisorAssignments() {
  return (
    <>
      <PageHeader title="طلبات التعيين" subtitle="طلبات الإشراف الجديدة المُسندة إليك من المنصة" />
      <SectionCard title="طلبات بانتظار قرارك">
        <div className="space-y-3">
          {ASSIGNMENT_REQUESTS.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
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
                <button className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground hover:border-rose-400 hover:text-rose-600">
                  رفض
                </button>
                <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta">
                  قبول
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

const FIELD_TEAM = [
  {
    name: "م. سامي الحاج",
    project: "فيلا الياسمين",
    reportsThisWeek: 8,
    status: "active" as const,
  },
  {
    name: "م. ياسر القباطي",
    project: "فيلا الياسمين",
    reportsThisWeek: 5,
    status: "active" as const,
  },
  { name: "م. أمل الزبيدي", project: "مجمع النور", reportsThisWeek: 3, status: "leave" as const },
];

function SupervisorFieldTeam() {
  return (
    <>
      <PageHeader
        title="الفريق الميداني"
        subtitle="المهندسون الميدانيون العاملون تحت إشرافك"
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta">
            <UserPlus className="h-3.5 w-3.5" /> إضافة عضو
          </button>
        }
      />

      <SectionCard title="فريقك">
        <div className="space-y-3">
          {FIELD_TEAM.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
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
    </>
  );
}

function SupervisorApprovals() {
  const pending = FIELD_REPORTS.filter((r) => r.status === "pending");
  const approved = FIELD_REPORTS.filter((r) => r.status === "approved");
  const rejected = FIELD_REPORTS.filter((r) => r.status === "rejected");

  return (
    <>
      <PageHeader title="الاعتمادات" subtitle="جميع التقارير الميدانية ودفعات المراحل" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="بانتظار اعتمادك"
          value={pending.length}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="معتمدة"
          value={approved.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="مرفوضة"
          value={rejected.length}
          icon={<XCircle className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <SectionCard title="آخر التقارير">
        <div className="space-y-3">
          {FIELD_REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
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
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {r.engineer} • {r.date} • 📷 {r.photos}
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold hover:border-rose-400 hover:text-rose-600">
                    رفض
                  </button>
                  <button className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta">
                    اعتماد
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="hidden">{MOCK_PROJECT.id}</div>
    </>
  );
}
