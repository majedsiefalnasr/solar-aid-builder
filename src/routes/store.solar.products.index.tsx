import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Sun,
  BatteryCharging,
  Zap,
  Star,
  ShoppingCart,
  BadgeCheck,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ProductQuickView } from "@/components/product-quick-view";
import { products, type Product } from "@/lib/products";
import { addProductToCart } from "@/lib/cart-store";

export const Route = createFileRoute("/store/solar/products/")({
  head: () => ({
    meta: [
      { title: "منتجات الطاقة الشمسية | تم" },
      {
        name: "description",
        content:
          "بطاريات ليثيوم، ألواح شمسية بقدرات 550/650/750 وات، ومحولات طاقة 2/5/10 كيلوواط.",
      },
      { property: "og:title", content: "منتجات الطاقة الشمسية | تم" },
    ],
  }),
  component: SolarProductsPage,
});

const SOLAR_CATEGORY = "الطاقة الشمسية";

const SECTIONS: Array<{ id: string; title: string; icon: typeof Sun; subcat: string }> = [
  { id: "panels", title: "الألواح الشمسية", icon: Sun, subcat: "ألواح شمسية" },
  { id: "batteries", title: "بطاريات الليثيوم", icon: BatteryCharging, subcat: "بطارية ليثيوم" },
  { id: "inverters", title: "محولات الطاقة (الإنفرتر)", icon: Zap, subcat: "محول طاقة" },
];

function SolarProductsPage() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const solarProducts = products.filter((p) => p.category === SOLAR_CATEGORY);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="border-b border-border/60 bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store" className="hover:text-primary">المتجر</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link to="/store/solar" className="hover:text-primary">الطاقة الشمسية</Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-ink">منتجات الطاقة</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-8 md:py-14">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">منتجات الطاقة</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            مكوّنات أصلية مفحوصة — اختر القطع التي تحتاجها لمشروعك أو لتوسعة نظامك الحالي.
          </p>
        </header>

        {SECTIONS.map((section) => {
          const items = solarProducts.filter((p) => p.brand.includes("") && nameMatchesSection(p, section.id));
          const Icon = section.icon;
          return (
            <div key={section.id}>
              <div className="mb-5 flex items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-ink md:text-2xl">{section.title}</h2>
                    <p className="text-xs text-muted-foreground">{items.length} منتجات</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <SolarProductCard
                    key={p.id}
                    product={p}
                    onQuickView={() => setQuickView(p)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
      <SiteFooter />
    </div>
  );
}

function nameMatchesSection(p: Product, sectionId: string): boolean {
  if (sectionId === "panels") return p.name.includes("لوح");
  if (sectionId === "batteries") return p.name.includes("بطارية");
  if (sectionId === "inverters") return p.name.includes("محول") || p.name.includes("إنفرتر");
  return false;
}

function SolarProductCard({
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
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
        <Sun className="h-16 w-16 text-emerald-500/30" />
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
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">{product.brand}</div>
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
            {product.price.toLocaleString("en-US")}{" "}
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
