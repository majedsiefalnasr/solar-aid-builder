import { Layers, Star, X, Plus, Minus, ShoppingCart, CheckCircle2, BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { addProductToCart } from "@/lib/cart-store";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    addProductToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl bg-card shadow-elevated md:rounded-3xl"
      >
        {/* Close (left in RTL = top-left for visual) */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:bg-card"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-muted to-card md:h-full">
            <Layers className="h-28 w-28 text-foreground/15" />
            {product.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex max-h-[70vh] flex-col overflow-y-auto p-6 md:max-h-[80vh]">
            <div className="text-[11px] font-semibold text-muted-foreground">
              {product.brand} · {product.category}
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-ink md:text-2xl">{product.name}</h2>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">· متوفر</span>
              {product.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  تم التحقق
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/85">
              {product.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {product.specs.map((s) => (
                <div key={s.label} className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  <div className="mt-0.5 text-xs font-bold text-ink">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-baseline gap-2 border-t border-border pt-5">
              <span className="text-3xl font-extrabold text-primary">{product.price}</span>
              <span className="text-sm font-bold text-muted-foreground">ر.س / {product.unit}</span>
            </div>

            {/* Qty + CTA — primary on LEFT (RTL) */}
            <div className="mt-5 flex items-center gap-3" dir="ltr">
              <button
                onClick={handleAdd}
                disabled={added}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-cta transition hover:bg-primary/95 disabled:opacity-90"
                dir="rtl"
              >
                {added ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    تمت الإضافة
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    إضافة للسلة
                  </>
                )}
              </button>
              <div
                className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5"
                dir="rtl"
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
                  aria-label="إنقاص"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-6 text-center text-sm font-extrabold text-ink">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
                  aria-label="زيادة"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
