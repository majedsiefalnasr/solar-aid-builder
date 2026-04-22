import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sun,
  Wrench,
  Droplets,
  Cable,
  BatteryCharging,
  Zap,
  ArrowLeft,
  Compass,
  Calculator,
  ChevronLeft,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "متجددة — منصة البناء والطاقة الشمسية" },
      {
        name: "description",
        content:
          "متجر متجددة: مواد بناء، طاقة شمسية، وأدوات هندسية متقدمة. احسب نظامك الشمسي بدقة بضغطة زر.",
      },
      { property: "og:title", content: "متجددة — منصة البناء والطاقة الشمسية" },
      {
        property: "og:description",
        content: "احسب نظامك الشمسي بدقة بضغطة زر. تسوق مواد البناء والطاقة الشمسية.",
      },
    ],
  }),
  component: HomePage,
});

const categories = [
  {
    icon: Sun,
    title: "الطاقة الشمسية",
    desc: "احسب نظامك الشمسي وتسوق الألواح والبطاريات والإنفرترات.",
    primary: true,
    badge: "الأكثر استخداماً",
    href: "/calculator" as const,
  },
  { icon: Wrench, title: "مواد البناء", desc: "إسمنت، حديد، طوب، ومواد التشطيبات." },
  { icon: Droplets, title: "المضخات", desc: "مضخات سطحية وغاطسة لجميع الاستخدامات." },
  { icon: Cable, title: "الكابلات", desc: "كابلات نحاسية وقواطع كهربائية معتمدة." },
  { icon: BatteryCharging, title: "البطاريات", desc: "بطاريات ليثيوم وجل عالية الجودة." },
  { icon: Zap, title: "الإنفرترات", desc: "إنفرترات هايبرد وأوف-جريد لجميع القدرات." },
];

const tools = [
  {
    icon: Sun,
    title: "حاسبة الطاقة",
    desc: "احسب أحمالك المنزلية أو التجارية واعرف حجم الألواح والبطاريات المناسب لاحتياجك.",
    badge: "الأكثر استخداماً",
    href: "/calculator" as const,
  },
  {
    icon: Droplets,
    title: "المضخات الزراعية",
    desc: "حسابات دقيقة للرفع الديناميكي (TDH) وتحديد المضخة والألواح المناسبة.",
  },
  {
    icon: Zap,
    title: "الكابلات والقواطع",
    desc: "أداة الفنيين لحساب المقاطع الآمنة للكابلات وحجم القواطع لحماية النظام.",
  },
  {
    icon: Compass,
    title: "بوصلة التوجيه",
    desc: "بوصلة دقيقة ومقياس زاوية الميلان لمساعدتك في توجيه الألواح الشمسية بشكل مثالي.",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <Sun className="h-3.5 w-3.5" />
              منصة البناء والطاقة المتكاملة
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              ابنِ، شغّل، <span className="text-primary">واستدم</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              من مواد البناء إلى أنظمة الطاقة الشمسية. كل ما تحتاجه لمشروعك في
              مكان واحد، مع أدوات هندسية احترافية لحسابات دقيقة.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:translate-y-[-1px] hover:bg-primary/95"
              >
                <Calculator className="h-4 w-4" />
                احسب نظامك الشمسي
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                تصفح المتجر
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { n: "+1200", l: "مشروع" },
                { n: "+50", l: "مدينة" },
                { n: "98%", l: "رضا العملاء" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold text-ink">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="relative hidden md:block">
            <div className="absolute -right-8 top-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    نظام مقترح • منزل عائلي
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-ink">5.5 kWp</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Sun className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { l: "الألواح", v: "10×550W" },
                  { l: "البطاريات", v: "10 kWh" },
                  { l: "الإنفرتر", v: "5 kVA" },
                  { l: "أيام التخزين", v: "ليلتان" },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl bg-muted px-3 py-2.5">
                    <div className="text-[11px] text-muted-foreground">{m.l}</div>
                    <div className="text-sm font-bold text-ink">{m.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between rounded-2xl bg-gradient-to-l from-primary to-emerald-700 px-5 py-4 text-primary-foreground">
                <div>
                  <div className="text-xs opacity-80">التكلفة التقديرية</div>
                  <div className="text-2xl font-extrabold">22,500 ر.س</div>
                </div>
                <Link
                  to="/calculator"
                  className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/25"
                >
                  ابدأ الحساب ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                فئات المتجر
              </span>
              <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
                كل ما تحتاجه لمشروعك
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              تسوق منتجات معتمدة من أفضل العلامات التجارية العالمية والمحلية.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const Icon = c.icon;
              const Inner = (
                <>
                  {c.badge && (
                    <span className="absolute right-5 top-5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary">
                      {c.badge}
                    </span>
                  )}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      c.primary
                        ? "bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-cta"
                        : "bg-muted text-foreground/70"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-primary">
                    {c.primary ? "ابدأ الحساب" : "تصفح الفئة"}
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </>
              );

              const baseCls = `group relative block overflow-hidden rounded-2xl border p-6 transition ${
                c.primary
                  ? "border-primary/40 bg-gradient-to-br from-primary-soft/60 to-card shadow-card hover:shadow-elevated"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
              }`;

              return c.href ? (
                <Link key={c.title} to={c.href} className={baseCls}>
                  {Inner}
                </Link>
              ) : (
                <div key={c.title} className={baseCls}>
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="bg-grid-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              أدوات متخصصة
            </span>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
              أدوات هندسية متقدمة
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              تقارير فنية دقيقة بضغطة زر. اختر الأداة المناسبة لمشروعك واحصل على
              نتائج احترافية.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => {
              const Icon = t.icon;
              const Inner = (
                <>
                  {t.badge && (
                    <span className="absolute right-5 top-5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary">
                      {t.badge}
                    </span>
                  )}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground/70">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-12 text-lg font-bold text-ink">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.desc}
                  </p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-primary">
                    استخدم الأداة
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </>
              );
              return t.href ? (
                <Link
                  key={t.title}
                  to={t.href}
                  className="relative block rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
                >
                  {Inner}
                </Link>
              ) : (
                <div
                  key={t.title}
                  className="relative rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
                >
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
