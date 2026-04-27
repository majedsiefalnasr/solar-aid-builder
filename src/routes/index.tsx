import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sun,
  Calculator,
  ArrowLeft,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Headset,
  BadgeCheck,
  Star,
  ShoppingCart,
  Quote,
  HardHat,
  ArrowRight,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ProductQuickView } from "@/components/product-quick-view";
import heroImg from "@/assets/solar-hero.jpg";
import materialsImg from "@/assets/materials-card.jpg";
import solarImg from "@/assets/solar-card.jpg";
import catMaterials from "@/assets/cat-materials.jpg";
import catTools from "@/assets/cat-tools.jpg";
import catCeramic from "@/assets/cat-ceramic.jpg";
import { products, type Product } from "@/lib/products";
import { addProductToCart } from "@/lib/cart-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تم — منصة البناء والطاقة الشمسية" },
      {
        name: "description",
        content:
          "متجر تم: مواد بناء، طاقة شمسية، وأدوات هندسية متقدمة. احسب نظامك الشمسي بدقة بضغطة زر.",
      },
      { property: "og:title", content: "تم — منصة البناء والطاقة الشمسية" },
      {
        property: "og:description",
        content: "احسب نظامك الشمسي بدقة بضغطة زر. تسوق مواد البناء والطاقة الشمسية.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const ceramic = products.find((p) => p.category === "السيراميك والبلاط");
  const featured = [
    ...products.slice(0, 3),
    ...(ceramic ? [ceramic] : [products[3]]),
  ];
  const [quickView, setQuickView] = useState<Product | null>(null);

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
                to="/tools"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:translate-y-[-1px] hover:bg-primary/95"
              >
                <Calculator className="h-4 w-4" />
                الأدوات الهندسية
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

      {/* Calculators teasers — under hero */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center">
            <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              أدوات هندسية مجانية
            </span>
            <h2 className="text-2xl font-extrabold text-ink md:text-3xl">
              احسب مشروعك بدقة قبل أن تبدأ
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              حاسبتان مجانيتان لتقدير تكاليف البناء والطاقة الشمسية بضغطة زر.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/calculator-construction"
              className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-soft to-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated md:p-7"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-cta">
                <HardHat className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-ink md:text-xl">حاسبة البناء</h3>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    الأكثر استخداماً
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/80">ابني بيتك من مكان واحد</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary group-hover:gap-2">
                  ابدأ الحساب
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>

            <Link
              to="/calculator"
              className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-50 to-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated md:p-7"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-cta">
                <Sun className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-ink md:text-xl">حاسبة الطاقة الشمسية</h3>
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    جديد
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/80">احسب نظامك الشمسي بدقة بضغطة زر</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 group-hover:gap-2">
                  ابدأ الحساب
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories — full-bleed image tiles with gradient overlay */}
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

          {/* Grid: tall left + 2 stacked middle + tall right */}
          <div className="grid gap-5 md:grid-cols-3 md:[grid-template-rows:1fr_1fr]">
            {/* Tall left — Solar */}
            <CategoryTile
              to="/store/solar"
              image={solarImg}
              alt="الطاقة الشمسية"
              eyebrow="الأكثر طلباً"
              title="الطاقة الشمسية"
              subtitle="حزم جاهزة · حاسبة مخصصة · منتجات"
              cta="تسوّق الآن"
              accent
              tall
              className="md:row-span-2 md:min-h-[520px]"
            />

            {/* Top middle — Concrete */}
            <CategoryTile
              to="/store"
              image={catMaterials}
              alt="إسمنت ومواد بناء"
              eyebrow="اليمامة · سيكا"
              title="الخرسانات والإسمنت"
              cta="استكشف"
            />

            {/* Tall right — Ceramics */}
            <CategoryTile
              to="/store"
              image={catCeramic}
              alt="السيراميك والبلاط"
              eyebrow="RAK سيراميك · بورسلانوزا"
              title="السيراميك والبلاط"
              subtitle="بورسلين رخامي · فسيفساء"
              cta="تصفح المنتجات"
              tall
              className="md:row-span-2 md:min-h-[520px]"
            />

            {/* Bottom middle — Tools */}
            <CategoryTile
              to="/store"
              image={catTools}
              alt="أدوات البناء"
              eyebrow="بوش · ديوالت"
              title="أدوات البناء"
              cta="استكشف"
            />
          </div>

          {/* Secondary chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["السيراميك والبلاط", "الدهانات والعوازل", "السلامة المهنية", "السباكة والصرف"].map((c) => (
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

      {/* Mini store — featured products */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                المتجر
              </span>
              <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
                منتجات مختارة لك
              </h2>
            </div>
            <Link
              to="/store"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary hover:underline"
            >
              عرض كل المنتجات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <article
                key={p.id}
                onClick={() => setQuickView(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setQuickView(p);
                  }
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card text-right transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-muted to-card">
                  <Sun className="h-14 w-14 text-foreground/15" />
                  {p.badge && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                    {p.brand}
                  </div>
                  <h3 className="text-sm font-bold text-ink line-clamp-2">{p.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold">{p.rating}</span>
                    </span>
                    {p.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                        <BadgeCheck className="h-3 w-3" />
                        تم التحقق
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="text-lg font-extrabold text-primary">
                      {p.price}{" "}
                      <span className="text-xs font-bold text-muted-foreground">ر.س</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addProductToCart(p.id, 1);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cta transition hover:bg-primary/95"
                      aria-label="إضافة للسلة"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />

      {/* Why Bunyan — features */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              لماذا تم؟
            </span>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
              شريكك من الأساس حتى التشغيل
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BadgeCheck,
                title: "جودة معتمدة",
                desc: "منتجات أصلية من علامات تجارية موثوقة بضمان رسمي.",
              },
              {
                icon: Truck,
                title: "توصيل سريع",
                desc: "شبكة توصيل تغطي جميع المدن خلال 24-72 ساعة.",
              },
              {
                icon: ShieldCheck,
                title: "دفع آمن",
                desc: "بوابات دفع محمية وخيارات دفع عند الاستلام.",
              },
              {
                icon: Headset,
                title: "دعم هندسي",
                desc: "فريق هندسي متخصص للاستشارات قبل وبعد الشراء.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border bg-card p-6 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1.5 text-base font-extrabold text-ink">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                آراء العملاء
              </span>
              <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
                ثقة عملائنا هي رأس مالنا
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                name: "م. أحمد الحسني",
                role: "مهندس إنشائي · صنعاء",
                quote:
                  "حاسبة الطاقة الشمسية أنقذتني من ساعات حسابات. النتائج دقيقة والمنتجات أصلية.",
              },
              {
                name: "خالد البكري",
                role: "مقاول · عدن",
                quote:
                  "أسعار منافسة وتوصيل أسرع من المتوقع. فريق الدعم متعاون جداً.",
              },
              {
                name: "م. سارة الزبيدي",
                role: "استشارية معمارية · تعز",
                quote:
                  "أحب تنوع العلامات التجارية وسهولة المقارنة. أصبحت وجهتي الأولى للمشاريع.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <Quote className="absolute -top-3 right-6 h-8 w-8 rotate-180 rounded-full bg-primary p-1.5 text-primary-foreground shadow-cta" />
                <div className="mb-3 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-sm font-extrabold text-ink">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-background pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-8 text-primary-foreground shadow-elevated md:p-12">
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <Sun className="pointer-events-none absolute -left-6 top-6 h-48 w-48 text-white/10" />
            <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div className="text-end md:text-start">
                <h3 className="text-2xl font-extrabold md:text-4xl">
                  جاهز لبدء مشروعك؟
                </h3>
                <p className="mt-2 max-w-xl text-sm opacity-90 md:text-base">
                  استخدم أدواتنا الهندسية لحساب احتياجاتك بدقة، أو تصفح آلاف المنتجات المعتمدة.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                  to="/store"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-primary-foreground backdrop-blur transition hover:bg-white/20"
                >
                  تصفح المتجر
                </Link>
                <Link
                  to="/tools"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-primary shadow-cta transition hover:bg-white/95"
                >
                  <Calculator className="h-4 w-4" />
                  الأدوات الهندسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function CategoryTile({
  to,
  image,
  alt,
  eyebrow,
  title,
  subtitle,
  cta,
  tall,
  accent,
  className,
}: {
  to: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta: string;
  tall?: boolean;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-3xl shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated ${
        className ?? "min-h-[240px]"
      }`}
    >
      {/* Full-bleed image */}
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay for legibility */}
      <div
        className={`absolute inset-0 ${
          accent
            ? "bg-gradient-to-t from-primary/95 via-primary/60 to-primary/15"
            : "bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10"
        }`}
      />

      {/* Top eyebrow chip */}
      <div className="relative z-10 flex items-start justify-end p-5">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          {eyebrow}
        </span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 flex flex-col gap-3 p-5 text-end text-white md:p-6">
        <div>
          <h3
            className={`font-extrabold leading-tight ${
              tall ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
            }`}
          >
            {title}
          </h3>
          {subtitle && <p className="mt-1.5 text-xs opacity-90 md:text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-start">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold shadow-cta ${
              accent
                ? "bg-ink text-primary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {cta}
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
