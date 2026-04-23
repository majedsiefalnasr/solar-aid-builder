// Centralized workflow store backed by localStorage.
// Manages projects, assignments, phases, reports, payments — all mock data.
// Replaces ad-hoc state across dashboard sections.

import { useEffect, useSyncExternalStore } from "react";

// ============================================================
// Types
// ============================================================

export type ProjectStatus =
  | "pending_admin"      // العميل أنشأ المشروع، بانتظار قبول الإدارة
  | "pending_supervisor" // الإدارة عينت مشرف، بانتظار قبول المشرف
  | "pending_quote"      // المشرف قبل، بانتظار عرض سعر المقاول
  | "awaiting_payment"   // عرض السعر جاهز، بانتظار دفع العميل للمرحلة الأولى
  | "verifying_payment"  // العميل دفع ورفع إثبات، بانتظار تحقق الإدارة
  | "in_progress"        // قيد التنفيذ
  | "completed"
  | "rejected";

export type PhaseStatus =
  | "draft"              // قيد الإعداد من المقاول
  | "awaiting_payment"
  | "verifying_payment"
  | "in_progress"
  | "completed"
  | "locked";

export type ReportType = "daily" | "weekly" | "phase_end";

export type ReportStatus = "pending" | "approved" | "rejected";

export type PaymentStatus = "pending" | "verified" | "rejected";

export interface TimelineEvent {
  at: string;            // ISO date
  label: string;         // ar
  by?: string;
  kind: "created" | "approved" | "rejected" | "assigned" | "accepted" | "quote" | "payment" | "verified" | "phase_started" | "phase_completed" | "report" | "info";
}

export interface PhaseTask {
  id: string;
  title: string;
  done: boolean;
}

export interface PhaseDef {
  id: string;
  name: string;
  budget: number;        // SAR (thousands like rest of mock)
  durationDays: number;
  tasks: PhaseTask[];
  status: PhaseStatus;
  progress: number;      // 0..100
  startedAt?: string;
  completedAt?: string;
}

export interface PaymentProof {
  id: string;
  phaseId: string;
  amount: number;
  bankName: string;
  txRef: string;          // رقم العملية
  notes?: string;
  imageDataUrl?: string;  // base64
  uploadedAt: string;
  status: PaymentStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface FieldReportDoc {
  id: string;
  projectId: string;
  phaseId?: string;
  phaseName?: string;
  type: ReportType;
  title: string;
  note: string;
  date: string;            // ISO
  dueDate?: string;        // متى كان مفترض رفعه (للجدولة التلقائية)
  engineer: string;        // اسم المهندس الميداني
  photos: string[];        // base64 data URLs
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  isLate?: boolean;
}

export interface ProjectDoc {
  id: string;
  name: string;
  city: string;
  type: string;
  area?: number;
  budget: number;          // SAR thousands
  description?: string;
  ownerName: string;
  contractorName?: string; // مقاول واحد للجميع حالياً
  supervisorName?: string;
  fieldEngineerName?: string;
  status: ProjectStatus;
  createdAt: string;
  acceptedAt?: string;     // قبول الإدارة
  supervisorAssignedAt?: string;
  supervisorAcceptedAt?: string;
  quoteSubmittedAt?: string;
  firstPaymentAt?: string;
  firstPaymentVerifiedAt?: string;
  fieldEngineerAssignedAt?: string;
  fieldEngineerAcceptedAt?: string;
  startedAt?: string;
  phases: PhaseDef[];
  payments: PaymentProof[];
  timeline: TimelineEvent[];
  rejectionReason?: string;
}

// ============================================================
// Chat threads
// ============================================================

export type ChatRole = "owner" | "contractor" | "supervisor" | "field" | "admin";

export interface ChatMessageDoc {
  id: string;
  authorRole: ChatRole;
  authorName: string;
  text: string;
  at: string;            // ISO
  readBy: ChatRole[];    // who has read
}

export interface ChatThreadDoc {
  id: string;
  projectId?: string;     // tied to a project (optional for admin disputes)
  title: string;          // ar
  participants: ChatRole[]; // who can see/post
  createdAt: string;
  messages: ChatMessageDoc[];
}

interface StoreState {
  projects: ProjectDoc[];
  reports: FieldReportDoc[];
  threads: ChatThreadDoc[];
}

// ============================================================
// Constants (single contractor, hardcoded names by role)
// ============================================================

export const SINGLE_CONTRACTOR = "شركة البناء المتقن";
export const ADMIN_USER = "إدارة تم";

// Demo identities used when role switcher changes (no real auth)
export const ROLE_USER: Record<string, string> = {
  owner: "م. أحمد الشامي",
  contractor: SINGLE_CONTRACTOR,
  supervisor: "م. ليلى العمراني",
  field: "م. سامي الحاج",
  admin: ADMIN_USER,
};

// Available supervisors and field engineers (mock pool)
export const SUPERVISOR_POOL = [
  "م. ليلى العمراني",
  "م. خالد الأهدل",
  "م. محمد الرشيدي",
  "م. نبيل الصنوي",
];

export const FIELD_ENGINEER_POOL = [
  "م. سامي الحاج",
  "م. ياسر القباطي",
  "م. أمل الزبيدي",
  "م. ريم باعلوي",
];

// ============================================================
// Storage
// ============================================================

const STORAGE_KEY = "tamm_workflow_v1";

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function loadFromStorage(): StoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreState;
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.reports)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: StoreState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop — quota exceeded etc */
  }
}

