import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { TammMark } from "@/components/tamm-logo";

const navLinks = [
  { to: "/", label: "الرئيسية" },
  { to: "/tools", label: "الأدوات الهندسية" },
  { to: "/store", label: "المتجر" },
  { to: "/", label: "مركز المساعدة" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="تم — الصفحة الرئيسية">
          <TammMark className="h-9 w-auto md:h-11" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-sm font-medium text-foreground/80 transition hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground md:flex">
            <span className="text-primary">عربي</span>
            <span className="text-border">|</span>
            <span>ENG</span>
          </div>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
            aria-label="السلة"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="space-y-3">
          <TammMark className="h-10 w-auto" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            منصة هندسية متكاملة لخدمات البناء، مواد البناء، والطاقة الشمسية.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-ink">روابط سريعة</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>الرئيسية</li>
            <li>حلولنا</li>
            <li>المتجر</li>
            <li>مركز المساعدة</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-ink">الفئات</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>الطاقة الشمسية</li>
            <li>مواد البناء</li>
            <li>المضخات</li>
            <li>البطاريات</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-ink">تواصل</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>info@tamm.tech</li>
            <li>+967 700 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 تم. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
