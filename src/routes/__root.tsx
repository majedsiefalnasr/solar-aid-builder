import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          عذراً، لم نتمكن من العثور على الصفحة المطلوبة.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "تم — منصة البناء والطاقة الشمسية" },
      {
        name: "description",
        content: "احسب نظامك الشمسي بدقة، تسوق مواد البناء، واكتشف أدوات هندسية متقدمة.",
      },
      { name: "author", content: "تم" },
      { property: "og:title", content: "تم — منصة البناء والطاقة الشمسية" },
      {
        property: "og:description",
        content: "أداة مجانية لمساعدتك على فهم احتياجاتك من الطاقة الشمسية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "تم — منصة البناء والطاقة الشمسية" },
      { name: "description", content: "Solar Builder is a web application for calculating solar energy system requirements." },
      { property: "og:description", content: "Solar Builder is a web application for calculating solar energy system requirements." },
      { name: "twitter:description", content: "Solar Builder is a web application for calculating solar energy system requirements." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fae9ff19-96f1-4e1a-b881-23b28f93267f/id-preview-ca9f43b9--5d8f0073-91cb-4597-9404-9ceb1d94137f.lovable.app-1776869459247.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fae9ff19-96f1-4e1a-b881-23b28f93267f/id-preview-ca9f43b9--5d8f0073-91cb-4597-9404-9ceb1d94137f.lovable.app-1776869459247.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