// ============================================================
// Seed
// ============================================================

function seedState(): StoreState {
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };

  // Project 1 — in progress (full lifecycle done)
  const p1: ProjectDoc = {
    id: "PRJ-2041",
    name: "فيلا الياسمين — صنعاء",
    city: "صنعاء",
    type: "villa",
    area: 320,
    budget: 48_000,
    description: "فيلا سكنية دورين مع ملحق",
    ownerName: ROLE_USER.owner,
    contractorName: SINGLE_CONTRACTOR,
    supervisorName: "م. ليلى العمراني",
    fieldEngineerName: "م. سامي الحاج",
    status: "in_progress",
    createdAt: daysAgo(90),
    acceptedAt: daysAgo(88),
    supervisorAssignedAt: daysAgo(87),
    supervisorAcceptedAt: daysAgo(86),
    quoteSubmittedAt: daysAgo(80),
    firstPaymentAt: daysAgo(75),
    firstPaymentVerifiedAt: daysAgo(74),
    fieldEngineerAssignedAt: daysAgo(73),
    fieldEngineerAcceptedAt: daysAgo(72),
    startedAt: daysAgo(72),
    phases: [
      {
        id: "PH-1",
        name: "الأساسات والحفر",
        budget: 8_000,
        durationDays: 30,
        tasks: [
          { id: "T1", title: "حفر الموقع", done: true },
          { id: "T2", title: "صب القواعد", done: true },
          { id: "T3", title: "عزل الأساسات", done: true },
        ],
        status: "completed",
        progress: 100,
        startedAt: daysAgo(72),
        completedAt: daysAgo(45),
      },
      {
        id: "PH-2",
        name: "الهيكل الإنشائي",
        budget: 11_200,
        durationDays: 45,
        tasks: [
          { id: "T4", title: "صب الأعمدة", done: true },
          { id: "T5", title: "صب السقف الأول", done: true },
          { id: "T6", title: "صب السقف الثاني", done: true },
        ],
        status: "completed",
        progress: 100,
        startedAt: daysAgo(45),
        completedAt: daysAgo(15),
      },
      {
        id: "PH-3",
        name: "البناء بالطوب والقواطع",
        budget: 7_400,
        durationDays: 30,
        tasks: [
          { id: "T7", title: "بناء جدران الدور الأول", done: true },
          { id: "T8", title: "بناء جدران الدور الثاني", done: false },
          { id: "T9", title: "القواطع الداخلية", done: false },
        ],
        status: "in_progress",
        progress: 65,
        startedAt: daysAgo(15),
      },
      {
        id: "PH-4",
        name: "التمديدات الكهربائية والصحية",
        budget: 6_800,
        durationDays: 25,
        tasks: [
          { id: "T10", title: "تمديد الأنابيب", done: false },
          { id: "T11", title: "تمديد الأسلاك", done: false },
        ],
        status: "locked",
        progress: 0,
      },
    ],
    payments: [
      {
        id: "PAY-001",
        phaseId: "PH-1",
        amount: 8_000,
        bankName: "بنك التضامن الإسلامي",
        txRef: "TX-99812345",
        notes: "دفعة المرحلة الأولى",
        uploadedAt: daysAgo(75),
        status: "verified",
        verifiedAt: daysAgo(74),
        verifiedBy: ADMIN_USER,
      },
      {
        id: "PAY-002",
        phaseId: "PH-2",
        amount: 11_200,
        bankName: "بنك اليمن والكويت",
        txRef: "TX-99834567",
        uploadedAt: daysAgo(46),
        status: "verified",
        verifiedAt: daysAgo(45),
        verifiedBy: ADMIN_USER,
      },
      {
        id: "PAY-003",
        phaseId: "PH-3",
        amount: 7_400,
        bankName: "بنك سبأ الإسلامي",
        txRef: "TX-99898765",
        uploadedAt: daysAgo(16),
        status: "verified",
        verifiedAt: daysAgo(15),
        verifiedBy: ADMIN_USER,
      },
    ],
    timeline: [
      { at: daysAgo(90), label: "تم إنشاء المشروع", by: ROLE_USER.owner, kind: "created" },
      { at: daysAgo(88), label: "تم قبول المشروع من الإدارة", by: ADMIN_USER, kind: "approved" },
      { at: daysAgo(87), label: "تم تعيين مهندس مشرف", by: ADMIN_USER, kind: "assigned" },
      { at: daysAgo(86), label: "قبل المهندس المشرف الإشراف", by: "م. ليلى العمراني", kind: "accepted" },
      { at: daysAgo(80), label: "قدم المقاول عرض السعر التفصيلي", by: SINGLE_CONTRACTOR, kind: "quote" },
      { at: daysAgo(75), label: "قام العميل بدفع المرحلة الأولى", by: ROLE_USER.owner, kind: "payment" },
      { at: daysAgo(74), label: "تم التحقق من الدفعة الأولى", by: ADMIN_USER, kind: "verified" },
      { at: daysAgo(73), label: "تم تعيين مهندس ميداني", by: "م. ليلى العمراني", kind: "assigned" },
      { at: daysAgo(72), label: "بدأ تنفيذ المشروع", by: SINGLE_CONTRACTOR, kind: "phase_started" },
      { at: daysAgo(45), label: "اكتملت مرحلة الأساسات", by: SINGLE_CONTRACTOR, kind: "phase_completed" },
      { at: daysAgo(15), label: "اكتملت مرحلة الهيكل الإنشائي", by: SINGLE_CONTRACTOR, kind: "phase_completed" },
    ],
  };

  // Project 2 — pending admin approval (just created by client)
  const p2: ProjectDoc = {
    id: "PRJ-2068",
    name: "محل تجاري — حي السلام",
    city: "تعز",
    type: "commercial",
    area: 120,
    budget: 9_500,
    ownerName: "خالد العبسي",
    status: "pending_admin",
    createdAt: daysAgo(2),
    phases: [],
    payments: [],
    timeline: [
      { at: daysAgo(2), label: "تم إنشاء المشروع", by: "خالد العبسي", kind: "created" },
    ],
  };

  // Project 3 — supervisor accepted, awaiting contractor quote
  const p3: ProjectDoc = {
    id: "PRJ-2055",
    name: "شقة المعلا",
    city: "عدن",
    type: "apartment",
    area: 180,
    budget: 22_000,
    ownerName: "فهد المنصور",
    contractorName: SINGLE_CONTRACTOR,
    supervisorName: "م. خالد الأهدل",
    status: "pending_quote",
    createdAt: daysAgo(20),
    acceptedAt: daysAgo(18),
    supervisorAssignedAt: daysAgo(17),
    supervisorAcceptedAt: daysAgo(15),
    phases: [],
    payments: [],
    timeline: [
      { at: daysAgo(20), label: "تم إنشاء المشروع", by: "فهد المنصور", kind: "created" },
      { at: daysAgo(18), label: "تم قبول المشروع من الإدارة", by: ADMIN_USER, kind: "approved" },
      { at: daysAgo(17), label: "تم تعيين مهندس مشرف", by: ADMIN_USER, kind: "assigned" },
      { at: daysAgo(15), label: "قبل المهندس المشرف الإشراف", by: "م. خالد الأهدل", kind: "accepted" },
    ],
  };

  // Reports — for project 1
  const reports: FieldReportDoc[] = [
    {
      id: "RPT-118",
      projectId: "PRJ-2041",
      phaseId: "PH-3",
      phaseName: "البناء بالطوب",
      type: "daily",
      title: "تقرير يومي — بناء الدور الأول",
      note: "تم إنجاز جدران الدور الأول، جودة الطوب مطابقة للمواصفات.",
      date: daysAgo(3),
      dueDate: daysAgo(3),
      engineer: "م. سامي الحاج",
      photos: [],
      status: "approved",
      reviewedBy: "م. ليلى العمراني",
      reviewedAt: daysAgo(2),
    },
    {
      id: "RPT-119",
      projectId: "PRJ-2041",
      phaseId: "PH-3",
      phaseName: "البناء بالطوب",
      type: "daily",
      title: "تقرير يومي — جدران الدور الثاني",
      note: "بدء العمل على جدران الدور الثاني. الكمية المنجزة 35%.",
      date: daysAgo(1),
      dueDate: daysAgo(1),
      engineer: "م. سامي الحاج",
      photos: [],
      status: "pending",
    },
    {
      id: "RPT-120",
      projectId: "PRJ-2041",
      phaseId: "PH-3",
      phaseName: "البناء بالطوب",
      type: "weekly",
      title: "تقرير أسبوعي للمرحلة الثالثة",
      note: "تقدم عام جيد، نسبة الإنجاز 65% من المرحلة.",
      date: nowISO(),
      dueDate: daysFromNow(0),
      engineer: "م. سامي الحاج",
      photos: [],
      status: "pending",
    },
  ];

  return {
    projects: [p1, p2, p3],
    reports,
  };
}

