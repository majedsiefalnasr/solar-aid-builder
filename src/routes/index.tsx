import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sun,
  Calculator,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
import materialsImg from "@/assets/materials-card.jpg";
import solarImg from "@/assets/solar-card.jpg";
import catMaterials from "@/assets/cat-materials.jpg";
import catTools from "@/assets/cat-tools.jpg";
import catRebar from "@/assets/cat-rebar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بنيان — منصة البناء والطاقة الشمسية" },
      {
        name: "description",
        content:
          "متجر بنيان: مواد بناء، طاقة شمسية، وأدوات هندسية متقدمة. احسب نظامك الشمسي بدقة بضغطة زر.",
      },
      { property: "og:title", content: "بنيان — منصة البناء والطاقة الشمسية" },
      {
        property: "og:description",
        content: "احسب نظامك الشمسي بدقة بضغطة زر. تسوق مواد البناء والطاقة الشمسية.",
      },
    ],
  }),
  component: HomePage,
});

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
                to="/store"
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

          {/* Hero visual cards */}
          <div className="relative hidden md:block">
            <div className="absolute -right-8 top-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
                <img
                  src={solarImg}
                  alt="ألواح الطاقة الشمسية"
                  loading="lazy"
                  width={896}
                  height={704}
                  className="aspect-[3/4] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <span className="inline-block rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-bold">
                    الأكثر طلباً
                  </span>
                  <div className="mt-2 text-lg font-extrabold">الطاقة الشمسية</div>
                  <div className="text-xs opacity-90">ألواح · بطاريات · إنفرترات</div>
                </div>
              </div>

              <div className="group relative mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
                <img
                  src={materialsImg}
                  alt="مواد البناء"
                  loading="lazy"
                  width={896}
                  height={704}
                  className="aspect-[3/4] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
                    أساس متين
                  </span>
                  <div className="mt-2 text-lg font-extrabold">مواد البناء</div>
                  <div className="text-xs opacity-90">إسمنت · حديد · دهانات · تسليح</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — 3-column showcase */}
      <section id="categories" className="border-y border-border bg-card/40">
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
              تسوق منتجات معتمدة من أفضل العلامات التجارية المحلية والعالمية.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:[grid-template-rows:1fr_1fr]">
            {/* Tall featured — Solar Energy (left, primary) */}
            <Link
              to="/calculator"
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground shadow-elevated transition hover:-translate-y-0.5 md:row-span-2 md:min-h-[520px]"
            >
              <div className="flex items-center justify-end gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">
                  Lithium
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">
                  Gel
                </span>
              </div>
              <div className="mt-6 text-end">
                <h3 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  الطاقة
                  <br />
                  الشمسية
                </h3>
                <p className="mt-2 text-sm opacity-90">ألواح · بطاريات · إنفرترات</p>
              </div>
              <div className="relative mt-auto flex items-end justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-cta">
                  ابدأ الحساب
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="pointer-events-none absolute -left-8 -bottom-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <Sun className="pointer-events-none absolute -left-6 bottom-8 h-56 w-56 text-white/15" />
            </Link>

            {/* Top middle — Concrete */}
            <CategoryTile
              eyebrow="اليمامة"
              title="الخرسانات والإسمنت"
              image={catMaterials}
              alt="إسمنت ومواد بناء"
              variant="light"
            />

            {/* Tall right — Reinforcement (dark) */}
            <CategoryTile
              eyebrow="حديد الراجحي"
              title="معدات التسليح"
              image={catRebar}
              alt="حديد التسليح"
              variant="dark"
              className="md:row-span-2 md:min-h-[520px]"
              tall
            />

            {/* Bottom middle — Tools */}
            <CategoryTile
              eyebrow="بوش · ديوالت"
              title="أدوات البناء"
              image={catTools}
              alt="أدوات البناء"
              variant="light"
            />
          </div>

          {/* Secondary chips for remaining categories */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["الدهانات والعوازل", "السلامة المهنية", "السباكة والصرف"].map((c) => (
              <Link
                key={c}
                to="/store"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                {c}
                <ChevronLeft className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function CategoryTile({
  eyebrow,
  title,
  image,
  alt,
  variant,
  className,
  tall,
}: {
  eyebrow: string;
  title: string;
  image: string;
  alt: string;
  variant: "light" | "dark";
  className?: string;
  tall?: boolean;
}) {
  const isDark = variant === "dark";
  return (
    <Link
      to="/store"
      className={`group relative flex flex-col overflow-hidden rounded-3xl shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated ${
        isDark ? "bg-ink text-primary-foreground" : "bg-muted text-ink"
      } ${className ?? "min-h-[240px]"}`}
    >
      {/* Brand chips top */}
      <div className="relative z-10 flex items-center justify-end gap-2 p-5">
        {eyebrow.split("·").map((b) => (
          <span
            key={b}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isDark ? "bg-white/10 text-white" : "bg-card text-foreground/80"
            }`}
          >
            {b.trim()}
          </span>
        ))}
      </div>

      {/* Title */}
      <div className="relative z-10 px-5 text-end">
        <h3
          className={`font-extrabold leading-tight ${
            tall ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h3>
        {!tall && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-primary">
            استكشف
            <ArrowLeft className="h-3 w-3" />
          </span>
        )}
      </div>

      {tall && (
        <div className="relative z-10 mt-4 flex justify-start px-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-cta">
            تصفح المنتجات
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative mt-auto flex flex-1 items-end justify-center">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={768}
          height={768}
          className={`pointer-events-none object-contain transition duration-500 group-hover:scale-105 ${
            tall ? "max-h-[360px] w-auto" : "max-h-[180px] w-auto"
          }`}
        />
      </div>
    </Link>
  );
}
