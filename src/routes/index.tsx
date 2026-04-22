import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sun,
  Calculator,
  ArrowLeft,
  ChevronLeft,
  PaintBucket,
  Layers,
  Hammer,
  HardHat,
  Pipette,
  Construction,
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import heroImg from "@/assets/solar-hero.jpg";
import materialsImg from "@/assets/materials-card.jpg";
import solarImg from "@/assets/solar-card.jpg";

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

const categories = [
  {
    icon: Sun,
    title: "الطاقة الشمسية",
    desc: "احسب نظامك الشمسي وتسوق الألواح والبطاريات والإنفرترات.",
    primary: true,
    badge: "الأكثر استخداماً",
    href: "/calculator" as const,
  },
  { icon: Layers, title: "الخرسانات والإسمنت", desc: "إسمنت بورتلاندي، خرسانة جاهزة، ومواد ربط." },
  { icon: Construction, title: "معدات التسليح", desc: "حديد التسليح، أسلاك ربط، وفواصل خرسانية." },
  { icon: PaintBucket, title: "الدهانات والعوازل", desc: "دهانات داخلية وخارجية، عوازل حرارية ومائية." },
  { icon: Hammer, title: "أدوات البناء", desc: "عدد يدوية وكهربائية لمواقع البناء." },
  { icon: HardHat, title: "السلامة المهنية", desc: "خوذات، أحذية، وكمامات معتمدة للعمال." },
  { icon: Pipette, title: "السباكة والصرف", desc: "أنابيب PPR، PVC، ووصلات لجميع التطبيقات." },
];

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  badge?: string;
};

const products: Product[] = [
  { id: "p1", name: "إسمنت بورتلاندي 50 كجم", price: 28, category: "الخرسانات والإسمنت", brand: "اليمامة", rating: 4.8, badge: "الأكثر مبيعاً" },
  { id: "p2", name: "حديد تسليح مبروم 12 مم", price: 65, category: "معدات التسليح", brand: "حديد الراجحي", rating: 4.7 },
  { id: "p3", name: "دهان أكريليك داخلي 18 لتر", price: 320, category: "الدهانات والعوازل", brand: "جوتن", rating: 4.9, badge: "جودة عالية" },
  { id: "p4", name: "عازل حراري فوم 5 سم", price: 180, category: "الدهانات والعوازل", brand: "نشاء", rating: 4.6 },
  { id: "p5", name: "خلاطة خرسانة 350 لتر", price: 4200, category: "أدوات البناء", brand: "هوندا", rating: 4.5 },
  { id: "p6", name: "أنابيب PPR 25 مم - 4م", price: 45, category: "السباكة والصرف", brand: "بترو ست", rating: 4.7 },
  { id: "p7", name: "خوذة سلامة مع حزام", price: 75, category: "السلامة المهنية", brand: "3M", rating: 4.8 },
  { id: "p8", name: "خرسانة جاهزة - متر مكعب", price: 285, category: "الخرسانات والإسمنت", brand: "أسمنت اليمن", rating: 4.6 },
  { id: "p9", name: "مفتاح ربط متعدد المقاسات", price: 95, category: "أدوات البناء", brand: "ستانلي", rating: 4.7, badge: "خصم 15%" },
];

const filterCategories = [
  "الخرسانات والإسمنت",
  "معدات التسليح",
  "الدهانات والعوازل",
  "أدوات البناء",
  "السلامة المهنية",
  "السباكة والصرف",
];

const brands = ["اليمامة", "حديد الراجحي", "جوتن", "نشاء", "هوندا", "بترو ست", "3M", "أسمنت اليمن", "ستانلي"];

function HomePage() {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCats.length && !selectedCats.includes(p.category)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (p.price > maxPrice) return false;
      if (search && !p.name.includes(search)) return false;
      return true;
    });
  }, [selectedCats, selectedBrands, maxPrice, search]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

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
              <a
                href="#store"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                تصفح المتجر
                <ArrowLeft className="h-4 w-4" />
              </a>
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

      {/* Store grid with filter sidebar */}
      <section id="store" className="bg-grid-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              المتجر الإلكتروني
            </span>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
              تصفح منتجات البناء
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              فلتر حسب الفئة، العلامة التجارية، أو السعر للوصول لما يناسب مشروعك.
            </p>
          </div>

          {/* Search + mobile filter toggle */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full rounded-full border border-border bg-card py-3 pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-bold text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Sidebar filters */}
            <aside
              className={`${
                filtersOpen ? "block" : "hidden"
              } lg:block space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card h-fit lg:sticky lg:top-24`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-ink">الفئات</h3>
                  {selectedCats.length > 0 && (
                    <button
                      onClick={() => setSelectedCats([])}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      مسح
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {filterCategories.map((c) => (
                    <label
                      key={c}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c)}
                        onChange={() => toggle(selectedCats, setSelectedCats, c)}
                        className="h-4 w-4 accent-primary"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-ink">العلامة التجارية</h3>
                  {selectedBrands.length > 0 && (
                    <button
                      onClick={() => setSelectedBrands([])}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      مسح
                    </button>
                  )}
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {brands.map((b) => (
                    <label
                      key={b}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggle(selectedBrands, setSelectedBrands, b)}
                        className="h-4 w-4 accent-primary"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="mb-3 text-sm font-extrabold text-ink">السعر الأقصى</h3>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>50 ر.س</span>
                  <span className="font-bold text-primary">حتى {maxPrice} ر.س</span>
                </div>
              </div>
            </aside>

            {/* Products grid */}
            <div>
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  <span className="font-bold text-ink">{filtered.length}</span> منتج
                </span>
                <span className="text-xs">مرتب حسب: الأكثر صلة</span>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                  لا توجد منتجات مطابقة للفلاتر الحالية.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((p) => (
                    <article
                      key={p.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
                    >
                      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-muted to-card">
                        <Layers className="h-16 w-16 text-foreground/15" />
                        {p.badge && (
                          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                          {p.brand} · {p.category}
                        </div>
                        <h3 className="text-sm font-bold text-ink line-clamp-2">{p.name}</h3>
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-bold">{p.rating}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="text-lg font-extrabold text-primary">
                            {p.price} <span className="text-xs font-bold text-muted-foreground">ر.س</span>
                          </div>
                          <button
                            type="button"
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
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