// ============================================================
// Subscription store
// ============================================================

let state: StoreState = (typeof window !== "undefined" && loadFromStorage()) || seedState();
const listeners = new Set<() => void>();

function emit() {
  saveToStorage(state);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

// ============================================================
// React hooks
// ============================================================

export function useWorkflow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProject(id: string | undefined) {
  const s = useWorkflow();
  if (!id) return undefined;
  return s.projects.find((p) => p.id === id);
}

// Hydrate from storage on mount (handles SSR / first client render mismatch)
export function useHydrateWorkflow() {
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      state = stored;
      emit();
    }
  }, []);
}

// ============================================================
// Mutations
// ============================================================

function mutateProjects(fn: (projects: ProjectDoc[]) => ProjectDoc[]) {
  state = { ...state, projects: fn(state.projects) };
  emit();
}

function mutateReports(fn: (reports: FieldReportDoc[]) => FieldReportDoc[]) {
  state = { ...state, reports: fn(state.reports) };
  emit();
}

function updateProject(id: string, patch: Partial<ProjectDoc> | ((p: ProjectDoc) => ProjectDoc)) {
  mutateProjects((projects) =>
    projects.map((p) => {
      if (p.id !== id) return p;
      return typeof patch === "function" ? patch(p) : { ...p, ...patch };
    }),
  );
}

