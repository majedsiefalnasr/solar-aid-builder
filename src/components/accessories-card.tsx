import { useState } from "react";
import { Cable, LayoutGrid, Package, Pencil, Check } from "lucide-react";
import { arabicNumber } from "@/components/calculator-shell";

export const DEFAULT_FLOORS = 6;
export const METERS_PER_FLOOR = 3;
export const SAR_PER_METER = 10;

export interface RackingTemplate {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const RACKING_TEMPLATES: RackingTemplate[] = [
  { id: "basic", name: "قاعدة أساسية", price: 500, description: "حديد مجلفن — تثبيت أرضي بسيط" },
  { id: "standard", name: "قاعدة قياسية", price: 750, description: "حديد مجلفن مقاوم — للأسطح المستوية" },
  { id: "tilt", name: "قاعدة بزاوية مائلة", price: 1000, description: "زاوية ميل قابلة للتعديل لزيادة الإنتاج" },
  { id: "elevated", name: "قاعدة مرتفعة", price: 1250, description: "مرتفعة لتهوية أفضل وحماية الأسطح" },
  { id: "premium", name: "قاعدة بريميوم", price: 1500, description: "ألمنيوم/ستانلس — مقاومة قصوى للصدأ والرياح" },
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

export function computeAccessoryAdjustment(acc: AccessoriesState): number {
  const wireDelta = (DEFAULT_FLOORS - acc.floors) * METERS_PER_FLOOR * SAR_PER_METER;
  const racking = RACKING_TEMPLATES.find((r) => r.id === acc.rackingId) ?? DEFAULT_RACKING;
  const rackingDelta = DEFAULT_RACKING.price - racking.price;
  return wireDelta + rackingDelta;
}

export function AccessoriesCard({
  value,
  onChange,
}: {
  value: AccessoriesState;
  onChange: (next: AccessoriesState) => void;
}) {
  const [editFloors, setEditFloors] = useState(false);
  const [editRacking, setEditRacking] = useState(false);
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
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  المسافة من السطح إلى مكان المنظومة:{" "}
                  <span className="font-bold text-ink">{arabicNumber(value.floors)} أدوار</span>
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
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
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
                    الافتراضي {arabicNumber(DEFAULT_FLOORS)} أدوار. كل متر يُخصم/يُضاف بـ{" "}
                    {arabicNumber(SAR_PER_METER)} ر.س.
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
              <div className="mt-0.5 text-xs text-muted-foreground">
                النوع: <span className="font-bold text-ink">{racking.name}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {racking.description}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  السعر:{" "}
                  <span className="font-bold text-ink">
                    {arabicNumber(racking.price.toLocaleString("en-US"))} ر.س
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditRacking((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  {editRacking ? "إغلاق" : "تعديل"}
                </button>
              </div>
              {editRacking ? (
                <div className="mt-3 space-y-1.5 rounded-xl bg-primary-soft p-3">
                  {RACKING_TEMPLATES.map((r) => {
                    const selected = r.id === value.rackingId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onChange({ ...value, rackingId: r.id })}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-xs transition ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-ink hover:bg-muted"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-extrabold">{r.name}</div>
                          <div
                            className={`text-[10px] ${
                              selected ? "opacity-90" : "text-muted-foreground"
                            }`}
                          >
                            {r.description}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="font-bold">
                            {arabicNumber(r.price.toLocaleString("en-US"))} ر.س
                          </span>
                          {selected ? <Check className="h-3.5 w-3.5" /> : null}
                        </div>
                      </button>
                    );
                  })}
                  <div className="text-[11px] text-muted-foreground">
                    الافتراضي: {DEFAULT_RACKING.name} ({arabicNumber(DEFAULT_RACKING.price)} ر.س).
                    تغيير القاعدة يُعدّل السعر بمقدار الفارق.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
