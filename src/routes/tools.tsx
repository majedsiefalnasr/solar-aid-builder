import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sun,
  HardHat,
  ArrowLeft,
  Calculator,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "الأدوات الهندسية | بنيان" },
      {
        name: "description",
        content:
          "أدوات هندسية احترافية: حاسبة الطاقة الشمسية وحاسبة كميات البناء. خطّط مشروعك بدقة.",
      },
      { property: "og:title", content: "الأدوات الهندسية | بنيان" },
      {
        property: "og:description",
        content: "حاسبة الطاقة الشمسية وحاسبة الإنشاءات في مكان واحد.",
      },
    ],
  }),
  component: ToolsHub,
});

function ToolsHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-8 md:py-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            أدوات هندسية مجانية
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            خطّط مشروعك بدقة
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            اختر الأداة المناسبة لاحتياجك: احسب نظامك الشمسي أو كميات مواد البناء
            بضغطة زر.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ToolCard
            to="/calculator-construction"
            icon={<HardHat className="h-7 w-7" />}
            badge="الأكثر استخداماً"
            title="حاسبة كميات البناء"
            desc="احسب كميات الخرسانة والحديد والبلوك المطلوبة لمشروعك بناءً على المساحة والأبعاد."
            features={[
              "كمية الخرسانة بالمتر المكعب",
              "وزن حديد التسليح المطلوب",
              "عدد البلوك وأكياس الإسمنت",
              "تكلفة تقديرية للمواد",
            ]}
            time="~2 دقيقة"
            cta="ابدأ الحساب"
            pattern="construction"
            accent
          />

          <ToolCard
            to="/calculator"
            icon={<Sun className="h-7 w-7" />}
            badge="جديد"
            title="حاسبة الطاقة الشمسية"
            desc="احسب احتياجك من الألواح والبطاريات والإنفرتر بناءً على أحمالك اليومية وموقعك."
            features={[
              "تقدير عدد الألواح وقدرتها",
              "حجم بنك البطاريات وأيام الاستقلالية",
              "قدرة الإنفرتر مع هامش Surge",
              "تكلفة تقديرية شاملة",
            ]}
            time="~3 دقائق"
            cta="ابدأ الحساب"
            pattern="solar"
          />
        </div>

        {/* Coming soon */}
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center md:p-8">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <h3 className="text-base font-extrabold text-ink">المزيد من الأدوات قريباً</h3>
          <p className="mt-1.5 text-xs text-muted-foreground md:text-sm">
            حاسبة عزل الأسطح، حاسبة الدهانات، وأدوات هندسية متخصصة.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ToolCard({
  to,
  icon,
  badge,
  title,
  desc,
  features,
  time,
  cta,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  desc: string;
  features: string[];
  time: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border p-7 shadow-card transition hover:-translate-y-1 hover:shadow-elevated md:p-8 ${
        accent
          ? "border-primary/30 bg-gradient-to-br from-primary-soft to-card"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            accent
              ? "bg-primary text-primary-foreground shadow-cta"
              : "bg-primary-soft text-primary"
          }`}
        >
          {icon}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
            accent
              ? "bg-primary text-primary-foreground"
              : "bg-primary-soft text-primary"
          }`}
        >
          {badge}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-ink md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>

      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-foreground/85">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {time}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-extrabold transition group-hover:translate-x-[-2px] ${
            accent
              ? "bg-ink text-primary-foreground shadow-cta"
              : "bg-primary text-primary-foreground shadow-cta"
          }`}
        >
          {cta}
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
