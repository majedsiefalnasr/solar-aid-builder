// Shared dialogs / widgets for the project lifecycle.
// Used across owner, admin, supervisor, contractor sections.

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  Banknote,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  HardHat,
  Layers,
  PlusCircle,
  Trash2,
  Upload,
  UserCheck,
  Wallet,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import {
  ADMIN_USER,
  adminAcceptProject,
  adminRejectProject,
  assignFieldEngineer,
  fieldEngineerAccept,
  FIELD_ENGINEER_POOL,
  projectStatusLabel,
  projectStatusTone,
  rejectPayment,
  ROLE_USER,
  SINGLE_CONTRACTOR,
  submitPaymentProof,
  submitQuote,
  supervisorAcceptProject,
  supervisorRejectProject,
  SUPERVISOR_POOL,
  type PhaseDef,
  type PhaseTask,
  type ProjectDoc,
  type TimelineEvent,
  verifyPayment,
} from "@/lib/workflow-store";
import { Pill } from "./dashboard-ui";
import { MoneyInput } from "@/components/ui/money-input";

// ============================================================
// File compression (mirrors reports-shared)
// ============================================================
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxWidth = 1100, quality = 0.7): Promise<string> {
  if (!file.type.startsWith("image/")) return readAsDataURL(file);
  const dataUrl = await readAsDataURL(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ============================================================
// Status badge helper — maps store status to Pill tone
// ============================================================
export function ProjectStatusPill({ status }: { status: ProjectDoc["status"] }) {
  const tone = projectStatusTone(status);
  // Pill supports muted/primary/accent/danger/info
  return <Pill tone={tone === "muted" ? "muted" : tone}>{projectStatusLabel(status)}</Pill>;
}

// ============================================================
// Modal shell
// ============================================================
function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidthClass = "max-w-lg",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-h-[92vh] w-full ${maxWidthClass} overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-card/95 p-5 backdrop-blur">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// Admin: accept/reject + assign supervisor
// ============================================================
export function AdminReviewProjectDialog({
  project,
  onClose,
}: {
  project: ProjectDoc;
  onClose: () => void;
}) {
  const [supervisor, setSupervisor] = useState<string>(SUPERVISOR_POOL[0]);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const accept = () => {
    adminAcceptProject(project.id, supervisor);
    toast.success("تم قبول المشروع وتعيين المشرف", {
      description: `${project.name} → ${supervisor}`,
    });
    onClose();
  };

  const reject = () => {
    if (!reason.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }
    adminRejectProject(project.id, reason.trim());
    toast.error("تم رفض المشروع", { description: project.name });
    onClose();
  };

  return (
    <ModalShell
      title="مراجعة طلب مشروع"
      subtitle={`${project.id} • تم الإنشاء من: ${project.ownerName}`}
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        <ProjectFactsGrid project={project} />

        {!showReject ? (
          <>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink">
                  <UserCheck className="h-3.5 w-3.5" /> تعيين مهندس مشرف
                </span>
                <select
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {SUPERVISOR_POOL.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  المقاول الافتراضي: <span className="font-bold text-ink">{SINGLE_CONTRACTOR}</span>
                </p>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowReject(true)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-rose-300 hover:text-rose-600"
              >
                رفض الطلب
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
              >
                قبول وتعيين المشرف
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-bold text-rose-700">سبب الرفض (يُرسل للعميل)</div>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: الميزانية المقترحة لا تتناسب مع نوع المشروع..."
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm focus:border-rose-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReject(false);
                  setReason("");
                }}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={reject}
                className="flex-1 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function ProjectFactsGrid({ project }: { project: ProjectDoc }) {
  const fmt = (n: number) => `${n.toLocaleString("en-US")}K ر.س`;
  return (
    <div>
      <h3 className="mb-2 text-base font-extrabold text-ink">{project.name}</h3>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <ProjectStatusPill status={project.status} />
        <span>•</span>
        <span>{project.city}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Fact label="النوع" value={projectTypeLabel(project.type)} />
        <Fact label="الميزانية" value={fmt(project.budget)} />
        <Fact label="المساحة" value={project.area ? `${project.area} م²` : "—"} />
      </div>
      {project.description && (
        <p className="mt-3 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground/80">
          {project.description}
        </p>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-ink">{value}</div>
    </div>
  );
}

function projectTypeLabel(t: string) {
  switch (t) {
    case "villa":
      return "فيلا سكنية";
    case "apartment":
      return "شقة";
    case "commercial":
      return "تجاري";
    case "warehouse":
      return "مستودع";
    case "hotel":
      return "فندق";
    case "school":
      return "مدرسة";
    default:
      return t;
  }
}

// ============================================================
// Supervisor: accept/reject assignment
// ============================================================
export function SupervisorAcceptDialog({
  project,
  supervisorName,
  onClose,
}: {
  project: ProjectDoc;
  supervisorName: string;
  onClose: () => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const accept = () => {
    supervisorAcceptProject(project.id, supervisorName);
    toast.success("قبلت الإشراف على المشروع", {
      description: "الخطوة التالية: إرسال عرض السعر بالمراحل",
    });
    onClose();
  };

  const reject = () => {
    if (!reason.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }
    supervisorRejectProject(project.id, supervisorName, reason.trim());
    toast.error("تم رفض الإشراف", { description: "أُعيد المشروع إلى الإدارة لإعادة التعيين" });
    onClose();
  };

  return (
    <ModalShell
      title="طلب إشراف على مشروع"
      subtitle={`${project.id} • تم تعيينك من قبل الإدارة`}
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        <ProjectFactsGrid project={project} />

        {!showReject ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-rose-300 hover:text-rose-600"
            >
              رفض التعيين
            </button>
            <button
              type="button"
              onClick={accept}
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              قبول الإشراف
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-bold text-rose-700">سبب الرفض</div>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: عبء عمل حالي مرتفع..."
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={reject}
                className="flex-1 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ============================================================
// Supervisor / Contractor: build quote (phases)
// ============================================================
type DraftPhase = {
  id: string;
  name: string;
  budget: number;
  durationDays: number;
  taskInput: string;
  tasks: PhaseTask[];
};

function newDraftPhase(idx: number): DraftPhase {
  return {
    id: `PH-${Date.now().toString(36)}-${idx}`,
    name: "",
    budget: 0,
    durationDays: 30,
    taskInput: "",
    tasks: [],
  };
}

const SUGGESTED_PHASES = [
  { name: "الحفر والأساسات", duration: 25 },
  { name: "الهيكل الإنشائي", duration: 45 },
  { name: "البناء بالطوب والقواطع", duration: 30 },
  { name: "التمديدات الكهربائية والصحية", duration: 25 },
  { name: "اللياسة والعزل", duration: 20 },
  { name: "التشطيبات والدهانات", duration: 30 },
];

export function SubmitQuoteDialog({
  project,
  onClose,
}: {
  project: ProjectDoc;
  onClose: () => void;
}) {
  const [phases, setPhases] = useState<DraftPhase[]>([
    {
      ...newDraftPhase(0),
      name: SUGGESTED_PHASES[0].name,
      durationDays: SUGGESTED_PHASES[0].duration,
    },
  ]);

  const totalBudget = phases.reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const totalDays = phases.reduce((s, p) => s + (Number(p.durationDays) || 0), 0);
  const overBudget = totalBudget > project.budget;

  const addPhase = () => {
    const idx = phases.length;
    const sug = SUGGESTED_PHASES[idx] ?? { name: "", duration: 30 };
    setPhases((prev) => [
      ...prev,
      { ...newDraftPhase(idx), name: sug.name, durationDays: sug.duration },
    ]);
  };

  const removePhase = (id: string) =>
    setPhases((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));

  const updatePhase = (id: string, patch: Partial<DraftPhase>) =>
    setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addTask = (id: string) =>
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const txt = p.taskInput.trim();
        if (!txt) return p;
        return {
          ...p,
          taskInput: "",
          tasks: [...p.tasks, { id: `T-${Date.now().toString(36)}`, title: txt, done: false }],
        };
      }),
    );

  const removeTask = (phaseId: string, taskId: string) =>
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p)),
    );

  const submit = () => {
    if (phases.some((p) => !p.name.trim())) {
      toast.error("يرجى تسمية كل المراحل");
      return;
    }
    if (phases.some((p) => !p.budget || p.budget <= 0)) {
      toast.error("يرجى إدخال ميزانية لكل مرحلة");
      return;
    }
    submitQuote(
      project.id,
      phases.map((p) => ({
        id: p.id,
        name: p.name.trim(),
        budget: Number(p.budget),
        durationDays: Number(p.durationDays) || 30,
        tasks: p.tasks,
      })),
    );
    toast.success("تم تقديم عرض السعر للعميل", {
      description: `${phases.length} مراحل • ${totalBudget.toLocaleString("en-US")}K ر.س`,
    });
    onClose();
  };

  return (
    <ModalShell
      title="عرض السعر التفصيلي"
      subtitle={`قسّم تكلفة ${project.name} على مراحل تنفيذية واضحة`}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-4 p-5">
        <div className="grid gap-2 rounded-2xl bg-gradient-to-l from-primary/10 to-card p-4 sm:grid-cols-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              ميزانية العميل
            </div>
            <div className="mt-1 text-base font-extrabold text-ink">
              {project.budget.toLocaleString("en-US")}K ر.س
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              إجمالي العرض
            </div>
            <div
              className={`mt-1 text-base font-extrabold ${
                overBudget ? "text-rose-600" : "text-primary"
              }`}
            >
              {totalBudget.toLocaleString("en-US")}K ر.س
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              المدة الكلية
            </div>
            <div className="mt-1 text-base font-extrabold text-ink">{totalDays} يوم</div>
          </div>
        </div>

        {overBudget && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              إجمالي المراحل يتجاوز الميزانية المحددة من العميل. يمكنك المتابعة لكن العميل قد يعترض.
            </span>
          </div>
        )}

        <div className="space-y-3">
          {phases.map((p, idx) => (
            <div key={p.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-ink">المرحلة {idx + 1}</span>
                </div>
                {phases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhase(p.id)}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-rose-100 hover:text-rose-600"
                    aria-label="حذف المرحلة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_180px_120px]">
                <input
                  value={p.name}
                  onChange={(e) => updatePhase(p.id, { name: e.target.value })}
                  placeholder="اسم المرحلة"
                  className="rounded-xl border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <MoneyInput
                  value={p.budget}
                  onChange={(v) => updatePhase(p.id, { budget: v })}
                  mode="thousands"
                  placeholder="الميزانية"
                />
                <input
                  type="number"
                  value={p.durationDays || ""}
                  onChange={(e) => updatePhase(p.id, { durationDays: Number(e.target.value) })}
                  placeholder="أيام"
                  className="rounded-xl border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-3">
                <div className="mb-1.5 text-[11px] font-bold text-muted-foreground">
                  المهام (اختياري)
                </div>
                {p.tasks.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {p.tasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-xs"
                      >
                        <span>{t.title}</span>
                        <button
                          type="button"
                          onClick={() => removeTask(p.id, t.id)}
                          className="text-muted-foreground hover:text-rose-600"
                          aria-label="حذف"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    value={p.taskInput}
                    onChange={(e) => updatePhase(p.id, { taskInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTask(p.id);
                      }
                    }}
                    placeholder="مهمة جديدة + Enter"
                    className="flex-1 rounded-xl border border-input bg-card px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTask(p.id)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPhase}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-xs font-bold text-foreground/70 transition hover:border-primary hover:text-primary"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة مرحلة
          </button>
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            إرسال عرض السعر للعميل
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================
// Owner: pay phase (upload proof)
// ============================================================
const BANKS = [
  "بنك التضامن الإسلامي",
  "بنك اليمن والكويت",
  "بنك سبأ الإسلامي",
  "بنك القاسمي",
  "البنك المركزي",
  "بنك الكريمي",
];

export function PayPhaseDialog({
  project,
  phase,
  onClose,
}: {
  project: ProjectDoc;
  phase: PhaseDef;
  onClose: () => void;
}) {
  const [bank, setBank] = useState(BANKS[0]);
  const [txRef, setTxRef] = useState("");
  const [amount, setAmount] = useState<number>(phase.budget);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await compressImage(file, 1200, 0.75);
      setPhoto(data);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txRef.trim()) {
      toast.error("يرجى إدخال رقم العملية");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("يرجى إدخال المبلغ");
      return;
    }
    if (!photo) {
      toast.error("يرجى رفع صورة إثبات التحويل");
      return;
    }
    submitPaymentProof(project.id, {
      phaseId: phase.id,
      amount: Number(amount),
      bankName: bank,
      txRef: txRef.trim(),
      notes: notes.trim() || undefined,
      imageDataUrl: photo,
    });
    toast.success("تم رفع إثبات التحويل", {
      description: "ستتحقق الإدارة من العملية ويبدأ التنفيذ",
    });
    onClose();
  };

  return (
    <ModalShell
      title={`دفع مرحلة: ${phase.name}`}
      subtitle={`${project.name} • قم بتحويل المبلغ إلى حساب المنصة وأرفق الإثبات`}
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {/* Quote review — show all phases so the owner sees what they're paying for */}
        {project.phases.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-bold text-ink">عرض السعر — مراحل المشروع</div>
              <div className="text-[11px] text-muted-foreground">
                إجمالي:{" "}
                <span className="font-extrabold text-ink">
                  {project.phases.reduce((s, ph) => s + ph.budget, 0).toLocaleString("en-US")}K ر.س
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              {project.phases.map((ph, i) => {
                const active = ph.id === phase.id;
                return (
                  <div
                    key={ph.id}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs ${
                      active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold opacity-80">{i + 1}.</span>
                      <span className="font-bold">{ph.name}</span>
                      {active && <span className="text-[10px] opacity-90">(الدفعة الحالية)</span>}
                    </div>
                    <div className="font-extrabold">{ph.budget.toLocaleString("en-US")}K ر.س</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-4">
          <div className="text-xs font-bold text-primary">حساب المنصة لاستلام التحويل</div>
          <div className="mt-2 grid gap-1 text-xs text-foreground/80">
            <div>
              <span className="text-muted-foreground">البنك: </span>
              <span className="font-bold text-ink">بنك التضامن الإسلامي</span>
            </div>
            <div>
              <span className="text-muted-foreground">رقم الحساب: </span>
              <span className="font-mono font-bold text-ink">YE94 0008 0000 0000 0001 2345</span>
            </div>
            <div>
              <span className="text-muted-foreground">المستفيد: </span>
              <span className="font-bold text-ink">منصة تم للمقاولات</span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">المبلغ (بآلاف الريالات)</span>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">البنك المُحوِّل منه</span>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">رقم العملية / المرجع</span>
            <input
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              placeholder="مثال: TX-99812345"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-mono focus:border-primary focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">ملاحظات (اختياري)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي معلومة إضافية للإدارة..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-bold text-ink">صورة إثبات التحويل</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {photo ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img src={photo} alt="إثبات التحويل" className="h-48 w-full object-contain bg-muted/20" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute left-2 top-2 rounded-full bg-rose-500 p-1.5 text-white shadow-md hover:bg-rose-600"
                  aria-label="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-6 text-xs font-bold text-foreground/70 hover:border-primary hover:bg-primary-soft/40 hover:text-primary disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                {busy ? "جاري المعالجة…" : "ارفع صورة الحوالة"}
              </button>
            )}
          </div>

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
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              إرسال إثبات الدفع
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

// ============================================================
// Admin: verify payment proof
// ============================================================
export function VerifyPaymentDialog({
  project,
  paymentId,
  onClose,
}: {
  project: ProjectDoc;
  paymentId: string;
  onClose: () => void;
}) {
  const payment = project.payments.find((p) => p.id === paymentId);
  const phase = project.phases.find((ph) => ph.id === payment?.phaseId);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  if (!payment) {
    return (
      <ModalShell title="لم يتم العثور على الدفعة" onClose={onClose}>
        <div className="p-5 text-sm text-muted-foreground">الدفعة غير موجودة.</div>
      </ModalShell>
    );
  }

  const verify = () => {
    verifyPayment(project.id, payment.id, ADMIN_USER);
    toast.success("تم تأكيد الدفع", {
      description: `بدأ تنفيذ مرحلة ${phase?.name ?? ""}`,
    });
    onClose();
  };

  const reject = () => {
    if (!reason.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }
    rejectPayment(project.id, payment.id, reason.trim(), ADMIN_USER);
    toast.error("تم رفض الدفعة", { description: "أُعيد المشروع لانتظار دفع جديد" });
    onClose();
  };

  return (
    <ModalShell
      title="تحقق من إثبات التحويل"
      subtitle={`${project.name} • مرحلة ${phase?.name ?? "—"}`}
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <Fact label="المبلغ" value={`${payment.amount.toLocaleString("en-US")}K ر.س`} />
          <Fact label="البنك" value={payment.bankName} />
          <Fact label="رقم العملية" value={payment.txRef} />
          <Fact
            label="تاريخ الرفع"
            value={new Date(payment.uploadedAt).toLocaleString("ar-EG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </div>
        {payment.notes && (
          <div className="rounded-xl bg-muted/40 p-3 text-xs">
            <div className="mb-1 font-bold text-ink">ملاحظات العميل</div>
            <p className="text-foreground/80">{payment.notes}</p>
          </div>
        )}
        {payment.imageDataUrl && (
          <div>
            <div className="mb-1.5 text-xs font-bold text-ink">صورة الإثبات</div>
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={payment.imageDataUrl}
                alt="إثبات التحويل"
                className="max-h-[420px] w-full bg-muted/20 object-contain"
              />
            </div>
          </div>
        )}

        {!showReject ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-rose-300 hover:text-rose-600"
            >
              رفض الدفعة
            </button>
            <button
              type="button"
              onClick={verify}
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
            >
              تأكيد التحويل
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-bold text-rose-700">سبب الرفض</div>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: المبلغ المحول لا يطابق ميزانية المرحلة..."
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={reject}
                className="flex-1 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ============================================================
// Supervisor: assign field engineer (after payment verified)
// ============================================================
export function AssignFieldEngineerDialog({
  project,
  byName,
  onClose,
}: {
  project: ProjectDoc;
  byName: string;
  onClose: () => void;
}) {
  const [engineer, setEngineer] = useState(FIELD_ENGINEER_POOL[0]);

  const submit = () => {
    assignFieldEngineer(project.id, engineer, byName);
    toast.success("تم تعيين المهندس الميداني", {
      description: `${engineer} على ${project.name}`,
    });
    onClose();
  };

  return (
    <ModalShell title="تعيين مهندس ميداني" subtitle={project.name} onClose={onClose}>
      <div className="space-y-4 p-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink">
            <HardHat className="h-3.5 w-3.5" /> اختر المهندس
          </span>
          <select
            value={engineer}
            onChange={(e) => setEngineer(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            {FIELD_ENGINEER_POOL.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
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
            type="button"
            onClick={submit}
            className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            تعيين
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================
// Field engineer: accept project assignment
// ============================================================
export function FieldEngineerAcceptDialog({
  project,
  engineerName,
  onClose,
}: {
  project: ProjectDoc;
  engineerName: string;
  onClose: () => void;
}) {
  return (
    <ModalShell title="قبول مشروع جديد" subtitle={project.id} onClose={onClose}>
      <div className="space-y-4 p-5">
        <ProjectFactsGrid project={project} />
        <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-3 text-xs text-foreground/80">
          عند القبول ستتمكن من إضافة التقارير اليومية والأسبوعية ونهاية المراحل لهذا المشروع.
        </div>
        <div className="flex gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
          >
            لاحقاً
          </button>
          <button
            type="button"
            onClick={() => {
              fieldEngineerAccept(project.id, engineerName);
              toast.success("تم قبول المشروع", {
                description: "يمكنك الآن البدء بإضافة التقارير",
              });
              onClose();
            }}
            className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
          >
            قبول المشروع
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================
// Owner: project timeline view
// ============================================================
const KIND_META: Record<TimelineEvent["kind"], { color: string; bg: string; icon: React.ReactNode }> = {
  created: { color: "text-sky-700", bg: "bg-sky-100", icon: <PlusCircle className="h-3.5 w-3.5" /> },
  approved: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { color: "text-rose-700", bg: "bg-rose-100", icon: <XCircle className="h-3.5 w-3.5" /> },
  assigned: { color: "text-violet-700", bg: "bg-violet-100", icon: <UserCheck className="h-3.5 w-3.5" /> },
  accepted: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  quote: { color: "text-amber-700", bg: "bg-amber-100", icon: <FileText className="h-3.5 w-3.5" /> },
  payment: { color: "text-blue-700", bg: "bg-blue-100", icon: <Banknote className="h-3.5 w-3.5" /> },
  verified: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  phase_started: { color: "text-orange-700", bg: "bg-orange-100", icon: <Workflow className="h-3.5 w-3.5" /> },
  phase_completed: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <Layers className="h-3.5 w-3.5" /> },
  report: { color: "text-sky-700", bg: "bg-sky-100", icon: <FileText className="h-3.5 w-3.5" /> },
  info: { color: "text-foreground/70", bg: "bg-muted", icon: <ChevronRight className="h-3.5 w-3.5" /> },
};

export function ProjectTimeline({ project }: { project: ProjectDoc }) {
  const events = useMemo(
    () => [...project.timeline].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    [project.timeline],
  );

  return (
    <div className="space-y-3">
      {events.map((ev, i) => {
        const meta = KIND_META[ev.kind];
        const date = new Date(ev.at).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
                {meta.icon}
              </span>
              {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="text-sm font-bold text-ink">{ev.label}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {date}
                {ev.by && (
                  <>
                    <span>•</span>
                    <span>{ev.by}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Avoid unused import warnings
const _UNUSED = { Building2, Clock, CreditCard, Camera, ArrowDown };
void _UNUSED;
