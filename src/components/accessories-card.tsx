import { useState } from "react";
import { Cable, LayoutGrid, Package, Pencil, Check } from "lucide-react";
import { arabicNumber } from "@/components/calculator-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import rackingBasic from "@/assets/racking-basic.jpg";
import rackingStandard from "@/assets/racking-standard.jpg";
import rackingTilt from "@/assets/racking-tilt.jpg";
import rackingElevated from "@/assets/racking-elevated.jpg";
import rackingPremium from "@/assets/racking-premium.jpg";

export const DEFAULT_FLOORS = 6;
export const MAX_FLOORS = 6;
export const METERS_PER_FLOOR = 3;
export const SAR_PER_METER = 10;

export interface RackingTemplate {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const RACKING_TEMPLATES: RackingTemplate[] = [
  { id: "basic", name: "قالب 1", price: 500, image: rackingBasic },
  { id: "standard", name: "قالب 2", price: 750, image: rackingStandard },
  { id: "tilt", name: "قالب 3", price: 1000, image: rackingTilt },
  { id: "elevated", name: "قالب 4", price: 1250, image: rackingElevated },
  { id: "premium", name: "قالب 5", price: 1500, image: rackingPremium },
];

export const DEFAULT_RACKING = RACKING_TEMPLATES[RACKING_TEMPLATES.length - 1];

export interface AccessoriesState {
  floors: number;
  rackingId: string;
}

export const defaultAccessories: AccessoriesState = {
  floors: DEFAULT_FLOORS,
  rackingId: DEFAULT_RACKING.id,
};

// Wire price scales with selected floors. Going from 6→5 deducts 30 SAR;
// going from 4→5 adds 30 SAR. Adjustment = (selected - default) * 3 * 10
// applied as a delta to the base total (subtracted vs default cost).
export function computeAccessoryAdjustment(acc: AccessoriesState): number {
  // Fewer floors → less wire → subtract from total. More floors → add.
  const wireDelta = (acc.floors - DEFAULT_FLOORS) * METERS_PER_FLOOR * SAR_PER_METER;
  // Cheaper racking than default → subtract the difference. Pricier → add.
  const racking =
    RACKING_TEMPLATES.find((r) => r.id === acc.rackingId) ?? DEFAULT_RACKING;
  const rackingDelta = racking.price - DEFAULT_RACKING.price;
  return wireDelta + rackingDelta;
}

function wirePrice(floors: number) {
  return floors * METERS_PER_FLOOR * SAR_PER_METER;
}

export function AccessoriesCard({
  value,
  onChange,
}: {
  value: AccessoriesState;
  onChange: (next: AccessoriesState) => void;
}) {
  const [editFloors, setEditFloors] = useState(false);
  const [rackingOpen, setRackingOpen] = useState(false);
  const wireMeters = value.floors * METERS_PER_FLOOR;
  const racking =
    RACKING_TEMPLATES.find((r) => r.id === value.rackingId) ?? DEFAULT_RACKING;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink">ملحقات</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Package className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {/* Wires box */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Cable className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-ink">أسلاك</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                الطول الإجمالي:{" "}
                <span className="font-bold text-ink">{arabicNumber(wireMeters)} م</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                المسافة من السطح إلى مكان المنظومة:{" "}
                <span className="font-bold text-ink">{arabicNumber(value.floors)} أدوار</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  السعر:{" "}
                  <span className="font-bold text-ink">
                    {arabicNumber(wirePrice(value.floors).toLocaleString("en-US"))} ر.س
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFloors((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  {editFloors ? "إغلاق" : "تعديل"}
                </button>
              </div>
              {editFloors ? (
                <div className="mt-3 rounded-xl bg-primary-soft p-3">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    عدد الأدوار (الطول = العدد × {arabicNumber(METERS_PER_FLOOR)} م)
                  </label>
                  <div className="mt-2 grid grid-cols-6 gap-1.5">
                    {Array.from({ length: MAX_FLOORS }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ ...value, floors: n })}
                        className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
                          value.floors === n
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-ink hover:bg-muted"
                        }`}
                      >
                        {arabicNumber(n)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    الافتراضي {arabicNumber(DEFAULT_FLOORS)} أدوار. كل متر بـ{" "}
                    {arabicNumber(SAR_PER_METER)} ر.س — تقليل الأدوار يخصم من الإجمالي وزيادتها تضيف.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Racking box */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-ink">قواعد التركيب</div>
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={racking.image}
                  alt={racking.name}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">
                    النوع: <span className="font-bold text-ink">{racking.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    السعر:{" "}
                    <span className="font-bold text-ink">
                      {arabicNumber(racking.price.toLocaleString("en-US"))} ر.س
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setRackingOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  تعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={rackingOpen} onOpenChange={setRackingOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">اختر قالب قاعدة التركيب</DialogTitle>
            <DialogDescription className="text-right">
              تغيير القالب يُعدّل إجمالي السعر بمقدار الفارق بين السعرين.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RACKING_TEMPLATES.map((r) => {
              const selected = r.id === value.rackingId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onChange({ ...value, rackingId: r.id });
                    setRackingOpen(false);
                  }}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-2 text-right transition ${
                    selected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {selected ? (
                    <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                  <img
                    src={r.image}
                    alt={r.name}
                    loading="lazy"
                    width={256}
                    height={256}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <div className="mt-2 px-1">
                    <div className="text-sm font-extrabold text-ink">{r.name}</div>
                    <div className="text-xs font-bold text-primary">
                      {arabicNumber(r.price.toLocaleString("en-US"))} ر.س
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
