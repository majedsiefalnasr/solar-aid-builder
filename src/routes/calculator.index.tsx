import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { CITIES, loadState, saveState } from "@/lib/calculator";

export const Route = createFileRoute("/calculator/")({
  head: () => ({
    meta: [
      { title: "حاسبة الطاقة الشمسية — الموقع | تم" },
      {
        name: "description",
        content: "الخطوة 1: حدد مدينتك للحصول على حسابات دقيقة لنظامك الشمسي.",
      },
    ],
  }),
  component: StepLocation,
});

function StepLocation() {
  const navigate = useNavigate();
  const [city, setCity] = useState<string>("تعز");

  useEffect(() => {
    const s = loadState();
    setCity(s.city);
  }, []);

  const next = () => {
    const s = loadState();
    saveState({ ...s, city });
    navigate({ to: "/calculator/preferences" });
  };

  return (
    <CalculatorShell>
      <div className="flex items-start gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary md:flex">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-ink">اختر مدينتك</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            نستخدم موقعك لحساب ساعات الذروة الشمسية بدقة في اليمن.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Field label="المدينة">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
          >
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <hr className="my-8 border-border" />

      {/* RTL: primary CTA on the LEFT, secondary on the RIGHT */}
      <div className="flex items-center justify-between" dir="ltr">
        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
          dir="rtl"
        >
          التالي
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          dir="rtl"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للموقع الرئيسي
        </Link>
      </div>
    </CalculatorShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}
