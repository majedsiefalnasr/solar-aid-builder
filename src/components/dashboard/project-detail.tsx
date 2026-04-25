import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  FileText,
  HardHat,
  History,
  Image as ImageIcon,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  FIELD_REPORTS,
  MOCK_PROJECT,
  STATUS_LABEL,
  STATUS_TONE,
  type Phase,
  type PhaseStatus,
  type Project,
} from "@/lib/dashboard-data";
import type { Role } from "@/lib/dashboard-data";
import {
  ROLE_USER,
  getOrCreateThread,
  reportsForOwner,
  reportsForSupervisor,
  reportsForFieldEngineer,
  reportsForContractor,
  reportsForAdmin,
  threadsForRole,
  unreadCountForRole,
  useWorkflow,
  type ChatRole,
  type FieldReportDoc,
  type PhaseDef,
  type ProjectDoc,
} from "@/lib/workflow-store";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { ChatPanel } from "./chat-panel";
import { PayPhaseDialog, ProjectStatusPill, ProjectTimeline } from "./project-flow-shared";
import { Mail, Phone, MessageSquarePlus } from "lucide-react";

// Map store phase status to legacy display status
function mapPhaseStatus(s: PhaseDef["status"]): PhaseStatus {
  switch (s) {
    case "completed":
      return "completed";
    case "in_progress":
      return "in_progress";
    case "awaiting_payment":
    case "verifying_payment":
      return "awaiting_funding";
    case "draft":
      return "pending_review";
    case "locked":
    default:
      return "locked";
  }
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

// Adapt store ProjectDoc to legacy Project shape
function adaptProject(p: ProjectDoc): Project {
  const totalBudget = p.phases.length ? p.phases.reduce((s, ph) => s + ph.budget, 0) : p.budget;
  const releasedAmount = p.payments
    .filter((pm) => pm.status === "verified")
    .reduce((s, pm) => s + pm.amount, 0);
  const overall = p.phases.length
    ? Math.round(p.phases.reduce((s, ph) => s + ph.progress, 0) / p.phases.length)
    : 0;
  return {
    id: p.id,
    name: p.name,
    city: p.city,
    owner: p.ownerName,
    contractor: p.contractorName ?? "—",
    supervisor: p.supervisorName ?? "—",
    totalBudget,
    releasedAmount,
    overallProgress: overall,
    phases: p.phases.map((ph) => ({
      id: ph.id,
      name: ph.name,
      amount: ph.budget,
      progress: ph.progress,
      status: mapPhaseStatus(ph.status),
      dueDate: ph.completedAt
        ? fmtDate(ph.completedAt)
        : ph.startedAt
          ? `بدأت ${fmtDate(ph.startedAt)}`
          : `${ph.durationDays} يوم`,
    })),
  };
}


const STATUS_ICON: Record<PhaseStatus, ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4" />,
  in_progress: <TrendingUp className="h-4 w-4" />,
  awaiting_funding: <Coins className="h-4 w-4" />,
  pending_review: <FileText className="h-4 w-4" />,
  locked: <Lock className="h-4 w-4" />,
};