function pushTimeline(projectId: string, ev: Omit<TimelineEvent, "at"> & { at?: string }) {
  updateProject(projectId, (p) => ({
    ...p,
    timeline: [...p.timeline, { ...ev, at: ev.at ?? nowISO() }],
  }));
}

// --- Project lifecycle ---

export function createProject(input: {
  name: string;
  city: string;
  type: string;
  area?: number;
  budget: number;
  description?: string;
  ownerName: string;
}): ProjectDoc {
  const id = uid("PRJ");
  const project: ProjectDoc = {
    id,
    ...input,
    status: "pending_admin",
    createdAt: nowISO(),
    phases: [],
    payments: [],
    timeline: [{ at: nowISO(), label: "تم إنشاء المشروع", by: input.ownerName, kind: "created" }],
  };
  mutateProjects((projects) => [project, ...projects]);
  return project;
}

export function adminAcceptProject(projectId: string, supervisorName: string) {
  updateProject(projectId, (p) => ({
    ...p,
    status: "pending_supervisor",
    acceptedAt: nowISO(),
    supervisorAssignedAt: nowISO(),
    supervisorName,
    contractorName: SINGLE_CONTRACTOR,
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: "تم قبول المشروع من الإدارة", by: ADMIN_USER, kind: "approved" },
      { at: nowISO(), label: `تم تعيين المهندس المشرف ${supervisorName}`, by: ADMIN_USER, kind: "assigned" },
    ],
  }));
}

