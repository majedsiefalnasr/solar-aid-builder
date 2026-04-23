import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Plus,
  Trash2,
  Snowflake,
  Wind,
  Fan,
  Lightbulb,
  Droplets,
  Box,
  Zap,
  Receipt,
  ListChecks,
} from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import {
  AC_PRESETS,
  FAN_PRESETS,
  FRIDGE_PRESETS,
  LIGHT_PRESETS,
  PUMP_PRESETS,
  loadState,
  saveState,
  type CalcMode,
  type Device,
  type DeviceCategory,
  type BillInput,
} from "@/lib/calculator";

export const Route = createFileRoute("/calculator/devices")({
  head: () => ({
    meta: [
      { title: "اختر الأجهزة — حاسبة الطاقة | تم" },
      {
        name: "description",
        content: "الخطوة 3: حدد الأجهزة التي ترغب في تشغيلها للحصول على أفضل تقدير.",
      },
    ],
  }),
  component: StepDevices,
});

const categoryMeta: {
  id: DeviceCategory;
  label: string;
  Icon: typeof Snowflake;
  defaultLabel: string;
  defaultWatts: number;
  presets: { label: string; watts: number }[];
}[] = [
  { id: "fridges", label: "الثلاجات", Icon: Snowflake, defaultLabel: "ثلاجة", defaultWatts: 150, presets: FRIDGE_PRESETS },
  { id: "ac", label: "المكيفات", Icon: Wind, defaultLabel: "مكيف", defaultWatts: 1200, presets: AC_PRESETS },
  { id: "fans", label: "المراوح", Icon: Fan, defaultLabel: "مروحة", defaultWatts: 75, presets: FAN_PRESETS },
  { id: "lights", label: "الإضاءة", Icon: Lightbulb, defaultLabel: "لمبة LED", defaultWatts: 9, presets: LIGHT_PRESETS },
  { id: "pumps", label: "مضخات المياه", Icon: Droplets, defaultLabel: "مضخة", defaultWatts: 750, presets: PUMP_PRESETS },
  { id: "other", label: "أجهزة أخرى", Icon: Box, defaultLabel: "جهاز مخصص", defaultWatts: 100, presets: [] },
];

function StepDevices() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CalcMode>("loads");
  const [devices, setDevices] = useState<Device[]>([]);
  const [bill, setBill] = useState<BillInput>({
    kWh15Days: 450,
    dayHours: 14,
    nightHours: 6,
  });
  const [activeCat, setActiveCat] = useState<DeviceCategory>("fridges");

  useEffect(() => {
    const s = loadState();
    setMode(s.mode);
    setDevices(s.devices);
    setBill(s.bill);
  }, []);

  const filtered = devices.filter((d) => d.category === activeCat);
  const meta = categoryMeta.find((c) => c.id === activeCat)!;

  const totalWatts = useMemo(
    () => filtered.reduce((a, d) => a + d.watts * d.qty, 0),
    [filtered],
  );

  const update = (id: string, patch: Partial<Device>) => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };
  const remove = (id: string) => setDevices((ds) => ds.filter((d) => d.id !== id));
  const add = () => {
    setDevices((ds) => [
      ...ds,
      {
        id: crypto.randomUUID(),
        category: activeCat,
        label: meta.defaultLabel,
        watts: meta.defaultWatts,
        qty: 1,
        hours: 8,
        nightHours: 2,
      },
    ]);
  };

  const goCalculate = () => {
    saveState({ ...loadState(), mode, devices, bill });
    navigate({ to: "/results" });
  };

  return (
    <CalculatorShell>
      <div className="flex items-start gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary md:flex">
          <Box className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-ink">بيانات الاستهلاك</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            اختر طريقة الحساب الأنسب لك للحصول على أفضل تقدير.
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("loads")}
          className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-right transition ${
            mode === "loads"
              ? "border-primary bg-primary-soft"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              mode === "loads" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/60"
            }`}
          >
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-ink">بحسب الأحمال</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
              حدد كل جهاز وقدرته وساعات تشغيله.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("bill")}
          className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-right transition ${
            mode === "bill"
              ? "border-primary bg-primary-soft"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              mode === "bill" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/60"
            }`}
          >
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-ink">بحسب الفاتورة</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
              أدخل استهلاكك من فاتورة الكهرباء التجارية لـ 15 يوم.
            </div>
          </div>
        </button>
      </div>

      {mode === "bill" ? (
        <BillForm bill={bill} onChange={setBill} />
      ) : (
        <DevicesContent
          devices={devices}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          filtered={filtered}
          meta={meta}
          totalWatts={totalWatts}
          add={add}
          update={update}
          remove={remove}
        />
      )}

      <hr className="my-8 border-border" />

      {/* RTL: primary CTA on the LEFT */}
      <div className="flex items-center justify-between" dir="ltr">
        <button
          onClick={goCalculate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
          dir="rtl"
        >
          <Zap className="h-4 w-4" />
          احسب
        </button>
        <button
          onClick={() => navigate({ to: "/calculator/preferences" })}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          dir="rtl"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </button>
      </div>
    </CalculatorShell>
  );
}

