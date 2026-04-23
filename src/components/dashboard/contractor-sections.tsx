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
import { products as STORE_PRODUCTS, filterCategories } from "@/lib/products";
import { ContractorDashboard } from "./contractor-dashboard";
import { Pill, SectionCard, StatCard, fmtMoney } from "./dashboard-ui";
import { PageHeader } from "./section-shell";
import { ProjectDetail } from "./project-detail";
import { MessagesScreen } from "./messages-screen";

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
    case "messages":
      return <MessagesScreen role="contractor" />;
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
    nextPayout: 3_700,
  },
  {
    id: "PRJ-2099",
    name: "مجمع النور التجاري",
    city: "صنعاء",
    progress: 18,
    activePhase: "الحفر والأساسات",
    nextPayout: 5_200,
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

const TASKS = [
  {
    id: "T-401",
    title: "صب جدران الدور الثاني",
    project: "فيلا الياسمين",
    due: "2026-04-26",
    priority: "high" as const,
    done: false,
  },
  {
    id: "T-402",
    title: "تسليم تقرير المرحلة الثالثة",
    project: "فيلا الياسمين",
    due: "2026-04-28",
    priority: "medium" as const,
    done: false,
  },
  {
    id: "T-403",
    title: "طلب توريد حديد تسليح 14مم",
    project: "مجمع النور",
    due: "2026-04-25",
    priority: "high" as const,
    done: false,
  },
  {
    id: "T-404",
    title: "اعتماد قياسات الميول من المشرف",
    project: "فيلا الياسمين",
    due: "2026-04-22",
    priority: "low" as const,
    done: true,
  },
];

function ContractorTasks() {
  return (
    <>
      <PageHeader title="المهام" subtitle="مهامك اليومية على جميع المشاريع" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="مهام اليوم"
          value={TASKS.filter((t) => !t.done).length}
          icon={<ListChecks className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="منتهية"
          value={TASKS.filter((t) => t.done).length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="عاجلة"
          value={TASKS.filter((t) => t.priority === "high" && !t.done).length}
          icon={<Clock className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <SectionCard title="قائمة المهام">
        <div className="space-y-2">
          {TASKS.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-xl border border-border bg-background p-4 ${
                t.done ? "opacity-60" : ""
              }`}
            >
              <input type="checkbox" defaultChecked={t.done} className="h-4 w-4 accent-primary" />
              <div className="flex-1">
                <div className={`text-sm font-bold text-ink ${t.done ? "line-through" : ""}`}>
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {t.project}
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  {t.due}
                </div>
              </div>
              <Pill
                tone={
                  t.priority === "high" ? "danger" : t.priority === "medium" ? "accent" : "muted"
                }
              >
                {t.priority === "high" ? "عاجل" : t.priority === "medium" ? "متوسط" : "عادي"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function ContractorWithdrawals() {
  const [open, setOpen] = useState(false);
  const released = PAYMENT_REQUESTS.filter((x) => x.status === "released").reduce(
    (s, x) => s + x.amount,
    0,
  );
  const pending = PAYMENT_REQUESTS.filter(
    (x) => x.status === "pending" || x.status === "approved",
  ).reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <PageHeader title="السحوبات" subtitle="مستحقاتك وطلبات السحب الحالية" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="رصيد متاح للسحب" value={fmtMoney(released)} icon={<Wallet className="h-5 w-5" />} tone="primary" />
        <StatCard label="قيد المراجعة" value={fmtMoney(pending)} icon={<Clock className="h-5 w-5" />} tone="accent" />
        <StatCard label="عمولة المنصة" value="2.5%" hint="على المبالغ المُحرّرة" />
      </div>

      <SectionCard
        title="طلب سحب جديد"
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-cta"
          >
            إنشاء طلب
          </button>
        }
      >
        <div className="rounded-xl bg-primary-soft/40 p-4 text-xs text-foreground/80">
          يتم تحويل المبالغ المعتمدة خلال 3 أيام عمل إلى الحساب البنكي المسجّل.
        </div>
      </SectionCard>

      <SectionCard title="سجل السحوبات" className="mt-6">
        <div className="space-y-3">
          {PAYMENT_REQUESTS.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <div>
                <div className="text-sm font-bold text-ink">{req.phase}</div>
                <div className="text-[11px] text-muted-foreground">{req.id} • {req.submittedAt}</div>
              </div>
              <div className="text-base font-extrabold text-ink">{fmtMoney(req.amount)}</div>
              <Pill
                tone={
                  req.status === "released" ? "primary" : req.status === "approved" ? "info" : req.status === "rejected" ? "danger" : "accent"
                }
              >
                {req.status === "released" ? "مُحرّرة" : req.status === "approved" ? "اعتُمدت" : req.status === "rejected" ? "مرفوضة" : "بانتظار"}
              </Pill>
            </div>
          ))}
        </div>
      </SectionCard>

      {open && <NewWithdrawalDialog max={released} onClose={() => setOpen(false)} />}
    </>
  );
}

function NewWithdrawalDialog({ max, onClose }: { max: number; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [iban, setIban] = useState("");

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
            toast.success("تم إنشاء طلب السحب", {
              description: `${fmtMoney(amount)} • سيتم التحويل خلال 3 أيام عمل`,
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

  const cartLines = cart
    .map((l) => ({ ...l, product: STORE_PRODUCTS.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);
  const total = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <PageHeader
        title="شراء مواد"
        subtitle="متجر المقاولين على منصة تم — خصومات حصرية على مواد البناء والأدوات"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
            {items.map((p) => (
              <article
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-elevated"
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft/60 to-accent/15 text-primary">
                  <ShoppingBag className="h-10 w-10" />
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
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-cta"
                  >
                    <Plus className="h-3 w-3" /> أضف
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Cart sidebar */}
        <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-extrabold text-ink">سلة الشراء</h3>
            </div>
            <Pill tone="primary">{count}</Pill>
          </div>
          {cartLines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-xs text-muted-foreground">
              السلة فارغة — أضف منتجات من القائمة
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {cartLines.map((l) => (
                  <li key={l.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="line-clamp-1 text-xs font-bold text-ink">{l.product.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQty(l.id, l.qty - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:border-primary"
                          aria-label="إنقاص"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-extrabold text-ink">{l.qty}</span>
                        <button
                          onClick={() => setQty(l.id, l.qty + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:border-primary"
                          aria-label="زيادة"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs font-extrabold text-ink">
                        {(l.product.price * l.qty).toLocaleString()} ر.س
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الإجمالي</span>
                  <span className="text-base font-extrabold text-ink">{total.toLocaleString()} ر.س</span>
                </div>
                <button
                  onClick={() => {
                    toast.success("تم إرسال طلب الشراء", { description: `${count} منتجات • ${total.toLocaleString()} ر.س` });
                    setCart([]);
                  }}
                  className="w-full rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
                >
                  إتمام الطلب
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      <div className="hidden">
        <span>{FIELD_REPORTS.length}</span>
        <ArrowLeft />
        <Link to="/store">store</Link>
      </div>
    </>
  );
}
