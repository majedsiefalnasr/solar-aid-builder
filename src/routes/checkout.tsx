import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Banknote,
  Upload,
  CheckCircle2,
  User,
  UserPlus,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { Steps } from "./cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | بنيان" },
      { name: "description", content: "أكمل بياناتك واختر طريقة الدفع." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<1 | 2>(1);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [pay, setPay] = useState<"bank" | "card">("bank");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-ink md:text-4xl">
            تم استلام طلبك بنجاح
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            سيتواصل معك فريق بنيان خلال 24 ساعة لتأكيد الطلب وجدولة التركيب.
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta"
          >
            العودة للرئيسية
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <Steps current={stage as 1 | 2} />

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-10">
          {stage === 1 ? (
            <>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">بياناتك</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                سجّل دخولك أو أنشئ حساباً جديداً.
              </p>

              {/* Auth toggle */}
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
                <ModeBtn
                  active={authMode === "login"}
                  onClick={() => setAuthMode("login")}
                  icon={<User className="h-4 w-4" />}
                >
                  تسجيل الدخول
                </ModeBtn>
                <ModeBtn
                  active={authMode === "register"}
                  onClick={() => setAuthMode("register")}
                  icon={<UserPlus className="h-4 w-4" />}
                >
                  إنشاء حساب
                </ModeBtn>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {authMode === "register" && (
                  <Field label="الاسم الكامل" placeholder="أحمد محمد" />
                )}
                <Field label="رقم الجوال" placeholder="+967 7XX XXX XXX" type="tel" />
                <Field label="البريد الإلكتروني" placeholder="you@example.com" type="email" />
                <Field label="كلمة المرور" placeholder="••••••••" type="password" />
                {authMode === "register" && (
                  <Field
                    label="عنوان التركيب"
                    placeholder="المدينة، الحي، الشارع"
                    full
                  />
                )}
              </div>

              <hr className="my-7 border-border" />

              <div className="flex items-center justify-between" dir="ltr">
                <button
                  onClick={() => setStage(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                  dir="rtl"
                >
                  متابعة للدفع
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate({ to: "/cart" })}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                  dir="rtl"
                >
                  <ArrowRight className="h-4 w-4" />
                  العودة للسلة
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">طريقة الدفع</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                اختر الطريقة المناسبة لإتمام عملية الشراء.
              </p>

              <div className="mt-6 grid gap-3">
                <PayOption
                  selected={pay === "bank"}
                  onClick={() => setPay("bank")}
                  icon={<Banknote className="h-5 w-5" />}
                  title="تحويل بنكي"
                  desc="حوّل المبلغ وارفع صورة الإيصال للتأكيد السريع."
                />
                <PayOption
                  selected={pay === "card"}
                  onClick={() => setPay("card")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="بطاقة بنكية"
                  desc="فيزا، ماستركارد، مدى — دفع آمن ومشفر."
                />
              </div>

              {pay === "bank" ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-muted p-4 text-sm">
                    <div className="font-bold text-ink">تفاصيل التحويل</div>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <div>البنك: البنك الأهلي السعودي</div>
                      <div>اسم الحساب: شركة بنيان للطاقة</div>
                      <div>IBAN: SA00 0000 0000 0000 0000 0000</div>
                    </div>
                  </div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background py-8 text-center transition hover:border-primary">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm font-bold text-ink">رفع صورة الإيصال</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      PNG أو JPG حتى 5MB
                    </span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="رقم البطاقة" placeholder="0000 0000 0000 0000" full />
                  <Field label="اسم حامل البطاقة" placeholder="ahmed mohammed" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="MM/YY" placeholder="08/29" />
                    <Field label="CVV" placeholder="•••" />
                  </div>
                </div>
              )}

              <hr className="my-7 border-border" />

              <div className="flex items-center justify-between" dir="ltr">
                <button
                  onClick={() => setDone(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                  dir="rtl"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تأكيد الطلب
                </button>
                <button
                  onClick={() => setStage(1)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  dir="rtl"
                >
                  <ArrowRight className="h-4 w-4" />
                  السابق
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  full,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold text-ink">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function PayOption({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-right transition ${
        selected
          ? "border-primary bg-primary-soft/50"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-extrabold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