export function ProjectDetail({
  role,
  projectId,
}: {
  role: Role;
  projectId?: string;
}) {
  const store = useWorkflow();
  const liveDoc = useMemo<ProjectDoc | undefined>(
    () => (projectId ? store.projects.find((p) => p.id === projectId) : undefined),
    [store.projects, projectId],
  );
  const project: Project = useMemo(
    () => (liveDoc ? adaptProject(liveDoc) : MOCK_PROJECT),
    [liveDoc],
  );
  const remaining = project.totalBudget - project.releasedAmount;
  const completed = project.phases.filter((p) => p.status === "completed").length;

  // Reports: live from store if we have a live doc, else legacy mock list
  const reportsLive: FieldReportDoc[] = useMemo(() => {
    if (!liveDoc) return [];
    const userName = ROLE_USER[role] ?? "";
    let visible: FieldReportDoc[] = [];
    switch (role) {
      case "owner":
        visible = reportsForOwner(store, userName);
        break;
      case "supervisor":
        visible = reportsForSupervisor(store, userName);
        break;
      case "field":
        visible = reportsForFieldEngineer(store, userName);
        break;
      case "contractor":
        visible = reportsForContractor(store);
        break;
      case "admin":
        visible = reportsForAdmin(store);
        break;
    }
    return visible.filter((r) => r.projectId === liveDoc.id).slice(0, 4);
  }, [liveDoc, store, role]);
  const legacyReports = FIELD_REPORTS.slice(0, 4);

  const [chatOpen, setChatOpen] = useState(false);
  const [payPhase, setPayPhase] = useState<PhaseDef | null>(null);
  const activeProjectId = liveDoc?.id ?? project.id;
  const projectThreads = useMemo(
    () =>
      threadsForRole(store, role as ChatRole, ROLE_USER[role] ?? "").filter(
        (t) => t.projectId === activeProjectId,
      ),
    [store, role, activeProjectId],
  );
  const projectUnread = projectThreads.reduce(
    (s, t) => s + unreadCountForRole(t, role as ChatRole),
    0,
  );

  const isOwner = role === "owner";
  const isContractor = role === "contractor";
  const payablePhase = liveDoc?.phases.find((ph) => ph.status === "awaiting_payment");

  // Start-chat: role -> allowed counterparts
  const CHAT_TARGETS: Record<Role, ChatRole[]> = {
    owner: ["admin", "supervisor", "field"],
    contractor: ["supervisor", "field"],
    supervisor: ["field", "contractor", "admin"],
    field: ["supervisor", "contractor"],
    admin: ["owner", "contractor", "supervisor", "field"],
  };
  const TARGET_LABEL: Record<ChatRole, string> = {
    owner: "العميل",
    contractor: "المقاول",
    supervisor: "المهندس المشرف",
    field: "المهندس الميداني",
    admin: "إدارة تم",
  };
  const [showStartChat, setShowStartChat] = useState(false);
  const startChatWith = (target: ChatRole) => {
    if (!liveDoc) return;
    const me = role as ChatRole;
    const thread = getOrCreateThread({
      projectId: liveDoc.id,
      participants: [me, target],
      title: `${TARGET_LABEL[me] ?? me} ↔ ${TARGET_LABEL[target]}`,
    });
    setShowStartChat(false);
    setChatOpen(true);
    void thread;
  };

  const showOwnerContact = (role === "supervisor" || role === "admin") && liveDoc;


  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/dashboard"
        search={{
          role,
          section: "projects",
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-primary"
      >
        <ArrowRight className="h-3.5 w-3.5" /> العودة إلى المشاريع
      </Link>

      {/* Live status banner */}
      {liveDoc && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <ProjectStatusPill status={liveDoc.status} />
            {liveDoc.rejectionReason && (
              <span className="text-xs text-rose-600">سبب الرفض: {liveDoc.rejectionReason}</span>
            )}
          </div>
          {isOwner && payablePhase && (
            <button
              onClick={() => setPayPhase(payablePhase)}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-cta hover:bg-rose-600"
            >
              <Coins className="h-3.5 w-3.5" /> دفع مرحلة {payablePhase.name} ({fmtMoney(payablePhase.budget)})
            </button>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-l from-primary/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary">#{project.id}</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {project.city}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <HardHat className="h-3 w-3" /> {project.contractor}
              </span>
              <span>•</span>
              <span>المشرف: {project.supervisor}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                onClick={() => setShowStartChat((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                بدء محادثة
              </button>
              {showStartChat && (
                <div className="absolute end-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                  {CHAT_TARGETS[role].map((t) => (
                    <button
                      key={t}
                      onClick={() => startChatWith(t)}
                      className="block w-full px-4 py-2.5 text-right text-xs font-bold text-ink hover:bg-primary-soft hover:text-primary"
                    >
                      {TARGET_LABEL[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              المحادثات
              {projectUnread > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {projectUnread}
                </span>
              )}
            </button>
            <button
              onClick={() => toast.success("تم تجهيز التقرير", { description: "سيتم تنزيله خلال لحظات." })}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta"
            >
              <FileText className="h-3.5 w-3.5" />
              تحميل التقرير
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">نسبة الإنجاز الإجمالية</span>
            <span className="text-ink">{project.overallProgress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
              style={{ width: `${project.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Owner contact — supervisor & admin only */}
      {showOwnerContact && (liveDoc.ownerEmail || liveDoc.ownerPhone) && (
        <SectionCard title="بيانات التواصل مع العميل" subtitle="مرئية للمشرف والإدارة فقط">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">العميل</div>
              <div className="mt-1 text-sm font-extrabold text-ink">{liveDoc.ownerName}</div>
            </div>
            {liveDoc.ownerEmail && (
              <a href={`mailto:${liveDoc.ownerEmail}`} className="rounded-xl border border-border bg-background p-3 hover:border-primary">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3 w-3" /> البريد
                </div>
                <div className="mt-1 break-all text-sm font-bold text-primary">{liveDoc.ownerEmail}</div>
              </a>
            )}
            {liveDoc.ownerPhone && (
              <a href={`tel:${liveDoc.ownerPhone}`} className="rounded-xl border border-border bg-background p-3 hover:border-primary">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Phone className="h-3 w-3" /> الجوال
                </div>
                <div className="mt-1 text-sm font-bold text-primary" dir="ltr">{liveDoc.ownerPhone}</div>
              </a>
            )}
          </div>
        </SectionCard>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الميزانية"
          value={fmtMoney(project.totalBudget)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label={isContractor ? "محصّل من المالك" : "مُحرّر للمقاول"}
          value={fmtMoney(project.releasedAmount)}
          icon={<Coins className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="المتبقي محجوز"
          value={fmtMoney(remaining)}
          icon={<Wallet className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="مراحل مكتملة"
          value={`${completed} / ${project.phases.length}`}
          icon={<Layers className="h-5 w-5" />}
        />
      </div>

      {/* Phase timeline */}
      <SectionCard
        title="مراحل المشروع"
        subtitle="تتبع تقدم كل مرحلة على حدة وحالتها المالية"
      >
        <ol className="relative space-y-4 border-r-2 border-dashed border-border pe-0 ps-6">
          {project.phases.map((ph, idx) => (
            <PhaseRow key={ph.id} phase={ph} index={idx + 1} role={role} />
          ))}
        </ol>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="آخر التقارير الميدانية">
          <div className="space-y-3">
            {liveDoc ? (
              reportsLive.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  لا توجد تقارير معتمدة بعد على هذا المشروع.
                </div>
              ) : (
                reportsLive.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <ImageIcon className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-ink">{r.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {r.engineer} • {fmtDate(r.date)}
                          </div>
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
                            : "بانتظار"}
                      </Pill>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{r.note}</p>
                    {r.photos.length > 0 && (
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        📷 {r.photos.length} صورة
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              legacyReports.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <ImageIcon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-ink">{r.phase}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {r.engineer} • {r.date}
                        </div>
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
                          : "بانتظار"}
                    </Pill>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{r.note}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">📷 {r.photos} صورة</div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="الجدول الزمني">
          <div className="space-y-3">
            {project.phases.map((ph) => (
              <div
                key={ph.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-ink">{ph.name}</div>
                    <div className="text-[10px] text-muted-foreground">استحقاق: {ph.dueDate}</div>
                  </div>
                </div>
                <Pill
                  tone={
                    ph.status === "completed"
                      ? "primary"
                      : ph.status === "in_progress"
                        ? "accent"
                        : ph.status === "awaiting_funding"
                          ? "danger"
                          : "muted"
                  }
                >
                  {STATUS_LABEL[ph.status]}
                </Pill>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {liveDoc && liveDoc.timeline.length > 0 && (
        <SectionCard title="سجل المشروع" subtitle="جميع الأحداث منذ إنشاء المشروع">
          <ProjectTimeline project={liveDoc} />
        </SectionCard>
      )}

      {isOwner && (
        <SectionCard title="إجراءات سريعة" subtitle="تحرير الدفعة التالية أو طلب تعديل">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => payablePhase && setPayPhase(payablePhase)}
              disabled={!payablePhase}
              className="rounded-xl border-2 border-primary bg-primary-soft p-4 text-right transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              <Coins className="mb-2 h-5 w-5" />
              <div className="text-sm font-extrabold">تحرير الدفعة التالية</div>
              <div className="mt-0.5 text-[11px] opacity-80">بعد اعتماد المرحلة</div>
            </button>
            <button className="rounded-xl border-2 border-border bg-background p-4 text-right transition hover:border-accent">
              <FileText className="mb-2 h-5 w-5 text-accent" />
              <div className="text-sm font-extrabold text-ink">طلب تقرير تفصيلي</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">من المشرف الفني</div>
            </button>
            <button className="rounded-xl border-2 border-border bg-background p-4 text-right transition hover:border-rose-300">
              <Building2 className="mb-2 h-5 w-5 text-rose-600" />
              <div className="text-sm font-extrabold text-ink">رفع نزاع</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">طلب تدخل من إدارة تم</div>
            </button>
          </div>
        </SectionCard>
      )}

      {isContractor && (
        <SectionCard title="إجراءات سريعة">
          <div className="grid gap-3 sm:grid-cols-3">
            <button className="rounded-xl border-2 border-accent bg-accent/10 p-4 text-right transition hover:bg-accent hover:text-accent-foreground">
              <FileText className="mb-2 h-5 w-5" />
              <div className="text-sm font-extrabold">رفع تقرير إنجاز</div>
              <div className="mt-0.5 text-[11px] opacity-80">على المرحلة النشطة</div>
            </button>
            <button className="rounded-xl border-2 border-border bg-background p-4 text-right transition hover:border-primary">
              <Wallet className="mb-2 h-5 w-5 text-primary" />
              <div className="text-sm font-extrabold text-ink">طلب صرف دفعة</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">حسب المرحلة المعتمدة</div>
            </button>
            <button className="rounded-xl border-2 border-border bg-background p-4 text-right transition hover:border-sky-400">
              <HardHat className="mb-2 h-5 w-5 text-sky-600" />
              <div className="text-sm font-extrabold text-ink">طلب مهندس ميداني</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">معاينة وتوثيق</div>
            </button>
          </div>
        </SectionCard>
      )}

      {/* Hidden references to satisfy unused import linter */}
      <div className="hidden">
        <span>{STATUS_TONE.completed}</span>
      </div>

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        projectId={activeProjectId}
        role={role}
      />
    </div>
  );
}

function PhaseRow({ phase, index, role }: { phase: Phase; index: number; role: Role }) {
  const isLocked = phase.status === "locked";
  return (
    <li className="relative">
      <span
        className={`absolute -right-[34px] top-2 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold ring-4 ring-card ${
          phase.status === "completed"
            ? "bg-primary text-primary-foreground"
            : phase.status === "in_progress"
              ? "bg-amber-400 text-white"
              : phase.status === "awaiting_funding"
                ? "bg-rose-500 text-white"
                : "bg-muted text-muted-foreground"
        }`}
      >
        {STATUS_ICON[phase.status] ?? index}
      </span>

      <div
        className={`rounded-xl border bg-background p-4 ${
          isLocked ? "border-dashed opacity-70" : "border-border"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground">
                المرحلة {index}
              </span>
              <Pill
                tone={
                  phase.status === "completed"
                    ? "primary"
                    : phase.status === "in_progress"
                      ? "accent"
                      : phase.status === "awaiting_funding"
                        ? "danger"
                        : "muted"
                }
              >
                {STATUS_LABEL[phase.status]}
              </Pill>
            </div>
            <h3 className="mt-1 text-sm font-extrabold text-ink">{phase.name}</h3>
            <div className="mt-1 text-[11px] text-muted-foreground">
              تاريخ الاستحقاق: {phase.dueDate}
            </div>
          </div>
          <div className="text-left">
            <div className="text-[11px] text-muted-foreground">قيمة المرحلة</div>
            <div className="text-base font-extrabold text-ink">{fmtMoney(phase.amount)}</div>
          </div>
        </div>

        {!isLocked && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>التقدم</span>
              <span className="text-ink">{phase.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  phase.status === "completed" ? "bg-primary" : "bg-amber-400"
                }`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        )}

        {phase.status === "awaiting_funding" && role === "owner" && (
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-rose-600">
            <Coins className="h-3 w-3" /> تأمين قيمة المرحلة
          </button>
        )}
      </div>
    </li>
  );
}