export function adminRejectProject(projectId: string, reason: string) {
  updateProject(projectId, (p) => ({
    ...p,
    status: "rejected",
    rejectionReason: reason,
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: `تم رفض المشروع: ${reason}`, by: ADMIN_USER, kind: "rejected" },
    ],
  }));
}

export function supervisorAcceptProject(projectId: string, supervisorName: string) {
  updateProject(projectId, (p) => ({
    ...p,
    status: "pending_quote",
    supervisorAcceptedAt: nowISO(),
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: "قبل المهندس المشرف الإشراف", by: supervisorName, kind: "accepted" },
    ],
  }));
}

export function supervisorRejectProject(projectId: string, supervisorName: string, reason: string) {
  // Returns project to admin pool for reassignment
  updateProject(projectId, (p) => ({
    ...p,
    status: "pending_admin",
    supervisorName: undefined,
    supervisorAssignedAt: undefined,
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: `رفض المهندس ${supervisorName} الإشراف: ${reason}`, by: supervisorName, kind: "rejected" },
    ],
  }));
}

// --- Quote (phases) ---

export function submitQuote(projectId: string, phases: Omit<PhaseDef, "status" | "progress">[]) {
  const ordered: PhaseDef[] = phases.map((ph, idx) => ({
    ...ph,
    status: idx === 0 ? "awaiting_payment" : "locked",
    progress: 0,
  }));
  updateProject(projectId, (p) => ({
    ...p,
    phases: ordered,
    status: "awaiting_payment",
    quoteSubmittedAt: nowISO(),
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: "تم تقديم عرض السعر التفصيلي", by: SINGLE_CONTRACTOR, kind: "quote" },
    ],
  }));
}

// --- Payments ---

export function submitPaymentProof(projectId: string, input: {
  phaseId: string;
  amount: number;
  bankName: string;
  txRef: string;
  notes?: string;
  imageDataUrl?: string;
}) {
  const proof: PaymentProof = {
    id: uid("PAY"),
    ...input,
    uploadedAt: nowISO(),
    status: "pending",
  };
  updateProject(projectId, (p) => ({
    ...p,
    payments: [...p.payments, proof],
    status: "verifying_payment",
    firstPaymentAt: p.firstPaymentAt ?? nowISO(),
    phases: p.phases.map((ph) =>
      ph.id === input.phaseId ? { ...ph, status: "verifying_payment" } : ph,
    ),
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: `قام العميل بدفع ${input.amount.toLocaleString("en-US")} ر.س ورفع الإثبات`, by: p.ownerName, kind: "payment" },
    ],
  }));
}

export function verifyPayment(projectId: string, paymentId: string, verifiedBy: string) {
  updateProject(projectId, (p) => {
    const payment = p.payments.find((x) => x.id === paymentId);
    if (!payment) return p;
    const updatedPayments = p.payments.map((x) =>
      x.id === paymentId
        ? { ...x, status: "verified" as const, verifiedAt: nowISO(), verifiedBy }
        : x,
    );
    const updatedPhases = p.phases.map((ph) =>
      ph.id === payment.phaseId
        ? { ...ph, status: "in_progress" as const, startedAt: ph.startedAt ?? nowISO() }
        : ph,
    );
    const isFirst = !p.firstPaymentVerifiedAt;
    return {
      ...p,
      payments: updatedPayments,
      phases: updatedPhases,
      status: "in_progress",
      firstPaymentVerifiedAt: p.firstPaymentVerifiedAt ?? nowISO(),
      startedAt: p.startedAt ?? nowISO(),
      timeline: [
        ...p.timeline,
        { at: nowISO(), label: `تم التحقق من الدفعة (${payment.amount.toLocaleString("en-US")} ر.س)`, by: verifiedBy, kind: "verified" },
        ...(isFirst
          ? [{ at: nowISO(), label: "بدأ تنفيذ المشروع", by: SINGLE_CONTRACTOR, kind: "phase_started" as const }]
          : []),
      ],
    };
  });
}

