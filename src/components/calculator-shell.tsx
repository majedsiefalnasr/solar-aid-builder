import { Link, useLocation } from "@tanstack/react-router";
import { Check } from "lucide-react";
import heroImg from "@/assets/solar-hero.jpg";
import { SiteNav } from "@/components/site-chrome";

const steps = [
  { to: "/calculator", label: "الموقع" },
  { to: "/calculator/preferences", label: "تفضيلات النظام" },
  { to: "/calculator/devices", label: "الأجهزة" },
] as const;

export function CalculatorShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.to === pathname),
  );
  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero band */}
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-extrabold text-ink md:text-4xl">
            احسب نظامك الشمسي بدقة
          </h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/80 md:text-base">
            أداة مجانية لمساعدتك على فهم احتياجاتك من الطاقة الشمسية.
          </p>
        </div>
      </div>

      <main className="mx-auto -mt-16 max-w-4xl px-4 pb-20 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-card shadow-elevated">
          {/* Step header */}
          <div className="border-b border-border/60 bg-card px-6 py-5 md:px-10 md:py-6">
            <div className="mb-3 text-center text-sm font-semibold text-muted-foreground">
              الخطوة {arabicNumber(idx + 1)} من {arabicNumber(steps.length)}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 hidden justify-between text-xs md:flex">
              {steps.map((s, i) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className={`flex items-center gap-1.5 ${i <= idx ? "text-primary font-semibold" : "text-muted-foreground"}`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      i < idx
                        ? "bg-primary text-primary-foreground"
                        : i === idx
                          ? "border-2 border-primary text-primary"
                          : "border border-border text-muted-foreground"
                    }`}
                  >
                    {i < idx ? <Check className="h-3 w-3" /> : arabicNumber(i + 1)}
                  </span>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-6 py-7 md:px-10 md:py-10">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function arabicNumber(n: number | string): string {
  const map = "٠١٢٣٤٥٦٧٨٩";
  return String(n).replace(/\d/g, (d) => map[Number(d)]);
}
