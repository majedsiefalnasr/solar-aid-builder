import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Settings2, ShieldCheck } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import {
  loadState,
  saveState,
  type Autonomy,
  type BatteryType,
} from "@/lib/calculator";

export const Route = createFileRoute("/calculator/preferences")({
  head: () => ({
    meta: [
      { title: "تفضيلات النظام — حاسبة الطاقة | متجددة" },
      {
        name: "description",
        content: "الخطوة 2: اختر نوع البطارية وعدد ليالي التخزين المطلوبة لنظامك.",
      },
    ],
  }),
  component: StepPreferences,
});

const batteryOpts: { id: BatteryType; title: string; desc: string }[] = [
  { id: "gel", title: "بطارية عادية / جل", desc: "خيار اقتصادي للأنظمة الصغيرة." },
  { id: "lithium", title: "بطارية ليثيوم (LiFePO4)", desc: "عمر أطول، شحن أسرع، وكفاءة أعلى." },
];

const autonomyOpts: { id: Autonomy; title: string; desc: string; rec?: boolean }[] = [
  { id: 0, title: "بدون تخزين (للاستخدام النهاري)", desc: "يحتسب بطارية صغيرة لتثبيت التيار." },
  { id: 1, title: "ليلة واحدة", desc: "مناسب كبديل احتياطي للشبكة." },
  { id: 2, title: "ليلتان (موصى به)", desc: "توازن جيد بين التكلفة والاعتمادية.", rec: true },
  { id: 3, title: "3 ليالٍ (اعتمادية عالية)", desc: "للأحمال الحرجة أو المناطق ذات الطقس المتقلب." },
];

function StepPreferences() {
  const navigate = useNavigate();
  const [battery, setBattery] = useState<BatteryType>("lithium");
  const [autonomy, setAutonomy] = useState<Autonomy>(2);

  useEffect(() => {
    const s = loadState();
    setBattery(s.battery);
    setAutonomy(s.autonomy);
  }, []);

  const next = () => {
    saveState({ ...loadState(), battery, autonomy });
    navigate({ to: "/calculator/devices" });
  };

  return (
    <CalculatorShell>
      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        {/* Form column */}
        <div>
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary md:flex">
              <Settings2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-ink">حدد تفضيلات النظام</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                اختر نوع البطارية وعدد ليالي التخزين المطلوبة.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 text-sm font-bold text-ink">نوع البطارية المفضل</div>
            <div className="grid gap-3">
              {batteryOpts.map((o) => (
                <OptionCard
                  key={o.id}
                  selected={battery === o.id}
                  onClick={() => setBattery(o.id)}
                  title={o.title}
                  desc={o.desc}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 text-sm font-bold text-ink">الاعتمادية (ليالي التخزين)</div>
            <div className="grid gap-3">
              {autonomyOpts.map((o) => (
                <OptionCard
                  key={o.id}
                  selected={autonomy === o.id}
                  onClick={() => setAutonomy(o.id)}
                  title={o.title}
                  desc={o.desc}
                  badge={o.rec ? "موصى به" : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <aside className="rounded-2xl border border-border bg-muted/40 p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
            <ShieldCheck className="h-5 w-5 text-primary" />
            ماذا تعني الاعتمادية؟
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            "ليالي التخزين" هي عدد الأيام التي يمكن لنظامك أن يزودك بالطاقة دون شمس.
          </p>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-3 text-sm">
            <div>
              <div className="font-bold text-ink">ليلة واحدة (أساسي)</div>
              <div className="mt-1 text-muted-foreground">
                مثالي كبديل للشبكة العامة في المناطق المشمسة.
              </div>
            </div>
            <div>
              <div className="font-bold text-ink">ليلتان (موصى به)</div>
              <div className="mt-1 text-muted-foreground">
                يحقق أفضل توازن بين التكلفة والأمان.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <hr className="my-8 border-border" />

      <div className="flex items-center justify-between">
        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
        >
          التالي
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate({ to: "/calculator" })}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
        >
          السابق
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </CalculatorShell>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  desc,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-right transition ${
        selected
          ? "border-primary bg-primary-soft/50"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-ink">{title}</span>
          {badge && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {badge}
            </span>
          )}
        </span>
        {desc && (
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {desc}
          </span>
        )}
      </span>
    </button>
  );
}
