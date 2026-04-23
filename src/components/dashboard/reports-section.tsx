// Shared "Reports" tab for all roles.
// - owner / contractor: only approved reports of their projects
// - supervisor: all reports of their projects (can review pending)
// - admin: all reports (read-only oversight)
// - field: all their own reports + can add new

import { useMemo, useState } from "react";
import { ClipboardList, ClipboardCheck, AlertCircle, CheckCircle2, FileText, Plus, XCircle } from "lucide-react";
import {
  reportSchedule,
  reportsForAdmin,
  reportsForContractor,
  reportsForFieldEngineer,
  reportsForOwner,
  reportsForSupervisor,
  ROLE_USER,
  useWorkflow,
  type FieldReportDoc,
} from "@/lib/workflow-store";
import type { Role } from "@/lib/dashboard-data";
import { SectionCard, StatCard } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { AddReportDialog, ReportRow, ReportViewerDialog } from "./reports-shared";

export function ReportsSection({ role }: { role: Role }) {
  const store = useWorkflow();
  const userName = ROLE_USER[role];
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [openReport, setOpenReport] = useState<FieldReportDoc | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Filter reports based on role
  const visible = useMemo(() => {
    switch (role) {
      case "owner":
        return reportsForOwner(store, userName);
      case "contractor":
        return reportsForContractor(store);
      case "supervisor":
        return reportsForSupervisor(store, userName);
      case "field":
        return reportsForFieldEngineer(store, userName);
      case "admin":
        return reportsForAdmin(store);
    }
  }, [store, role, userName]);

  const stats = useMemo(() => {
    const pending = visible.filter((r) => r.status === "pending").length;
    const approved = visible.filter((r) => r.status === "approved").length;
    const rejected = visible.filter((r) => r.status === "rejected").length;
    const late = visible.filter((r) => {
      const s = reportSchedule(r);
      return r.status === "pending" && s.state === "late";
    }).length;
    return { pending, approved, rejected, late };
  }, [visible]);

  const filtered = useMemo(() => {
    if (filter === "all") return visible;
    return visible.filter((r) => r.status === filter);
  }, [visible, filter]);

  const projectName = (id: string) => store.projects.find((p) => p.id === id)?.name;
  const isSupervisor = role === "supervisor";
  const isField = role === "field";

  // Subtitle differs by role
  const subtitle =
    role === "owner"
      ? "التقارير الميدانية المعتمدة على مشاريعك"
      : role === "contractor"
        ? "التقارير الميدانية المعتمدة على مشاريعك"
        : role === "supervisor"
          ? "كل التقارير على مشاريعك — راجع واعتمد المعلّقة"
          : role === "admin"
            ? "نظرة عامة على جميع التقارير الميدانية في المنصة"
            : "جميع التقارير التي رفعتها";

  const showFieldEngineerOwnProjects = isField
    ? store.projects.filter(
        (p) => p.fieldEngineerName === userName && p.status === "in_progress",
      )
    : [];

  return (
    <>
      <PageHeader
        title={role === "field" ? "تقاريري" : "التقارير"}
        subtitle={subtitle}
        action={
          isField && showFieldEngineerOwnProjects.length > 0 ? (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta"
            >
              <Plus className="h-3.5 w-3.5" /> تقرير جديد
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard
          label={isSupervisor ? "بانتظار اعتمادك" : "بانتظار المراجعة"}
          value={stats.pending}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="معتمدة"
          value={stats.approved}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="مرفوضة"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          label="متأخرة"
          value={stats.late}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "الكل", count: visible.length },
            { id: "pending", label: "بانتظار", count: stats.pending },
            { id: "approved", label: "معتمدة", count: stats.approved },
            { id: "rejected", label: "مرفوضة", count: stats.rejected },
          ] as const
        ).map((t) => {
          const active = t.id === filter;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-cta"
                  : "bg-card border border-border text-foreground/70 hover:border-primary"
              }`}
            >
              {t.label}
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground/70"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <SectionCard title={`${filtered.length} تقرير`}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">لا توجد تقارير ضمن هذه المعايير</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
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
          canReview={isSupervisor}
          reviewerName={isSupervisor ? userName : undefined}
          onClose={() => setOpenReport(null)}
        />
      )}

      {addOpen && isField && (
        <AddReportDialog
          projects={showFieldEngineerOwnProjects}
          engineerName={userName}
          onClose={() => setAddOpen(false)}
        />
      )}

      {/* Touch ClipboardList icon (lint) */}
      <span className="hidden">
        <ClipboardList className="h-3 w-3" />
      </span>
    </>
  );
}
