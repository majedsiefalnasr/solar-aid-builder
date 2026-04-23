import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Sun,
  ShoppingCart,
  CheckCircle2,
  Layers,
  Plus,
  Minus,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import type { CalcResult, CalcState } from "@/lib/calculator";
import { arabicNumber } from "@/components/calculator-shell";
import {
  cartTotal,
  readProductCart,
  removeProductFromCart,
  updateProductQty,
  type ProductCartLine,
} from "@/lib/cart-store";
import { products } from "@/lib/products";

interface SolarItem {
  state: CalcState;
  result: CalcResult;
  pid: string;
  addedAt: string;
}

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "السلة | تم" },
      { name: "description", content: "راجع طلبك قبل إتمام الشراء." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const [solar, setSolar] = useState<SolarItem | null>(null);
  const [lines, setLines] = useState<ProductCartLine[]>([]);

  const refresh = () => {
    setLines(readProductCart());
    try {
      const raw = localStorage.getItem("mutajadidah:cart:v1");
      setSolar(raw ? JSON.parse(raw) : null);
    } catch {
      setSolar(null);
    }
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("tamm:cart-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tamm:cart-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const removeSolar = () => {
    localStorage.removeItem("mutajadidah:cart:v1");
    setSolar(null);
  };

  const productsTotal = cartTotal(lines, products);
  const solarTotal = solar?.result.totalSAR ?? 0;
  const grandTotal = productsTotal + solarTotal;
  const isEmpty = !solar && lines.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <Steps current={0} />

        <h1 className="mt-8 text-3xl font-extrabold text-ink md:text-4xl">سلة المشتريات</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          راجع منتجاتك قبل المتابعة للدفع.
        </p>

        {isEmpty ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-extrabold text-ink">سلتك فارغة</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ابدأ بتصفح المتجر أو احسب نظامك الشمسي.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta"
              >
                تصفح المتجر
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground hover:border-primary hover:text-primary"
              >
                احسب نظامك الشمسي
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {/* Solar package */}
              {solar && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-cta">
                      <Sun className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-primary">باقة الطاقة الشمسية</div>
                      <h3 className="mt-1 text-lg font-extrabold text-ink">
                        نظام {solar.result.panelKWp} kWp · {solar.result.batteryKWh} kWh
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {solar.state.city} · {arabicNumber(solar.state.autonomy || 0.5)} ليلة تخزين
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                        <Pill label="الألواح" value={`${arabicNumber(solar.result.panelCount)} لوح`} />
                        <Pill label="البطاريات" value={`${solar.result.batteryKWh} kWh`} />
                        <Pill label="الإنفرتر" value={`${solar.result.inverterKVA} kVA`} />
                        <Pill label="البطارية" value={solar.state.battery === "lithium" ? "ليثيوم" : "جل"} />
                      </div>
                    </div>
                    <button
                      onClick={removeSolar}
                      className="text-muted-foreground transition hover:text-destructive"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">السعر</span>
                    <span className="text-2xl font-extrabold text-ink">
                      {arabicNumber(solar.result.totalSAR.toLocaleString("en-US"))} ر.س
                    </span>
                  </div>
                </div>
              )}

              {/* Product lines */}
              {lines.map((line) => {
                const p = products.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <div
                    key={line.productId}
                    className="rounded-2xl border border-border bg-card p-4 shadow-card md:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Layers className="h-9 w-9 text-foreground/20" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold text-muted-foreground">
                          {p.brand} · {p.category}
                        </div>
                        <h3 className="mt-0.5 text-sm font-extrabold text-ink line-clamp-2">
                          {p.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div
                            className="flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1"
                            dir="rtl"
                          >
                            <button
                              onClick={() =>
                                updateProductQty(line.productId, line.qty - 1)
                              }
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground hover:bg-muted"
                              aria-label="إنقاص"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-5 text-center text-xs font-extrabold text-ink">
                              {line.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateProductQty(line.productId, line.qty + 1)
                              }
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground hover:bg-muted"
                              aria-label="زيادة"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-base font-extrabold text-primary">
                            {(p.price * line.qty).toLocaleString("en-US")}{" "}
                            <span className="text-[10px] text-muted-foreground">ر.س</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProductFromCart(line.productId)}
                        className="text-muted-foreground transition hover:text-destructive"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-border bg-primary-soft/50 p-4 text-sm text-foreground/85">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  ضمان وتوصيل سريع
                </div>
                <p className="mt-1.5 text-xs leading-relaxed">
                  منتجات أصلية من علامات تجارية موثوقة، مع توصيل لجميع المدن.
                </p>
              </div>
            </div>

            {/* Summary */}
            <aside className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6 lg:sticky lg:top-24 h-fit">
              <h3 className="text-base font-extrabold text-ink">ملخص الطلب</h3>
              <div className="mt-4 space-y-2.5 text-sm">
                {solar && (
                  <Row
                    label="نظام الطاقة"
                    value={`${arabicNumber(solar.result.totalSAR.toLocaleString("en-US"))} ر.س`}
                  />
                )}
                {lines.length > 0 && (
                  <Row
                    label={`المنتجات (${lines.length})`}
                    value={`${productsTotal.toLocaleString("en-US")} ر.س`}
                  />
                )}
                <Row label="الشحن" value="مجاني" muted />
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">الإجمالي</span>
                <span className="text-2xl font-extrabold text-primary">
                  {grandTotal.toLocaleString("en-US")} ر.س
                </span>
              </div>

              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-cta transition hover:bg-primary/95"
              >
                المتابعة للدفع
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Link
                to="/store"
                className="mt-2 flex w-full items-center justify-center text-xs font-semibold text-muted-foreground transition hover:text-primary"
              >
                متابعة التسوق
              </Link>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-2.5 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xs font-bold text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "font-semibold text-primary" : "font-bold text-ink"}>
        {value}
      </span>
    </div>
  );
}

export function Steps({ current }: { current: 0 | 1 | 2 }) {
  const items = [
    { label: "السلة" },
    { label: "بياناتك" },
    { label: "الدفع" },
  ];
  return (
    <ol className="flex items-center justify-center gap-2 md:gap-4">
      {items.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.label} className="flex items-center gap-2 md:gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {arabicNumber(i + 1)}
            </span>
            <span
              className={`text-xs font-bold md:text-sm ${
                done || active ? "text-ink" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < items.length - 1 && (
              <span
                className={`mx-1 h-px w-8 md:w-14 ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