export function rejectPayment(projectId: string, paymentId: string, reason: string, by: string) {
  updateProject(projectId, (p) => {
    const payment = p.payments.find((x) => x.id === paymentId);
    return {
      ...p,
      status: "awaiting_payment",
      payments: p.payments.map((x) =>
        x.id === paymentId
          ? { ...x, status: "rejected" as const, rejectionReason: reason, verifiedAt: nowISO(), verifiedBy: by }
          : x,
      ),
      phases: p.phases.map((ph) =>
        payment && ph.id === payment.phaseId ? { ...ph, status: "awaiting_payment" as const } : ph,
      ),
      timeline: [
        ...p.timeline,
        { at: nowISO(), label: `تم رفض الدفعة: ${reason}`, by, kind: "rejected" },
      ],
    };
  });
}

// --- Field engineer assignment ---

export function assignFieldEngineer(projectId: string, engineerName: string, by: string) {
  updateProject(projectId, (p) => ({
    ...p,
    fieldEngineerName: engineerName,
    fieldEngineerAssignedAt: nowISO(),
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: `تم تعيين المهندس الميداني ${engineerName}`, by, kind: "assigned" },
    ],
  }));
}

export function fieldEngineerAccept(projectId: string, engineerName: string) {
  updateProject(projectId, (p) => ({
    ...p,
    fieldEngineerAcceptedAt: nowISO(),
    timeline: [
      ...p.timeline,
      { at: nowISO(), label: "قبل المهندس الميداني المشروع", by: engineerName, kind: "accepted" },
    ],
  }));
}

// --- Phases progress ---

export function setPhaseProgress(projectId: string, phaseId: string, progress: number) {
  updateProject(projectId, (p) => ({
    ...p,
    phases: p.phases.map((ph) =>
      ph.id === phaseId ? { ...ph, progress: Math.max(0, Math.min(100, progress)) } : ph,
    ),
  }));
}

export function completePhase(projectId: string, phaseId: string, by: string) {
  updateProject(projectId, (p) => {
    const phaseIdx = p.phases.findIndex((ph) => ph.id === phaseId);
    if (phaseIdx === -1) return p;
    const phase = p.phases[phaseIdx];
    const updated = p.phases.map((ph, i) => {
      if (i === phaseIdx) return { ...ph, status: "completed" as const, progress: 100, completedAt: nowISO() };
      if (i === phaseIdx + 1 && ph.status === "locked") return { ...ph, status: "awaiting_payment" as const };
      return ph;
    });
    const allDone = updated.every((ph) => ph.status === "completed");
    return {
      ...p,
      phases: updated,
      status: allDone ? "completed" : p.status,
      timeline: [
        ...p.timeline,
        { at: nowISO(), label: `اكتملت مرحلة ${phase.name}`, by, kind: "phase_completed" },
      ],
    };
  });
}

// --- Reports ---

export function createReport(input: {
  projectId: string;
  phaseId?: string;
  phaseName?: string;
  type: ReportType;
  title: string;
  note: string;
  engineer: string;
  photos?: string[];
  dueDate?: string;
}): FieldReportDoc {
  const report: FieldReportDoc = {
    id: uid("RPT"),
    projectId: input.projectId,
    phaseId: input.phaseId,
    phaseName: input.phaseName,
    type: input.type,
    title: input.title,
    note: input.note,
    date: nowISO(),
    dueDate: input.dueDate,
    engineer: input.engineer,
    photos: input.photos ?? [],
    status: "pending",
  };
  mutateReports((reports) => [report, ...reports]);
  pushTimeline(input.projectId, {
    label: `رفع المهندس الميداني تقرير ${reportTypeLabel(input.type)}`,
    by: input.engineer,
    kind: "report",
  });
  return report;
}

export function approveReport(reportId: string, reviewer: string) {
  mutateReports((reports) =>
    reports.map((r) =>
      r.id === reportId
        ? { ...r, status: "approved" as const, reviewedBy: reviewer, reviewedAt: nowISO() }
        : r,
    ),
  );
}

