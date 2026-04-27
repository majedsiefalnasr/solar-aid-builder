import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Star,
  ShoppingCart,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sun,
  PaintBucket,
  Hammer,
  HardHat,
  Pipette,
  Construction,
  Grid3x3,
  BadgeCheck,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ProductQuickView } from "@/components/product-quick-view";
import {
  brands,
  filterCategories,
  products,
  type Product,
} from "@/lib/products";
import { addProductToCart } from "@/lib/cart-store";

export const Route = createFileRoute("/store/")({
  head: () => ({
    meta: [
      { title: "المتجر | تم" },
      {
        name: "description",
        content:
          "تسوق مواد البناء والطاقة الشمسية: إسمنت، حديد، دهانات، أدوات، وأكثر من علامات تجارية موثوقة.",
      },
      { property: "og:title", content: "المتجر | تم" },
      {
        property: "og:description",
        content: "كل ما تحتاجه لمشروعك في مكان واحد بأسعار تنافسية.",
      },
    ],
  }),
  component: StorePage,
});

const PAGE_SIZE = 9;

const miniCategories = [
  { icon: Sun, label: "الطاقة الشمسية", value: "__solar" },
  { icon: Layers, label: "الخرسانات", value: "الخرسانات والإسمنت" },
  { icon: Construction, label: "التسليح", value: "معدات التسليح" },
  { icon: Grid3x3, label: "السيراميك", value: "السيراميك والبلاط" },
  { icon: PaintBucket, label: "الدهانات", value: "الدهانات والعوازل" },
  { icon: Hammer, label: "الأدوات", value: "أدوات البناء" },
  { icon: HardHat, label: "السلامة", value: "السلامة المهنية" },
  { icon: Pipette, label: "السباكة", value: "السباكة والصرف" },
];

function StorePage() {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating">(
    "relevance",
  );

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (selectedCats.length && !selectedCats.includes(p.category)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (p.price > maxPrice) return false;
      if (search && !p.name.includes(search)) return false;
      return true;
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [selectedCats, selectedBrands, maxPrice, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setPage(1);
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const onCategoryChip = (val: string) => {
    setPage(1);
    if (val === "__solar") return; // navigated via Link
    setSelectedCats((cur) => (cur.includes(val) ? cur.filter((c) => c !== val) : [val]));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-ink">المتجر</span>
        </div>
      </div>

      {/* Mini categories */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">المتجر</h1>
              <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                تصفح الفئات أو استخدم الفلاتر للعثور على ما يناسب مشروعك.
              </p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {miniCategories.map((c) => {
              const Icon = c.icon;
              const isActive =
                c.value === "__solar" ? false : selectedCats.includes(c.value);
              const baseCls = `group flex shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 transition w-[110px] ${
                isActive
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-primary/40"
              }`;
              const inner = (
                <>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground/70 group-hover:bg-primary-soft group-hover:text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-[11px] font-bold text-ink leading-tight">
                    {c.label}
                  </span>
                </>
              );
              return c.value === "__solar" ? (
                <Link key={c.label} to="/store/solar" className={baseCls}>
                  {inner}
                </Link>
              ) : (
                <button
                  key={c.label}
                  onClick={() => onCategoryChip(c.value)}
                  className={baseCls}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-grid-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
          {/* Search bar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="ابحث عن منتج..."
                className="w-full rounded-full border border-border bg-card py-3 pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="hidden rounded-full border border-border bg-card px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary md:block"
            >
              <option value="relevance">الأكثر صلة</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-bold text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside
              className={`${
                filtersOpen ? "block" : "hidden"
              } lg:block space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card h-fit lg:sticky lg:top-24`}
            >
              <FilterGroup
                title="الفئات"
                items={filterCategories}
                selected={selectedCats}
                onToggle={(v) => toggle(selectedCats, setSelectedCats, v)}
                onClear={() => {
                  setPage(1);
                  setSelectedCats([]);
                }}
              />
              <div className="border-t border-border pt-5">
                <FilterGroup
                  title="العلامة التجارية"
                  items={brands}
                  selected={selectedBrands}
                  onToggle={(v) => toggle(selectedBrands, setSelectedBrands, v)}
                  onClear={() => {
                    setPage(1);
                    setSelectedBrands([]);
                  }}
                  scroll
                />
              </div>
              <div className="border-t border-border pt-5">
                <h3 className="mb-3 text-sm font-extrabold text-ink">السعر الأقصى</h3>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMaxPrice(Number(e.target.value));
                  }}
                  className="w-full accent-primary"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>50 ر.س</span>
                  <span className="font-bold text-primary">حتى {maxPrice} ر.س</span>
                </div>
              </div>
            </aside>

            {/* Products */}
            <div>
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  <span className="font-bold text-ink">{filtered.length}</span> منتج
                </span>
                <span className="text-xs">
                  صفحة {currentPage} من {totalPages}
                </span>
              </div>

              {paged.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                  لا توجد منتجات مطابقة للفلاتر الحالية.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {paged.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onQuickView={() => setQuickView(p)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onChange={setPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
      <SiteFooter />
    </div>
  );
}

function FilterGroup({
  title,
  items,
  selected,
  onToggle,
  onClear,
  scroll,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  scroll?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-ink">{title}</h3>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            مسح
          </button>
        )}
      </div>
      <div className={`space-y-2 ${scroll ? "max-h-48 overflow-y-auto pr-1" : ""}`}>
        {items.map((v) => (
          <label
            key={v}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-primary"
          >
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() => onToggle(v)}
              className="h-4 w-4 accent-primary"
            />
            {v}
          </label>
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: () => void;
}) {
  return (
    <article
      onClick={onQuickView}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-muted to-card">
        <Layers className="h-16 w-16 text-foreground/15" />
        {product.badge && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
            {product.badge}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            عرض سريع
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
          {product.brand} · {product.category}
        </div>
        <h3 className="text-sm font-bold text-ink line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-bold">{product.rating}</span>
          </span>
          {product.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
              <BadgeCheck className="h-3 w-3" />
              تم التحقق
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-lg font-extrabold text-primary">
            {product.price}{" "}
            <span className="text-xs font-bold text-muted-foreground">ر.س</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addProductToCart(product.id, 1);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cta transition hover:bg-primary/95"
            aria-label="إضافة للسلة"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-8 flex items-center justify-center gap-2" dir="ltr">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
        aria-label="السابق"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold transition ${
            p === page
              ? "bg-primary text-primary-foreground shadow-cta"
              : "border border-border bg-card text-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
        aria-label="التالي"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
