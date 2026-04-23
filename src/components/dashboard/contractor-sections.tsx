import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Landmark,
  ListChecks,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { FIELD_REPORTS, MOCK_PROJECT, PAYMENT_REQUESTS } from "@/lib/dashboard-data";
import {
  ROLE_USER,
  markTaskDone,
  requestWithdrawal,
  useWorkflow,
} from "@/lib/workflow-store";
import { products as STORE_PRODUCTS, filterCategories } from "@/lib/products";
import { ContractorDashboard } from "./contractor-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectDetail } from "./project-detail";
import { MessagesScreen } from "./messages-screen";
import { ReportsSection } from "./reports-section";
import { SettingsSection } from "./settings-section";

export function ContractorSection({
  section,
  projectId,
}: {
  section: string;
  projectId?: string;
}) {
  switch (section) {
    case "overview":
      return <ContractorDashboard />;
    case "projects":
      return <ContractorProjects />;
    case "project-detail":
      return <ProjectDetail role="contractor" projectId={projectId} />;
    case "tasks":
      return <ContractorTasks />;
    case "withdrawals":
      return <ContractorWithdrawals />;
    case "buy-materials":
      return <ContractorMaterials />;
    case "reports":
      return <ReportsSection role="contractor" />;
    case "messages":
      return <MessagesScreen role="contractor" />;
    case "settings":
      return <SettingsSection role="contractor" />;
    default:
      return <ContractorDashboard />;
  }
}

const CONTRACTOR_PROJECTS = [
  {
    id: MOCK_PROJECT.id,
    name: MOCK_PROJECT.name,
    city: MOCK_PROJECT.city,
    progress: MOCK_PROJECT.overallProgress,
    activePhase: "البناء بالطوب والقواطع",
    nextPayout: 3.7,
  },
  {
    id: "PRJ-2099",
    name: "مجمع النور التجاري",
    city: "صنعاء",
    progress: 18,
    activePhase: "الحفر والأساسات",
    nextPayout: 5.2,
  },
];

