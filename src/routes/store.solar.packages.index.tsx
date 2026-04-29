import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Sun, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { PACKAGE_GROUPS, sizePackage, type SolarPackage } from "@/lib/solar-packages";
import { arabicNumber } from "@/components/calculator-shell";

export const Route = createFileRoute("/store/solar/packages/")({
  head: () => ({
    meta: [
      { title: "الحُزم الشمسية الجاهزة | تم" },
      {
        name: "description",
        content:
          "تصفح الحُزم الجاهزة للشقق، العمائر السكنية، وحزم المؤثرين بأسعار وتفاصيل واضحة.",
      },
      { property: "og:title", content: "الحُزم الشمسية الجاهزة | تم" },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
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
          <span className="font-bold text-ink">حُزم جاهزة</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-8 md:py-14">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">الحُزم الجاهزة</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            حزم مكوّنة من ألواح شمسية، بنك بطاريات ليثيوم، ومحول طاقة — مُحجّمة بحسب
            استهلاكك التقديري كل 15 يوم.
          </p>
        </header>

        {PACKAGE_GROUPS.map((group) => (
          <div key={group.id}>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">{group.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">{group.subtitle}</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
                {group.items.length} حزم
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}

function PackageCard({ pkg }: { pkg: SolarPackage }) {
  if (pkg.comingSoon) {
    return (
      <article className="relative flex flex-col overflow-hidden rounded-3xl border border-dashed border-border bg-card p-6 opacity-90">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-extrabold text-ink">{pkg.name}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground">{pkg.subtitle}</p>
        <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-700">
          قريباً
        </div>
      </article>
    );
  }

  const { result } = sizePackage(pkg);
  const appliances = pkg.appliances ?? [];

  return (
    <Link
      to="/store/solar/packages/$packageId"
      params={{ packageId: pkg.id }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
        <Sun className="h-6 w-6" />
      </div>
      <h3 className="text-base font-extrabold text-ink">{pkg.name}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground">{pkg.subtitle}</p>

      {appliances.length > 0 && (
        <div className="mt-4 rounded-2xl bg-muted/60 p-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            الأجهزة التي يمكن تشغيلها
          </div>
          <ul className="space-y-1.5">
            {appliances.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <div className="text-[10px] font-bold uppercase text-muted-foreground">السعر التقديري</div>
          <div className="text-xl font-extrabold text-primary">
            {arabicNumber(result.totalSAR.toLocaleString("en-US"))}
            <span className="text-xs font-bold text-muted-foreground"> ر.س</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
          عرض التفاصيل
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />
        </span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        قابل للتخفيض بحسب المسافة من السطح إلى مكان المنظومة
      </p>
    </Link>
  );
}

function Mini(_: { icon: React.ReactNode; label: string; value: string }) {
  return null;
}
