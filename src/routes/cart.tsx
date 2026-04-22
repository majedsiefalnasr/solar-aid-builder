import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Sun,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import type { CalcResult, CalcState } from "@/lib/calculator";
import { arabicNumber } from "@/components/calculator-shell";

interface CartItem {
  state: CalcState;
  result: CalcResult;
  pid: string;
  addedAt: string;
}

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "السلة | متجددة" },
      { name: "description", content: "راجع نظامك الشمسي قبل إتمام الشراء." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const [item, setItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mutajadidah:cart:v1");
      if (raw) setItem(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const remove = () => {
    localStorage.removeItem("mutajadidah:cart:v1");
    setItem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <Steps current={0} />

        <h1 className="mt-8 text-3xl font-extrabold text-ink md:text-4xl">سلة المشتريات</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          راجع نظامك المقترح قبل المتابعة للدفع.
        </p>

        {!item ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-extrabold text-ink">سلتك فارغة</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ابدأ بحساب نظامك الشمسي وأضفه للسلة.
            </p>
            <Link
              to="/calculator"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta"
            >
              ابدأ الحساب
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-cta">
                    <Sun className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-primary">باقة الطاقة الشمسية</div>
                    <h3 className="mt-1 text-lg font-extrabold text-ink">
                      نظام {item.result.panelKWp} kWp · {item.result.batteryKWh} kWh
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.state.city} · {arabicNumber(item.state.autonomy || 0.5)} ليلة تخزين
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                      <Pill label="الألواح" value={`${arabicNumber(item.result.panelCount)} لوح`} />
                      <Pill label="البطاريات" value={`${item.result.batteryKWh} kWh`} />
                      <Pill label="الإنفرتر" value={`${item.result.inverterKVA} kVA`} />
                      <Pill label="البطارية" value={item.state.battery === "lithium" ? "ليثيوم" : "جل"} />
                    </div>
                  </div>
                  <button
                    onClick={remove}
                    className="text-muted-foreground transition hover:text-destructive"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">السعر</span>
                  <span className="text-2xl font-extrabold text-ink">
                    {arabicNumber(item.result.totalSAR.toLocaleString("en-US"))} ر.س
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-primary-soft/50 p-4 text-sm text-foreground/85">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  شامل التركيب والضمان
                </div>
                <p className="mt-1.5 text-xs leading-relaxed">
                  ضمان 5 سنوات على الإنفرتر، 10 سنوات على البطاريات، 25 سنة على الألواح.
                </p>
              </div>
            </div>

            {/* Summary */}
            <aside className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
              <h3 className="text-base font-extrabold text-ink">ملخص الطلب</h3>
              <div className="mt-4 space-y-2.5 text-sm">
                <Row label="السعر" value={`${arabicNumber(item.result.totalSAR.toLocaleString("en-US"))} ر.س`} />
                <Row label="التركيب" value="شامل" muted />
                <Row label="الشحن" value="مجاني" muted />
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">الإجمالي</span>
                <span className="text-2xl font-extrabold text-primary">
                  {arabicNumber(item.result.totalSAR.toLocaleString("en-US"))} ر.س
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
                to="/"
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
