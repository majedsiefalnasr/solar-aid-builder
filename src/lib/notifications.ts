// Derives role-aware notifications from the workflow store + chat threads.
// Each role sees notifications relevant to actions they can take.

import {
  reportSchedule,
  ROLE_USER,
  SINGLE_CONTRACTOR,
  unreadCountForRole,
  type ChatThreadDoc,
  type FieldReportDoc,
  type ProjectDoc,
} from "./workflow-store";
import type { Role } from "./dashboard-data";

export type NotificationKind =
  | "report_late"
  | "report_due_soon"
  | "report_pending_review"
  | "report_approved"
  | "report_rejected"
  | "project_pending_review"
  | "project_assigned"
  | "quote_ready"
  | "payment_due"
  | "payment_pending_verify"
  | "payment_verified"
  | "field_assigned"
  | "chat_unread";

export interface AppNotification {
  id: string;            // stable id for dedupe / read-state
  kind: NotificationKind;
  title: string;         // ar
  body?: string;         // ar
  at: string;            // ISO
  // Where to navigate when clicked
  link: { section: string; projectId?: string };
  severity: "info" | "warning" | "danger" | "success";
}

const READ_KEY = "tamm_notifications_read_v1";

function loadRead(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markRead(ids: string[]) {
  if (typeof window === "undefined") return;
  const set = loadRead();
  ids.forEach((id) => set.add(id));
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  window.dispatchEvent(new Event("tamm-notifications-read"));
}

export function isRead(id: string): boolean {
  return loadRead().has(id);
}

export function buildNotifications({
  role,
  projects,
  reports,
  threads,
}: {
  role: Role;
  projects: ProjectDoc[];
  reports: FieldReportDoc[];
  threads: ChatThreadDoc[];
}): AppNotification[] {
  const out: AppNotification[] = [];
  const me = ROLE_USER[role];

  // ---- Project-scoped notifications by role ----
  const myProjects = projects.filter((p) => {
    if (role === "admin") return true;
    if (role === "owner") return p.ownerName === me;
    if (role === "contractor") return p.contractorName === SINGLE_CONTRACTOR;
    if (role === "supervisor") return p.supervisorName === me;
    if (role === "field") return p.fieldEngineerName === me;
    return false;
  });

  for (const p of myProjects) {
    if (role === "admin" && p.status === "pending_admin") {
      out.push({
        id: `${p.id}:admin-review`,
        kind: "project_pending_review",
        title: "مشروع جديد بانتظار المراجعة",
        body: `${p.name} — ${p.ownerName}`,
        at: p.createdAt,
        link: { section: "assignments", projectId: p.id },
        severity: "warning",
      });
    }
    if (role === "supervisor" && p.status === "pending_supervisor" && p.supervisorName === me) {
      out.push({
        id: `${p.id}:sup-accept`,
        kind: "project_assigned",
        title: "تم تعيينك مشرفاً على مشروع جديد",
        body: p.name,
        at: p.supervisorAssignedAt ?? p.createdAt,
        link: { section: "assignments", projectId: p.id },
        severity: "info",
      });
    }
    if (role === "contractor" && p.status === "pending_quote") {
      out.push({
        id: `${p.id}:quote`,
        kind: "quote_ready",
        title: "مطلوب عرض سعر تفصيلي",
        body: p.name,
        at: p.supervisorAcceptedAt ?? p.createdAt,
        link: { section: "projects", projectId: p.id },
        severity: "warning",
      });
    }
    if (role === "owner") {
      const phaseDue = p.phases.find((ph) => ph.status === "awaiting_payment");
      if (phaseDue) {
        out.push({
          id: `${p.id}:${phaseDue.id}:pay`,
          kind: "payment_due",
          title: "مرحلة بانتظار الدفع",
          body: `${p.name} — ${phaseDue.name}`,
          at: p.quoteSubmittedAt ?? p.createdAt,
          link: { section: "projects", projectId: p.id },
          severity: "danger",
        });
      }
      if (p.status === "in_progress" && p.firstPaymentVerifiedAt) {
        out.push({
          id: `${p.id}:verified`,
          kind: "payment_verified",
          title: "بدأ تنفيذ مشروعك",
          body: p.name,
          at: p.firstPaymentVerifiedAt,
          link: { section: "projects", projectId: p.id },
          severity: "success",
        });
      }
    }
    if (role === "admin") {
      const proof = p.payments.find((pm) => pm.status === "pending");
      if (proof) {
        out.push({
          id: `${p.id}:${proof.id}:verify`,
          kind: "payment_pending_verify",
          title: "إثبات دفع بانتظار التحقق",
          body: `${p.name} — ${proof.bankName}`,
          at: proof.uploadedAt,
          link: { section: "payments", projectId: p.id },
          severity: "warning",
        });
      }
    }
    if (
      role === "field" &&
      p.fieldEngineerName === me &&
      !p.fieldEngineerAcceptedAt &&
      p.fieldEngineerAssignedAt
    ) {
      out.push({
        id: `${p.id}:field-accept`,
        kind: "field_assigned",
        title: "تم تعيينك على مشروع",
        body: p.name,
        at: p.fieldEngineerAssignedAt,
        link: { section: "overview", projectId: p.id },
        severity: "info",
      });
    }
  }

  // ---- Report-scoped notifications by role ----
  for (const r of reports) {
    const proj = projects.find((p) => p.id === r.projectId);
    if (!proj) continue;
    const sched = reportSchedule(r);

    if (role === "field" && r.engineer === me) {
      if (sched.state === "late") {
        out.push({
          id: `${r.id}:late`,
          kind: "report_late",
          title: "تقرير متأخر",
          body: `${r.title} — متأخر ${Math.abs(sched.daysOff)} يوم`,
          at: r.dueDate ?? r.date,
          link: { section: "reports", projectId: r.projectId },
          severity: "danger",
        });
      } else if (sched.state === "soon") {
        out.push({
          id: `${r.id}:soon`,
          kind: "report_due_soon",
          title: "تقرير اقترب موعده",
          body: r.title,
          at: r.dueDate ?? r.date,
          link: { section: "reports", projectId: r.projectId },
          severity: "warning",
        });
      }
      if (r.status === "approved") {
        out.push({
          id: `${r.id}:approved`,
          kind: "report_approved",
          title: "تم اعتماد تقريرك",
          body: r.title,
          at: r.reviewedAt ?? r.date,
          link: { section: "reports", projectId: r.projectId },
          severity: "success",
        });
      }
      if (r.status === "rejected") {
        out.push({
          id: `${r.id}:rejected`,
          kind: "report_rejected",
          title: "تم رفض تقريرك",
          body: r.rejectionReason ?? r.title,
          at: r.reviewedAt ?? r.date,
          link: { section: "reports", projectId: r.projectId },
          severity: "danger",
        });
      }
    }

    if (role === "supervisor" && proj.supervisorName === me && r.status === "pending") {
      out.push({
        id: `${r.id}:review`,
        kind: "report_pending_review",
        title: "تقرير بانتظار اعتمادك",
        body: `${r.title} — ${r.engineer}`,
        at: r.date,
        link: { section: "approvals", projectId: r.projectId },
        severity: "warning",
      });
    }
  }

  // ---- Chat unread ----
  for (const t of threads) {
    if (!t.participants.includes(role as never)) continue;
    const unread = unreadCountForRole(t, role as never);
    if (unread > 0) {
      const last = t.messages[t.messages.length - 1];
      out.push({
        id: `${t.id}:chat:${last?.id ?? "0"}`,
        kind: "chat_unread",
        title: t.title,
        body: last ? `${last.authorName}: ${last.text.slice(0, 60)}` : `${unread} رسالة جديدة`,
        at: last?.at ?? t.createdAt,
        link: { section: "messages", projectId: t.projectId },
        severity: "info",
      });
    }
  }

  // Sort newest first
  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