function ContractorProjects() {
  return (
    <>
      <PageHeader title="مشاريعي" subtitle="المشاريع التي تنفذها حالياً" />
      <div className="grid gap-4 lg:grid-cols-2">
        {CONTRACTOR_PROJECTS.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:shadow-elevated"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-accent">#{p.id}</div>
                <h3 className="mt-1 text-lg font-extrabold text-ink">{p.name}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">📍 {p.city}</div>
              </div>
              <Pill tone="accent">{p.activePhase}</Pill>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>الإنجاز</span>
                <span className="text-ink">{p.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-accent to-orange-300"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs text-muted-foreground">الدفعة القادمة</div>
              <div className="text-sm font-extrabold text-ink">{fmtMoney(p.nextPayout)}</div>
            </div>
            <Link
              to="/dashboard"
              search={{ role: "contractor", section: "project-detail", projectId: p.id }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              <Eye className="h-3.5 w-3.5" />
              فتح تفاصيل المشروع
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

function ContractorTasks() {
  const store = useWorkflow();
  const contractorName = ROLE_USER.contractor;
  const myProjects = store.projects.filter((p) => p.contractorName === contractorName);

  const allTasks = myProjects.flatMap((p) =>
    p.phases.flatMap((ph) =>
      ph.tasks.map((t) => ({ project: p, phase: ph, task: t })),
    ),
  );
  const todo = allTasks.filter((x) => x.task.approval === "todo" || !x.task.approval);
  const pending = allTasks.filter((x) => x.task.approval === "pending");
  const approved = allTasks.filter((x) => x.task.approval === "approved");
  const rejected = allTasks.filter((x) => x.task.approval === "rejected");

  const handleMarkDone = (projectId: string, phaseId: string, taskId: string) => {
    markTaskDone(projectId, phaseId, taskId, contractorName);
    toast.success("تم تسجيل المهمة كمنجزة", { description: "بانتظار اعتماد المشرف" });
  };

  return (
    <>
      <PageHeader title="المهام" subtitle="مهامك على جميع المراحل النشطة" />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="بانتظار التأشير" value={todo.length} icon={<ListChecks className="h-5 w-5" />} />
        <StatCard label="بانتظار الاعتماد" value={pending.length} icon={<Clock className="h-5 w-5" />} tone="accent" />
        <StatCard label="معتمدة" value={approved.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="مرفوضة" value={rejected.length} icon={<X className="h-5 w-5" />} tone="danger" />
      </div>

      {allTasks.length === 0 ? (
        <SectionCard title="لا توجد مهام">
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            لا توجد مهام على مشاريعك حتى الآن.
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="قائمة المهام">
          <div className="space-y-2">
            {allTasks.map(({ project, phase, task }) => {
              const status = task.approval ?? "todo";
              return (
                <div
                  key={`${project.id}-${phase.id}-${task.id}`}
                  className={`flex items-center gap-3 rounded-xl border border-border bg-background p-4 ${
                    status === "approved" ? "opacity-70" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={status === "approved" || status === "pending"}
                    disabled={status === "approved" || status === "pending"}
                    onChange={() => handleMarkDone(project.id, phase.id, task.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-bold text-ink ${status === "approved" ? "line-through" : ""}`}>
                      {task.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {project.name}
                      <span>•</span>
                      {phase.name}
                      {status === "rejected" && task.rejectionReason && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600">سبب الرفض: {task.rejectionReason}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Pill
                    tone={
                      status === "approved"
                        ? "primary"
                        : status === "pending"
                          ? "accent"
                          : status === "rejected"
                            ? "danger"
                            : "muted"
                    }
                  >
                    {status === "approved"
                      ? "معتمدة"
                      : status === "pending"
                        ? "بانتظار الاعتماد"
                        : status === "rejected"
                          ? "مرفوضة — أعد التنفيذ"
                          : "قيد التنفيذ"}
                  </Pill>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </>
  );
}

function ContractorWithdrawals() {
  const store = useWorkflow();
  const contractorName = ROLE_USER.contractor;
  const [open, setOpen] = useState(false);

  const myWithdrawals = store.withdrawals.filter((w) => w.contractorName === contractorName);
  const earned = store.projects
    .filter((p) => p.contractorName === contractorName)
    .flatMap((p) => p.phases)
    .filter((ph) => ph.status === "completed")
    .reduce((s, ph) => s + ph.budget, 0);
  const locked = myWithdrawals
    .filter((w) => w.status === "pending" || w.status === "approved" || w.status === "withdrawable")
    .reduce((s, w) => s + w.amount, 0);
  const available = Math.max(0, earned - locked);
  const pendingAmount = myWithdrawals.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0);

  const statusLabel: Record<string, string> = {
    pending: "بانتظار الإدارة",
    approved: "معتمد (انتظار 3 أيام)",
    withdrawable: "قابل للسحب",
    rejected: "مرفوض",
  };
  const toneOf = (s: string): "muted" | "primary" | "accent" | "danger" | "info" =>
    s === "withdrawable" ? "primary" : s === "approved" ? "info" : s === "rejected" ? "danger" : "accent";

  return (
    <>
      <PageHeader title="السحوبات" subtitle="مستحقاتك المكتسبة من المراحل المكتملة وطلبات السحب" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="رصيد متاح للسحب" value={fmtMoney(available)} icon={<Wallet className="h-5 w-5" />} tone="primary" />
        <StatCard label="قيد المراجعة" value={fmtMoney(pendingAmount)} icon={<Clock className="h-5 w-5" />} tone="accent" />
        <StatCard label="إجمالي مكتسب" value={fmtMoney(earned)} icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <SectionCard
        title="طلب سحب جديد"
        action={
          <button
            onClick={() => setOpen(true)}
            disabled={available <= 0}
            className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta disabled:opacity-50"
          >
            إنشاء طلب
          </button>
        }
      >
        <div className="rounded-xl bg-primary-soft/40 p-4 text-xs text-foreground/80">
          الرصيد المتاح يأتي من ميزانية المراحل المكتملة (تقرير نهاية مرحلة معتمد). بعد اعتماد الإدارة لطلب السحب يصبح قابلاً للسحب بعد 3 أيام.
        </div>
      </SectionCard>

      <SectionCard title="سجل السحوبات" className="mt-6">
        {myWithdrawals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            لا توجد طلبات سحب حتى الآن.
          </div>
        ) : (
          <div className="space-y-3">
            {myWithdrawals.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink">{req.id}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(req.requestedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                    {req.txRef && <> • مرجع: <span className="font-mono">{req.txRef}</span></>}
                    {req.rejectionReason && <> • رفض: {req.rejectionReason}</>}
                  </div>
                  {req.status === "approved" && req.releasableAt && (
                    <div className="mt-1 text-[11px] text-info">
                      قابل للسحب في: {new Date(req.releasableAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                    </div>
                  )}
                </div>
                <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
                <Pill tone={toneOf(req.status)}>{statusLabel[req.status]}</Pill>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {open && (
        <NewWithdrawalDialog
          max={available}
          contractorName={contractorName}
          onClose={() => setOpen(false)}
        />
      )}

      {/* keep PAYMENT_REQUESTS import alive */}
      <span className="hidden">{PAYMENT_REQUESTS.length}</span>
    </>
  );
}

function NewWithdrawalDialog({
  max,
  contractorName,
  onClose,
}: {
  max: number;
  contractorName: string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number>(0);
  const [iban, setIban] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-extrabold text-ink">إنشاء طلب سحب جديد</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!amount || amount <= 0) {
              toast.error("يرجى إدخال مبلغ صحيح");
              return;
            }
            if (amount > max) {
              toast.error(`الحد الأقصى المتاح ${fmtMoney(max)}`);
              return;
            }
            if (!iban.trim()) {
              toast.error("يرجى إدخال رقم الحساب البنكي");
              return;
            }
            requestWithdrawal({
              contractorName,
              amount,
              iban: iban.trim(),
              notes: notes.trim() || undefined,
            });
            toast.success("تم إنشاء طلب السحب", {
              description: `${fmtMoney(amount)} • بانتظار اعتماد الإدارة`,
            });
            onClose();
          }}
          className="space-y-4 p-5"
        >
          <div className="rounded-xl bg-primary-soft/40 p-3 text-xs">
            <span className="text-muted-foreground">الرصيد المتاح: </span>
            <span className="font-extrabold text-ink">{fmtMoney(max)}</span>
          </div>
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
            <span className="mb-1.5 block text-xs font-bold text-ink">رقم الحساب البنكي (IBAN)</span>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="YE12 0000 0000 0000 0000 0000"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">ملاحظات (اختياري)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: مستحقات مرحلة الأساسات"
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
      </div>
    </div>
  );
}

// ---------- Embedded contractor store (simple grid + cart) ----------
type CartLine = { id: string; qty: number };

function ContractorMaterials() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const items = useMemo(() => {
    return STORE_PRODUCTS.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (query === "" || p.name.includes(query) || p.brand.includes(query)),
    );
  }, [query, cat]);

  const addToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id, qty: 1 }];
    });
    const p = STORE_PRODUCTS.find((x) => x.id === id);
    toast.success("تمت الإضافة للسلة", { description: p?.name });
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  };

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.id !== id));
  const clearCart = () => setCart([]);

  const cartLines = cart
    .map((l) => ({ ...l, product: STORE_PRODUCTS.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);
  const subtotal = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 50) : 0;
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + shipping + vat;
  const count = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <PageHeader
        title="شراء مواد"
        subtitle="متجر المقاولين على منصة تم — خصومات حصرية على مواد البناء والأدوات"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Products grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج…"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
            >
              <option value="all">جميع الفئات</option>
              {filterCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => {
              const inCart = cart.find((l) => l.id === p.id);
              return (
                <article
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-elevated"
                >
                  <div className="relative flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft/60 to-accent/15 text-primary">
                    <ShoppingBag className="h-10 w-10" />
                    {inCart && (
                      <span className="absolute right-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-extrabold text-primary-foreground shadow-cta">
                        {inCart.qty}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {p.badge && <Pill tone="accent">{p.badge}</Pill>}
                    <h3 className="mt-1 line-clamp-2 text-sm font-extrabold text-ink">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
                      <span>•</span>
                      <span>{p.brand}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <div className="text-base font-extrabold text-ink">
                        {p.price} <span className="text-[10px] font-bold text-muted-foreground">ر.س / {p.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
                    >
                      <Plus className="h-3 w-3" /> أضف
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Cart sidebar */}
        <aside className="sticky top-24 h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-l from-primary-soft/60 to-card p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-extrabold text-ink">سلة الشراء</h3>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="primary">{count} منتج</Pill>
              {cartLines.length > 0 && (
                <button
                  onClick={clearCart}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-rose-600"
                  aria-label="إفراغ السلة"
                  title="إفراغ السلة"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {cartLines.length === 0 ? (
            <div className="p-5">
              <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
                <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <div className="text-xs font-bold text-ink">السلة فارغة</div>
                <p className="mt-1 text-[11px] text-muted-foreground">أضف منتجات من القائمة لبدء طلبك</p>
              </div>
            </div>
          ) : (
            <>
              <ul className="max-h-[320px] space-y-2 overflow-y-auto p-4">
                {cartLines.map((l) => (
                  <li key={l.id} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft/60 text-primary">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="line-clamp-1 text-xs font-bold text-ink">{l.product.name}</div>
                        <button
                          onClick={() => removeLine(l.id)}
                          className="text-muted-foreground hover:text-rose-600"
                          aria-label="حذف"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {l.product.price} ر.س / {l.product.unit}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQty(l.id, l.qty - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary-soft"
                            aria-label="إنقاص"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold text-ink">{l.qty}</span>
                          <button
                            onClick={() => setQty(l.id, l.qty + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary-soft"
                            aria-label="زيادة"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-xs font-extrabold text-ink">
                          {(l.product.price * l.qty).toLocaleString()} ر.س
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-border bg-muted/30 p-4">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-ink">{subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3 w-3" /> الشحن
                  </span>
                  <span className="font-bold text-ink">
                    {shipping === 0 ? <span className="text-emerald-600">مجاني</span> : `${shipping} ر.س`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span className="font-bold text-ink">{vat.toLocaleString()} ر.س</span>
                </div>
                {subtotal > 0 && subtotal < 1000 && (
                  <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-700">
                    أضف بـ {(1000 - subtotal).toLocaleString()} ر.س للحصول على شحن مجاني
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-extrabold text-ink">الإجمالي</span>
                  <span className="text-lg font-extrabold text-primary">{total.toLocaleString()} ر.س</span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
                >
                  متابعة إلى الدفع <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> دفع آمن ومحمي
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {checkoutOpen && (
        <CheckoutDialog
          lines={cartLines}
          subtotal={subtotal}
          shipping={shipping}
          vat={vat}
          total={total}
          onClose={() => setCheckoutOpen(false)}
          onComplete={() => {
            setCheckoutOpen(false);
            clearCart();
          }}
        />
      )}

      <div className="hidden">
        <span>{FIELD_REPORTS.length}</span>
        <ArrowLeft />
        <Link to="/store">store</Link>
      </div>
    </>
  );
}

// ---------- Checkout multi-step dialog ----------
type CheckoutStep = "shipping" | "payment" | "review" | "confirmation";
type PayMethod = "card" | "bank" | "cod";

function CheckoutDialog({
  lines,
  subtotal,
  shipping,
  vat,
  total,
  onClose,
  onComplete,
}: {
  lines: { id: string; qty: number; product: (typeof STORE_PRODUCTS)[number] }[];
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Shipping
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("الرياض");
  const [address, setAddress] = useState("");
  const [siteName, setSiteName] = useState("");

  // Payment
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const stepIndex = ["shipping", "payment", "review", "confirmation"].indexOf(step);

  const goNext = () => {
    if (step === "shipping") {
      if (!name.trim() || !phone.trim() || !address.trim()) {
        toast.error("يرجى تعبئة بيانات الشحن المطلوبة");
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      if (payMethod === "card") {
        if (cardNumber.replace(/\s/g, "").length < 12 || !cardName.trim() || !cardExp || cardCvc.length < 3) {
          toast.error("يرجى إكمال بيانات البطاقة");
          return;
        }
      }
      setStep("review");
    } else if (step === "review") {
      placeOrder();
    }
  };

  const goBack = () => {
    if (step === "payment") setStep("shipping");
    else if (step === "review") setStep("payment");
  };

  const placeOrder = async () => {
    setSubmitting(true);
    const tid = toast.loading("جارٍ معالجة الطلب…");
    await new Promise((r) => setTimeout(r, 900));
    const id = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    setOrderId(id);
    setSubmitting(false);
    toast.success("تم تأكيد طلبك", { id: tid, description: id });
    setStep("confirmation");
  };

  const close = () => {
    if (step === "confirmation") {
      onComplete();
    } else {
      onClose();
    }
  };

  const payLabel: Record<PayMethod, string> = {
    card: "بطاقة بنكية",
    bank: "تحويل بنكي",
    cod: "الدفع عند الاستلام",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-l from-primary-soft/60 to-card p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">
              {step === "confirmation" ? "تم تأكيد الطلب" : "إتمام الشراء"}
            </h2>
            {step !== "confirmation" && (
              <p className="text-xs text-muted-foreground">إجمالي: {total.toLocaleString()} ر.س</p>
            )}
          </div>
          <button
            onClick={close}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper */}
        {step !== "confirmation" && (
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <ol className="flex items-center gap-2">
              {[
                { key: "shipping", label: "الشحن", icon: MapPin },
                { key: "payment", label: "الدفع", icon: CreditCard },
                { key: "review", label: "المراجعة", icon: ListChecks },
              ].map((s, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                const Icon = s.icon;
                return (
                  <li key={s.key} className="flex flex-1 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-primary text-primary-foreground shadow-cta"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        active ? "text-ink" : done ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < 2 && (
                      <div
                        className={`h-0.5 flex-1 rounded-full ${
                          done ? "bg-emerald-500" : "bg-border"
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "shipping" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="اسم المستلم *" value={name} onChange={setName} placeholder="الاسم الكامل" />
              <Field label="رقم الجوال *" value={phone} onChange={setPhone} placeholder="05xxxxxxxx" type="tel" />
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink">المدينة</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option>الرياض</option>
                  <option>جدة</option>
                  <option>الدمام</option>
                  <option>مكة المكرمة</option>
                  <option>المدينة المنورة</option>
                </select>
              </label>
              <Field label="اسم الموقع / المشروع" value={siteName} onChange={setSiteName} placeholder="مشروع فيلا الياسمين" icon={<Building2 className="h-3.5 w-3.5" />} />
              <div className="sm:col-span-2">
                <Field label="العنوان التفصيلي *" value={address} onChange={setAddress} placeholder="الحي، الشارع، رقم المبنى" />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-bold">
                  <Truck className="h-3.5 w-3.5" /> التوصيل المتوقع: 2-4 أيام عمل
                </div>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {(["card", "bank", "cod"] as PayMethod[]).map((m) => {
                  const active = payMethod === m;
                  const Icon = m === "card" ? CreditCard : m === "bank" ? Landmark : Wallet;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-right transition ${
                        active
                          ? "border-primary bg-primary-soft/60 shadow-cta"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-extrabold text-ink">{payLabel[m]}</span>
                    </button>
                  );
                })}
              </div>

              {payMethod === "card" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="رقم البطاقة" value={cardNumber} onChange={setCardNumber} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="الاسم على البطاقة" value={cardName} onChange={setCardName} placeholder="كما يظهر على البطاقة" />
                  </div>
                  <Field label="تاريخ الانتهاء" value={cardExp} onChange={setCardExp} placeholder="MM/YY" />
                  <Field label="CVC" value={cardCvc} onChange={setCardCvc} placeholder="123" type="password" />
                </div>
              )}

              {payMethod === "bank" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-ink">
                  <div className="font-extrabold">سيتم إرسال تفاصيل الحساب البنكي بعد تأكيد الطلب.</div>
                  <p className="mt-1 text-muted-foreground">يجب رفع إيصال التحويل خلال 48 ساعة لتأكيد الشحن.</p>
                </div>
              )}

              {payMethod === "cod" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <div className="font-extrabold">رسوم إضافية 25 ر.س لخدمة الدفع عند الاستلام.</div>
                  <p className="mt-1">جهّز المبلغ نقداً عند تسلّم الطلب.</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                جميع المعاملات محمية بتشفير SSL
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              {/* Items */}
              <div>
                <h3 className="mb-2 text-xs font-extrabold text-ink">المنتجات ({lines.length})</h3>
                <ul className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                  {lines.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-xs">
                      <span className="line-clamp-1 text-ink">
                        <span className="font-bold">{l.qty}×</span> {l.product.name}
                      </span>
                      <span className="font-extrabold text-ink">{(l.product.price * l.qty).toLocaleString()} ر.س</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryBlock title="عنوان الشحن" icon={<MapPin className="h-3.5 w-3.5" />}>
                  <div className="font-bold text-ink">{name}</div>
                  <div className="text-muted-foreground">{phone}</div>
                  <div className="text-muted-foreground">{city} • {address}</div>
                  {siteName && <div className="text-muted-foreground">الموقع: {siteName}</div>}
                </SummaryBlock>
                <SummaryBlock title="طريقة الدفع" icon={<CreditCard className="h-3.5 w-3.5" />}>
                  <div className="font-bold text-ink">{payLabel[payMethod]}</div>
                  {payMethod === "card" && cardNumber && (
                    <div className="text-muted-foreground">**** {cardNumber.replace(/\s/g, "").slice(-4)}</div>
                  )}
                </SummaryBlock>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-ink">{subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>الشحن</span>
                  <span className="font-bold text-ink">{shipping === 0 ? "مجاني" : `${shipping} ر.س`}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>ضريبة (15%)</span>
                  <span className="font-bold text-ink">{vat.toLocaleString()} ر.س</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-extrabold text-ink">الإجمالي</span>
                  <span className="text-lg font-extrabold text-primary">{total.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink">شكراً لطلبك!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                تم استلام طلبك بنجاح وسيتم تجهيزه للشحن
              </p>
              <div className="mx-auto mt-5 max-w-sm space-y-3 rounded-2xl border border-border bg-muted/30 p-4 text-right">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">رقم الطلب</span>
                  <span className="font-mono font-extrabold text-primary">{orderId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">المبلغ المدفوع</span>
                  <span className="font-extrabold text-ink">{total.toLocaleString()} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">طريقة الدفع</span>
                  <span className="font-bold text-ink">{payLabel[payMethod]}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground inline-flex items-center gap-1">
                    <Truck className="h-3 w-3" /> التسليم المتوقع
                  </span>
                  <span className="font-bold text-ink">2-4 أيام عمل</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                ستصلك رسالة بتأكيد الطلب وتحديثات الشحن على رقم الجوال
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/20 p-4">
          {step === "confirmation" ? (
            <div className="flex justify-center gap-2">
              <button
                onClick={onComplete}
                className="rounded-full border border-border bg-card px-5 py-2 text-xs font-bold hover:border-primary"
              >
                متابعة التسوق
              </button>
              <button
                onClick={() => {
                  toast("سيتم فتح صفحة الطلب", { description: orderId });
                  onComplete();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95"
              >
                <Package className="h-3.5 w-3.5" /> تتبع الطلب
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {step !== "shipping" ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold hover:border-primary"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> السابق
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-cta hover:bg-primary/95 disabled:opacity-60"
              >
                {step === "review" ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {submitting ? "جارٍ التأكيد…" : `تأكيد الدفع — ${total.toLocaleString()} ر.س`}
                  </>
                ) : (
                  <>
                    التالي <ArrowLeft className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function SummaryBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold text-primary">
        {icon}
        {title}
      </div>
      <div className="space-y-0.5 text-xs">{children}</div>
    </div>
  );
}
