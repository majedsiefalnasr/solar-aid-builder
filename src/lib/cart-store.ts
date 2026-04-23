import type { Product } from "./products";

export type ProductCartLine = {
  type: "product";
  productId: string;
  qty: number;
  addedAt: string;
};

export type SolarCartLine = {
  type: "solar";
  payload: unknown; // legacy CalcResult+state blob
  addedAt: string;
};

export type CartLine = ProductCartLine | SolarCartLine;

const PRODUCT_KEY = "bunyan:cart:products:v1";
const SOLAR_KEY = "mutajadidah:cart:v1"; // keep legacy key for solar system

export function readProductCart(): ProductCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRODUCT_KEY);
    return raw ? (JSON.parse(raw) as ProductCartLine[]) : [];
  } catch {
    return [];
  }
}

export function writeProductCart(lines: ProductCartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("tamm:cart-updated"));
}

export function addProductToCart(productId: string, qty = 1) {
  const lines = readProductCart();
  const existing = lines.find((l) => l.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    lines.push({
      type: "product",
      productId,
      qty,
      addedAt: new Date().toISOString(),
    });
  }
  writeProductCart(lines);
}

export function removeProductFromCart(productId: string) {
  writeProductCart(readProductCart().filter((l) => l.productId !== productId));
}

export function updateProductQty(productId: string, qty: number) {
  if (qty <= 0) return removeProductFromCart(productId);
  const lines = readProductCart();
  const line = lines.find((l) => l.productId === productId);
  if (line) line.qty = qty;
  writeProductCart(lines);
}

export function cartTotal(lines: ProductCartLine[], products: Product[]) {
  return lines.reduce((sum, l) => {
    const p = products.find((x) => x.id === l.productId);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);
}

export function cartItemCount(lines: ProductCartLine[]) {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export { SOLAR_KEY };
