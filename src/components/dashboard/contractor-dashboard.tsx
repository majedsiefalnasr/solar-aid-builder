import { useState } from "react";
import { Camera, FileUp, HardHat, Hourglass, Send, ShoppingBag, UserPlus, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  FIELD_REPORTS,
  MOCK_PROJECT,
  PAYMENT_REQUESTS,
} from "@/lib/dashboard-data";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";

export function ContractorDashboard() {
  const activePhase = MOCK_PROJECT.phases.find((p) => p.status === "in_progress");
  const collected = PAYMENT_REQUESTS.filter((x) => x.status === "released").reduce(
    (s, x) => s + x.amount,
    0,
  );
  const inReview = PAYMENT_REQUESTS.filter(
    (x) => x.status === "pending" || x.status === "approved",
  ).reduce((s, x) => s + x.amount, 0);

  const [phase, setPhase] = useState(activePhase?.name ?? "");
  const [progress, setProgress] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [paymentDialog, setPaymentDialog] = useState(false);
  const [fieldEngDialog, setFieldEngDialog] = useState(false);

  const handleSubmitReport = async () => {
    if (!progress) {
      toast.error("يرجى إدخال نسبة الإنجاز");
      return;
    }
    setSubmitting(true);
    const tid = toast.loading("جارٍ رفع التقرير…");
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("تم رفع التقرير للمراجعة", {
      id: tid,
      description: `${phase} — ${progress}% • ${photos.length} صورة`,
    });
    setProgress("");
    setNote("");
    setPhotos([]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-l from-accent/10 via-card to-card p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-accent">المرحلة النشطة</div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">
              {activePhase?.name ?? "—"}
            </h1>
            <div className="mt-2 text-xs text-muted-foreground">مشروع: {MOCK_PROJECT.name}</div>
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-muted-foreground">قيمة المرحلة</div>
            <div className="text-2xl font-extrabold text-ink">
              {activePhase ? fmtMoney(activePhase.amount) : "—"}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">تقدم المرحلة</span>
            <span className="text-ink">{activePhase?.progress ?? 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-accent to-orange-300"
              style={{ width: `${activePhase?.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="مستحقات محصّلة" value={fmtMoney(collected)} icon={<Wallet className="h-5 w-5" />} tone="primary" />
        <StatCard label="بانتظار التحرير" value={fmtMoney(inReview)} icon={<Hourglass className="h-5 w-5" />} tone="accent" />
        <StatCard label="عمالة بالموقع" value="24" hint="نشطون اليوم" icon={<HardHat className="h-5 w-5" />} />
        <StatCard label="تقاريري الأخيرة" value={FIELD_REPORTS.length} icon={<FileUp className="h-5 w-5" />} />
      </div>

      {/* Quick actions */}
      <SectionCard title="إجراءات سريعة" subtitle="أنجز أهم مهامك بضغطة واحدة">
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => {
              const el = document.getElementById("contractor-report-form");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
              toast("ابدأ تعبئة التقرير أدناه", { description: activePhase?.name ?? "—" });
            }}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 text-right transition hover:border-primary hover:shadow-cta"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><FileUp className="h-5 w-5" /></span>
            <div className="text-sm font-extrabold text-ink group-hover:text-primary">رفع تقرير إنجاز</div>
            <div className="text-[11px] text-muted-foreground">على المرحلة النشطة</div>
          </button>
          <button
            onClick={() => setPaymentDialog(true)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 text-right transition hover:border-primary hover:shadow-cta"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent"><Wallet className="h-5 w-5" /></span>
            <div className="text-sm font-extrabold text-ink group-hover:text-primary">طلب صرف دفعة</div>
            <div className="text-[11px] text-muted-foreground">حسب المرحلة المعتمدة</div>
          </button>
          <button
            onClick={() => setFieldEngDialog(true)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 text-right transition hover:border-primary hover:shadow-cta"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><UserPlus className="h-5 w-5" /></span>
            <div className="text-sm font-extrabold text-ink group-hover:text-primary">طلب مهندس ميداني</div>
            <div className="text-[11px] text-muted-foreground">معاينة وتوثيق</div>
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="رفع تقرير إنجاز"
          subtitle="أرفق صور وفيديو لإثبات نسبة الإنجاز"
          className="lg:col-span-2"
        >
          <div id="contractor-report-form" className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">المرحلة</span>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                {MOCK_PROJECT.phases
                  .filter((p) => p.status === "in_progress" || p.status === "awaiting_funding")
                  .map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">نسبة الإنجاز اليوم</span>
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="مثال: 65"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">ملاحظات</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اكتب وصفاً للعمل المنجز…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background py-6 text-center transition hover:border-primary">
              <Camera className="h-7 w-7 text-muted-foreground" />
              <span className="mt-1.5 text-sm font-bold text-ink">
                {photos.length > 0 ? `${photos.length} صورة محددة` : "إرفاق صور"}
              </span>
              <span className="text-[11px] text-muted-foreground">حتى 20 صورة</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSubmitReport}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? "جارٍ الإرسال…" : "رفع التقرير للمراجعة"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="حالة طلبات الدفع">
          <div className="space-y-3">
            {PAYMENT_REQUESTS.map((req) => (
              <div key={req.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-ink">{req.phase}</div>
                  <Pill
                    tone={
                      req.status === "released" ? "primary" : req.status === "approved" ? "info" : req.status === "rejected" ? "danger" : "accent"
                    }
                  >
                    {req.status === "released" ? "مُحرّرة" : req.status === "approved" ? "اعتُمدت" : req.status === "rejected" ? "مرفوضة" : "بانتظار"}
                  </Pill>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{req.submittedAt}</span>
                  <span className="font-extrabold text-ink">{fmtMoney(req.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {paymentDialog && (
        <RequestPaymentDialog
          onClose={() => setPaymentDialog(false)}
          onSubmit={(p, amount) => {
            toast.success("تم إرسال طلب الدفع", {
              description: `${p} — ${fmtMoney(amount)} • سيراجعه المشرف ثم يُحال للمالك`,
            });
            setPaymentDialog(false);
          }}
        />
      )}
      {fieldEngDialog && (
        <RequestFieldEngineerDialog
          onClose={() => setFieldEngDialog(false)}
          onSubmit={(when) => {
            toast.success("تم إرسال طلب مهندس ميداني", {
              description: `الموعد المفضّل: ${when}`,
            });
            setFieldEngDialog(false);
          }}
        />
      )}

      <div className="hidden">
        <Link to="/store">store</Link>
        <ShoppingBag />
      </div>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function RequestPaymentDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (phase: string, amount: number) => void;
}) {
  const phases = MOCK_PROJECT.phases.filter((p) => p.status === "in_progress" || p.status === "completed");
  const [phase, setPhase] = useState(phases[0]?.name ?? "");
  const [amount, setAmount] = useState<number>(phases[0]?.amount ?? 0);
  return (
    <ModalShell title="طلب صرف دفعة" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!amount || amount <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح");
            return;
          }
          onSubmit(phase, amount);
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink">المرحلة</span>
          <select
            value={phase}
            onChange={(e) => {
              setPhase(e.target.value);
              const p = phases.find((x) => x.name === e.target.value);
              if (p) setAmount(p.amount);
            }}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            {phases.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink">المبلغ المطلوب (بآلاف الريالات)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary">
            إلغاء
          </button>
          <button type="submit" className="flex-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta">
            إرسال الطلب
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RequestFieldEngineerDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (when: string) => void;
}) {
  const [when, setWhen] = useState("");
  const [purpose, setPurpose] = useState("معاينة المرحلة الحالية");
  return (
    <ModalShell title="طلب مهندس ميداني" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!when) {
            toast.error("يرجى تحديد التاريخ");
            return;
          }
          onSubmit(when);
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink">سبب المعاينة</span>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option>معاينة المرحلة الحالية</option>
            <option>توثيق صور وفيديو</option>
            <option>قياسات هندسية</option>
            <option>مراجعة جودة التنفيذ</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink">التاريخ المفضّل</span>
          <input
            type="date"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary">
            إلغاء
          </button>
          <button type="submit" className="flex-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta">
            إرسال الطلب
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