function DeviceRow({
  device,
  index,
  presets,
  onChange,
  onRemove,
}: {
  device: Device;
  index: number;
  presets: { label: string; watts: number }[];
  onChange: (p: Partial<Device>) => void;
  onRemove: () => void;
}) {
  const total = device.watts * device.qty;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-foreground/70">
            الجهاز #{index}
          </span>
          <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-bold text-primary">
            {total}W إجمالي
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground transition hover:text-destructive"
          aria-label="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <NumberField
          label="القدرة (واط)"
          value={device.watts}
          onChange={(v) => onChange({ watts: v })}
        />
        <NumberField
          label="العدد"
          value={device.qty}
          onChange={(v) => onChange({ qty: Math.max(1, v) })}
        />
        <NumberField
          label="ساعات التشغيل"
          value={device.hours}
          onChange={(v) => onChange({ hours: Math.max(0, Math.min(24, v)) })}
        />
        <NumberField
          label="منها ساعات ليلية"
          value={device.nightHours}
          onChange={(v) =>
            onChange({ nightHours: Math.max(0, Math.min(device.hours, v)) })
          }
        />
      </div>

      {presets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = p.watts === device.watts && p.label === device.label;
            return (
              <button
                key={p.label}
                onClick={() => onChange({ watts: p.watts, label: p.label })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40"
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] text-muted-foreground">{p.watts} واط</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-input bg-card focus-within:border-primary">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="px-3 py-2.5 text-muted-foreground transition hover:text-primary"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent py-2.5 text-center text-sm font-bold text-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="px-3 py-2.5 text-muted-foreground transition hover:text-primary"
        >
          +
        </button>
      </div>
    </label>
  );
}

function DevicesContent({
  devices,
  activeCat,
  setActiveCat,
  filtered,
  meta,
  totalWatts,
  add,
  update,
  remove,
}: {
  devices: Device[];
  activeCat: DeviceCategory;
  setActiveCat: (c: DeviceCategory) => void;
  filtered: Device[];
  meta: (typeof categoryMeta)[number];
  totalWatts: number;
  add: () => void;
  update: (id: string, patch: Partial<Device>) => void;
  remove: (id: string) => void;
}) {
  const MetaIcon = meta.Icon;
  return (
    <>
      {/* Category tabs */}
      <div className="mt-6 grid grid-cols-3 gap-2.5 md:grid-cols-6">
        {categoryMeta.map((c) => {
          const Icon = c.Icon;
          const active = activeCat === c.id;
          const count = devices.filter((d) => d.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 text-xs font-bold transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-cta"
                  : "border-border bg-card text-foreground/80 hover:border-primary/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              {c.label}
              {count > 0 && (
                <span
                  className={`absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                    active ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Devices list for active category */}
      <div className="mt-7 rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <MetaIcon className="h-5 w-5 text-primary" />
            تفاصيل {meta.label}
          </h3>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground/70">
            {filtered.length} جهاز · {totalWatts}W
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            لا توجد أجهزة بعد. اضغط "إضافة جهاز" للبدء.
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((d, i) => (
              <DeviceRow
                key={d.id}
                device={d}
                index={i + 1}
                presets={meta.presets}
                onChange={(p) => update(d.id, p)}
                onRemove={() => remove(d.id)}
              />
            ))}
          </div>
        )}

        <button
          onClick={add}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-3 text-sm font-bold text-foreground/70 transition hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          إضافة {meta.label === "أجهزة أخرى" ? "جهاز مخصص" : "جديد"}
        </button>
      </div>
    </>
  );
}

function BillForm({
  bill,
  onChange,
}: {
  bill: BillInput;
  onChange: (b: BillInput) => void;
}) {
  const dailyAvg = bill.kWh15Days / 15;
  const totalHours = Math.max(1, bill.dayHours);
  const nightHours = Math.max(0, Math.min(totalHours, bill.nightHours));
  const hourlyLoad = dailyAvg / totalHours;
  const batteryKWh = Math.round(nightHours * hourlyLoad * 1.2);

  return (
    <div className="mt-7 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-base font-extrabold text-ink">بيانات فاتورة الكهرباء</h3>
      </div>

      <div className="space-y-5">
        <NumberField
          label="استهلاك الكهرباء خلال 15 يوم (kWh)"
          value={bill.kWh15Days}
          onChange={(v) => onChange({ ...bill, kWh15Days: Math.max(0, v) })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="إجمالي عدد ساعات التشغيل في اليوم"
            value={bill.dayHours}
            onChange={(v) =>
              onChange({ ...bill, dayHours: Math.max(1, Math.min(24, v)) })
            }
          />
          <NumberField
            label="منها ساعات ليلية (للبطارية)"
            value={bill.nightHours}
            onChange={(v) =>
              onChange({ ...bill, nightHours: Math.max(0, Math.min(24, v)) })
            }
          />
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-xl bg-primary-soft p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-foreground/80">متوسط الاستهلاك اليومي</span>
          <span className="font-bold text-ink">{dailyAvg.toFixed(1)} kWh</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground/80">الحمل في الساعة</span>
          <span className="font-bold text-ink">{hourlyLoad.toFixed(2)} kW/h</span>
        </div>
        <div className="flex items-center justify-between border-t border-primary/15 pt-2">
          <span className="font-bold text-primary">سعة البطارية المقترحة</span>
          <span className="font-extrabold text-primary">{batteryKWh} kWh</span>
        </div>
      </div>
    </div>
  );
}