export function rejectReport(reportId: string, reviewer: string, reason: string) {
  mutateReports((reports) =>
    reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: "rejected" as const,
            reviewedBy: reviewer,
            reviewedAt: nowISO(),
            rejectionReason: reason,
          }
        : r,
    ),
  );
}

// ============================================================
// Selectors / computed
// ============================================================

export function reportTypeLabel(type: ReportType): string {
  switch (type) {
    case "daily":
      return "يومي";
    case "weekly":
      return "أسبوعي";
    case "phase_end":
      return "نهاية مرحلة";
  }
}

export function projectStatusLabel(s: ProjectStatus): string {
  switch (s) {
    case "pending_admin":
      return "بانتظار قبول الإدارة";
    case "pending_supervisor":
      return "بانتظار قبول المشرف";
    case "pending_quote":
      return "بانتظار عرض سعر المقاول";
    case "awaiting_payment":
      return "بانتظار دفع العميل";
    case "verifying_payment":
      return "جاري التحقق من الدفع";
    case "in_progress":
      return "قيد التنفيذ";
    case "completed":
      return "مكتمل";
    case "rejected":
      return "مرفوض";
  }
}

export function projectStatusTone(s: ProjectStatus): "muted" | "primary" | "accent" | "danger" | "info" {
  switch (s) {
    case "completed":
      return "primary";
    case "in_progress":
      return "info";
    case "rejected":
      return "danger";
    case "verifying_payment":
    case "awaiting_payment":
      return "accent";
    default:
      return "muted";
  }
}

export function phaseStatusLabel(s: PhaseStatus): string {
  switch (s) {
    case "draft":
      return "مسودة";
    case "awaiting_payment":
      return "بانتظار الدفع";
    case "verifying_payment":
      return "تحقق الدفع";
    case "in_progress":
      return "قيد التنفيذ";
    case "completed":
      return "مكتملة";
    case "locked":
      return "مقفلة";
  }
}

// Reports schedule helpers
const DAY_MS = 24 * 60 * 60 * 1000;

export function reportSchedule(report: FieldReportDoc) {
  if (!report.dueDate) return { state: "ok" as const, daysOff: 0 };
  const due = new Date(report.dueDate).getTime();
  const now = Date.now();
  const diff = Math.round((due - now) / DAY_MS);
  if (report.status !== "pending") return { state: "ok" as const, daysOff: diff };
  if (diff < 0) return { state: "late" as const, daysOff: diff };
  if (diff <= 1) return { state: "soon" as const, daysOff: diff };
  return { state: "ok" as const, daysOff: diff };
}

// Filters by role visibility
export function reportsForOwner(s: StoreState, ownerName: string): FieldReportDoc[] {
  const ownerProjects = new Set(s.projects.filter((p) => p.ownerName === ownerName).map((p) => p.id));
  return s.reports.filter((r) => ownerProjects.has(r.projectId) && r.status === "approved");
}

export function reportsForContractor(s: StoreState): FieldReportDoc[] {
  // Single contractor sees all approved reports of projects he's on
  const projectIds = new Set(s.projects.filter((p) => p.contractorName === SINGLE_CONTRACTOR).map((p) => p.id));
  return s.reports.filter((r) => projectIds.has(r.projectId) && r.status === "approved");
}

export function reportsForSupervisor(s: StoreState, supervisorName: string): FieldReportDoc[] {
  const projectIds = new Set(s.projects.filter((p) => p.supervisorName === supervisorName).map((p) => p.id));
  return s.reports.filter((r) => projectIds.has(r.projectId));
}

export function reportsForFieldEngineer(s: StoreState, engineerName: string): FieldReportDoc[] {
  return s.reports.filter((r) => r.engineer === engineerName);
}

export function reportsForAdmin(s: StoreState): FieldReportDoc[] {
  return s.reports;
}

// Reset / utilities (for debugging)
export function resetWorkflow() {
  state = seedState();
  emit();
}

// Dev helper for window console
if (typeof window !== "undefined") {
  (window as unknown as { __tammReset?: () => void }).__tammReset = resetWorkflow;
}
