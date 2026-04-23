import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ROLES, ROLE_META, type Role } from "@/lib/dashboard-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | تم" },
      { name: "description", content: "ادخل إلى لوحة تحكم منصة تم لإدارة مشاريع البناء." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
        {/* Login form */}
        <section className="rounded-3xl border border-border bg-card p-7 shadow-card md:p-10">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <LogIn className="h-3.5 w-3.5" />
            دخول الأعضاء
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-ink md:text-4xl">
            مرحباً بعودتك إلى تم
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ادخل بياناتك للوصول إلى لوحة إدارة مشاريعك ومتابعة الدفعات والمراحل.
          </p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">البريد الإلكتروني</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tamm.tech"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">كلمة المرور</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" />
                تذكّرني
              </label>
              <a className="font-semibold text-primary hover:underline" href="#">
                نسيت كلمة المرور؟
              </a>
            </div>

            <Link
              to="/dashboard"
              search={{ role: "owner" as Role }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
            >
              تسجيل الدخول
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/checkout" className="font-bold text-primary hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </section>

        {/* Quick access — demo shortcuts */}
        <section className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary-soft/30 p-7 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            دخول تجريبي سريع
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">جرّب لوحة كل دور</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            استكشف منصة تم من زاوية كل مستخدم — صاحب المشروع، المقاول، المهندس،
            الميداني، أو إدارة المنصة.
          </p>

          <div className="mt-6 grid gap-3">
            {ROLES.map((role) => {
              const meta = ROLE_META[role];
              return (
                <Link
                  key={role}
                  to="/dashboard"
                  search={{ role }}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card px-4 py-4 text-right transition hover:border-primary hover:shadow-card`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-l ${meta.accent} opacity-60 transition group-hover:opacity-100`}
                  />
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
                    {meta.icon}
                  </span>
                  <span className="relative flex-1">
                    <span className="block text-sm font-extrabold text-ink">{meta.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {meta.tagline}
                    </span>
                  </span>
                  <ArrowLeft className="relative h-4 w-4 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            * بيئة تجريبية — البيانات وهمية لأغراض العرض فقط
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
