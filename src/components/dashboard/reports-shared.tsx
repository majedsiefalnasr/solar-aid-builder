import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  MapPin,
  Printer,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  approveReport,
  createReport,
  rejectReport,
  reportSchedule,
  reportTypeLabel,
  type FieldReportDoc,
  type ProjectDoc,
  type ReportType,
} from "@/lib/workflow-store";
import { Pill } from "./dashboard-ui";
import { openPrintableReport } from "./print-report";

// ============================================================
// File -> data URL helpers
// ============================================================
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Resize image client-side to keep localStorage usage modest
async function compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<string> {
  if (!file.type.startsWith("image/")) return readAsDataURL(file);
  const dataUrl = await readAsDataURL(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ============================================================
// Add Report Dialog (used by field engineer)
// ============================================================

const REPORT_TYPES: { value: ReportType; label: string; hint: string }[] = [
  { value: "daily", label: "تقرير يومي", hint: "ملخص عمل اليوم" },
  { value: "weekly", label: "تقرير أسبوعي", hint: "خلاصة أسبوع كامل" },
  { value: "phase_end", label: "نهاية مرحلة", hint: "تسليم مرحلة كاملة" },
];

export function AddReportDialog({
  projects,
  defaultProjectId,
  defaultPhaseId,
  engineerName,
  onClose,
  onCreated,
}: {
  projects: ProjectDoc[];
  defaultProjectId?: string;
  defaultPhaseId?: string;
  engineerName: string;
  onClose: () => void;
  onCreated?: (report: FieldReportDoc) => void;
}) {
  const [type, setType] = useState<ReportType>("daily");
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId ?? projects[0]?.id ?? "",
  );
  const [phaseId, setPhaseId] = useState<string>(defaultPhaseId ?? "");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === projectId);
  const phases = project?.phases ?? [];

  useEffect(() => {
    if (!phaseId && phases.length > 0) {
      const active = phases.find((ph) => ph.status === "in_progress") ?? phases[0];
      setPhaseId(active.id);
    }
  }, [phaseId, phases]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const arr = Array.from(files).slice(0, 6 - photos.length);
      const compressed = await Promise.all(arr.map((f) => compressImage(f)));
      setPhotos((prev) => [...prev, ...compressed].slice(0, 6));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("يرجى اختيار المشروع");
      return;
    }
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان التقرير");
      return;
    }
    if (!note.trim()) {
      toast.error("يرجى إدخال وصف للتقرير");
      return;
    }
    const phase = phases.find((p) => p.id === phaseId);
    const report = createReport({
      projectId,
      phaseId: phase?.id,
      phaseName: phase?.name,
      type,
      title: title.trim(),
      note: note.trim(),
      engineer: engineerName,
      photos,
    });
    toast.success("تم إرسال التقرير للمراجعة", {
      description: `${reportTypeLabel(type)} • ${title}`,
    });
    onCreated?.(report);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-5 backdrop-blur">
          <div>
            <h2 className="text-lg font-extrabold text-ink">إضافة تقرير ميداني</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              يُرسل للمهندس المشرف للمراجعة
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          {/* Type */}
          <div>
            <span className="mb-2 block text-xs font-bold text-ink">نوع التقرير</span>
            <div className="grid grid-cols-3 gap-2">
              {REPORT_TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition ${
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background text-foreground/70 hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs font-bold">{t.label}</span>
                    <span className="mt-0.5 text-[10px] opacity-80">{t.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">المشروع</span>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setPhaseId("");
              }}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {projects.length === 0 && <option value="">لا توجد مشاريع</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {/* Phase */}
          {phases.length > 0 && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">المرحلة</span>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Title */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">عنوان التقرير</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: صب الجدران الجنوبية"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          {/* Note */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">الوصف التفصيلي</span>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ما الذي تم اليوم؟ هل توجد ملاحظات أو معوقات؟"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          {/* Photos */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                الصور <span className="font-normal text-muted-foreground">(حتى 6)</span>
              </span>
              <span className="text-[11px] text-muted-foreground">{photos.length}/6</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            {photos.length > 0 && (
              <div className="mb-2 grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute left-1 top-1 rounded-full bg-rose-500 p-1 text-white shadow-md hover:bg-rose-600"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-4 text-xs font-bold text-foreground/70 transition hover:border-primary hover:bg-primary-soft/40 hover:text-primary disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
                {busy ? "جاري المعالجة…" : "إضافة صور"}
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
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
            >
              إرسال التقرير
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Report viewer (read-only / with optional review actions)
// ============================================================

export function ReportViewerDialog({
  report,
  project,
  canReview,
  reviewerName,
  onClose,
}: {
  report: FieldReportDoc;
  project?: ProjectDoc;
  canReview?: boolean;
  reviewerName?: string;
  onClose: () => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const sched = reportSchedule(report);
  const dateLabel = new Date(report.date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const doApprove = () => {
    if (!reviewerName) return;
    approveReport(report.id, reviewerName);
    toast.success("تم اعتماد التقرير", {
      description: `سيظهر للعميل والمقاول الآن`,
    });
    onClose();
  };

  const doReject = () => {
    if (!reviewerName) return;
    if (!reason.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }
    rejectReport(report.id, reviewerName, reason.trim());
    toast.error("تم رفض التقرير", {
      description: "تم إعلام المهندس الميداني بالسبب",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-card/95 p-5 backdrop-blur">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="info">{report.id}</Pill>
              <Pill tone="muted">{reportTypeLabel(report.type)}</Pill>
              <Pill
                tone={
                  report.status === "approved"
                    ? "primary"
                    : report.status === "rejected"
                      ? "danger"
                      : "accent"
                }
              >
                {report.status === "approved"
                  ? "معتمد"
                  : report.status === "rejected"
                    ? "مرفوض"
                    : "بانتظار المراجعة"}
              </Pill>
              {sched.state === "late" && report.status === "pending" && (
                <Pill tone="danger">متأخر {Math.abs(sched.daysOff)} يوم</Pill>
              )}
              {sched.state === "soon" && report.status === "pending" && (
                <Pill tone="accent">قريب الموعد</Pill>
              )}
            </div>
            <h2 className="mt-2 text-lg font-extrabold text-ink">{report.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {report.engineer} • {dateLabel}
              {project && <> • {project.name}</>}
              {report.phaseName && <> • {report.phaseName}</>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {report.status === "rejected" && report.rejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div>
                  <div className="text-xs font-bold text-rose-700">سبب الرفض</div>
                  <p className="mt-1 text-xs text-rose-700/90">{report.rejectionReason}</p>
                  {report.reviewedBy && (
                    <p className="mt-1 text-[11px] text-rose-600/70">
                      بواسطة: {report.reviewedBy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {report.status === "approved" && (
            <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-bold text-primary">تم الاعتماد</div>
                  {report.reviewedBy && (
                    <p className="mt-1 text-[11px] text-primary/80">بواسطة: {report.reviewedBy}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink">
              <FileText className="h-4 w-4" /> التفاصيل
            </div>
            <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/90">
              {report.note}
            </p>
          </div>

          {report.photos.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink">
                <ImageIcon className="h-4 w-4" /> الصور المرفقة ({report.photos.length})
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {report.photos.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {report.photos.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              لا توجد صور مرفقة
            </div>
          )}
        </div>

        {/* Review actions */}
        {canReview && report.status === "pending" && reviewerName && (
          <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
            {!showReject ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold hover:border-rose-400 hover:text-rose-600"
                >
                  رفض مع السبب
                </button>
                <button
                  type="button"
                  onClick={doApprove}
                  className="flex-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
                >
                  اعتماد التقرير
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="سبب الرفض (سيُعلم به المهندس الميداني)"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReject(false)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={doReject}
                    className="flex-1 rounded-full bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-cta hover:bg-rose-600"
                  >
                    تأكيد الرفض
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Report row (compact list item)
// ============================================================

export function ReportRow({
  report,
  projectName,
  onOpen,
}: {
  report: FieldReportDoc;
  projectName?: string;
  onOpen: () => void;
}) {
  const sched = reportSchedule(report);
  const dateLabel = new Date(report.date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });

  const tone =
    report.status === "approved"
      ? "primary"
      : report.status === "rejected"
        ? "danger"
        : "accent";

  return (
    <button
      onClick={onOpen}
      className="group flex w-full flex-col gap-2 rounded-xl border border-border bg-background p-4 text-right transition hover:border-primary hover:shadow-card md:flex-row md:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="info">{report.id}</Pill>
          <Pill tone="muted">{reportTypeLabel(report.type)}</Pill>
          <Pill tone={tone}>
            {report.status === "approved"
              ? "معتمد"
              : report.status === "rejected"
                ? "مرفوض"
                : "بانتظار"}
          </Pill>
          {sched.state === "late" && report.status === "pending" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              <AlertCircle className="h-3 w-3" /> متأخر {Math.abs(sched.daysOff)}ي
            </span>
          )}
          {sched.state === "soon" && report.status === "pending" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <Clock className="h-3 w-3" /> قريب
            </span>
          )}
        </div>
        <div className="mt-1.5 truncate text-sm font-bold text-ink group-hover:text-primary">
          {report.title}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{report.note}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span>{report.engineer}</span>
          <span>•</span>
          <span>{dateLabel}</span>
          {projectName && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {projectName}
              </span>
            </>
          )}
          {report.photos.length > 0 && (
            <>
              <span>•</span>
              <span>📷 {report.photos.length}</span>
            </>
          )}
        </div>
      </div>
      <span className="hidden shrink-0 rounded-full bg-muted/50 p-2 text-muted-foreground transition group-hover:bg-primary-soft group-hover:text-primary md:inline-flex">
        <Eye className="h-4 w-4" />
      </span>
    </button>
  );
}
