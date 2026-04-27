import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Calculator, Zap, ChevronLeft, ArrowLeft } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const Route = createFileRoute("/store/solar/")({
  head: () => ({
    meta: [
      { title: "الطاقة الشمسية | المتجر | تم" },
      {
        name: "description",
        content:
          "اختر بين الحُزم الشمسية الجاهزة، حزم تفصيلية بحاسبة الطاقة، أو منتجات الطاقة المنفردة.",
      },
      { property: "og:title", content: "الطاقة الشمسية | تم" },
      {
        property: "og:description",
        content: "حزم جاهزة وحلول تفصيلية ومنتجات أصلية في مكان واحد.",
      },
    ],
  }),
  component: SolarLanding,
});

const subcategories = [
  {
    icon: Package,
    title: "حُزم جاهزة",
    desc: "حزم مدروسة لمختلف أحجام الشقق والعمائر، جاهزة للتركيب فوراً.",
    to: "/store/solar/packages" as const,
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Calculator,
    title: "حزم تفصيلية بحسب استهلاكك",
    desc: "احسب احتياجك بدقة عبر حاسبة الطاقة واحصل على عرض مخصص.",
    to: "/calculator" as const,
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "منتجات الطاقة",
    desc: "ألواح شمسية، بطاريات ليثيوم، ومحولات طاقة بقدرات مختلفة.",
    to: "/store/solar/products" as const,
    color: "from-sky-500 to-indigo-600",
  },
];

function SolarLanding() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="border-b border-border/60 bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store" className="hover:text-primary">المتجر</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-ink">الطاقة الشمسية</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">الطاقة الشمسية</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            اختر الطريقة التي تناسبك للحصول على نظامك الشمسي: حزمة جاهزة بسعر معروف،
            تصميم مخصص بحسب استهلاكك، أو شراء المكونات منفردة.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {subcategories.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                to={s.to}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
              >
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-extrabold text-ink">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  ابدأ الآن
                  <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
