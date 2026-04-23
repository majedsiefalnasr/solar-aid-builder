import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Bell, Home, LogOut, Search } from "lucide-react";
import { TammMark } from "@/components/tamm-logo";
import { ROLE_META, ROLES, type Role } from "@/lib/dashboard-data";
import { NAV_BY_ROLE, validSection } from "@/components/dashboard/nav-config";
import { OwnerSection } from "@/components/dashboard/owner-sections";
import { ContractorSection } from "@/components/dashboard/contractor-sections";
import { SupervisorSection } from "@/components/dashboard/supervisor-sections";
import { FieldSection } from "@/components/dashboard/field-sections";
import { AdminSection } from "@/components/dashboard/admin-sections";

interface DashboardSearch {
  role: Role;
  section?: string;
  projectId?: string;
  categoryId?: string;
  orderId?: string;
}

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const role = search.role as Role;
    const validRole = ROLES.includes(role) ? role : "owner";
    const section = typeof search.section === "string" ? search.section : undefined;
    const projectId = typeof search.projectId === "string" ? search.projectId : undefined;
    const categoryId = typeof search.categoryId === "string" ? search.categoryId : undefined;
    const orderId = typeof search.orderId === "string" ? search.orderId : undefined;
    return {
      role: validRole,
      section: validSection(validRole, section),
      projectId,
      categoryId,
      orderId,
    };
  },
  head: () => ({
    meta: [
      { title: "لوحة التحكم | تم" },
      { name: "description", content: "لوحة إدارة مشاريع البناء عبر منصة تم." },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { role, section, projectId, categoryId, orderId } = Route.useSearch();
  const navigate = useNavigate();
  const meta = ROLE_META[role];
  const nav = NAV_BY_ROLE[role];
  const currentSection = section ?? nav[0].key;

  // Group items
  const grouped = nav.reduce<Record<string, typeof nav>>((acc, item) => {
    const g = item.group ?? "main";
    acc[g] = acc[g] ?? [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen max-h-screen w-64 shrink-0 self-start overflow-hidden border-l border-border bg-card/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/60 md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-border px-5">
            <Link to="/" className="flex items-center">
              <TammMark className="h-10 w-auto" />
            </Link>
          </div>

          {/* Role switcher */}
          <div className="border-b border-border p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              الدور الحالي
            </div>
            <select
              value={role}
              onChange={(e) =>
                navigate({
                  to: "/dashboard",
                  search: { role: e.target.value as Role },
                })
              }
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-bold text-ink focus:border-primary focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_META[r].icon} {ROLE_META[r].label}
                </option>
              ))}
            </select>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto p-3">
            {Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} className="space-y-1">
                {groupName !== "main" && (
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {groupName}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === currentSection;
                  return (
                    <button
                      key={item.key}
                      onClick={() =>
                        navigate({
                          to: "/dashboard",
                          search: { role, section: item.key },
                        })
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-primary-soft text-primary"
                          : "text-foreground/80 hover:bg-muted hover:text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-3">
            <Link
              to="/login"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-muted hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-border bg-card/60 px-4 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/50 md:px-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meta.icon}</span>
              <div className="min-w-0">
                <div className="truncate text-base font-extrabold text-ink md:text-lg">
                  {meta.label}
                </div>
                <div className="truncate text-xs text-muted-foreground">{meta.tagline}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="ابحث في المنصة…"
                  className="w-40 bg-transparent text-xs text-ink placeholder:text-muted-foreground/60 focus:outline-none lg:w-56"
                />
              </div>
              <button
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                aria-label="الإشعارات"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-accent" />
              </button>
              <Link
                to="/"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-primary hover:text-primary md:inline-flex"
                aria-label="الموقع الرئيسي"
              >
                <Home className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* Mobile section selector */}
          <div className="border-b border-border bg-card px-4 py-2 md:hidden">
            <select
              value={currentSection}
              onChange={(e) =>
                navigate({
                  to: "/dashboard",
                  search: { role, section: e.target.value },
                })
              }
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none"
            >
              {nav.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <main className="flex-1 px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8">
            <DashboardContent
              role={role}
              section={currentSection}
              projectId={projectId}
              categoryId={categoryId}
              orderId={orderId}
            />
            <Outlet />
          </main>
        </div>
      </div>

      {/* Demo mode notice — floating bottom center with blur */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 md:bottom-6">
        <div className="pointer-events-auto flex max-w-[640px] items-center gap-2.5 rounded-full border border-amber-300/50 bg-amber-50/60 px-4 py-2 text-center text-[11px] font-semibold text-amber-900 shadow-elevated backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-amber-50/40 md:gap-3 md:px-5 md:py-2.5 md:text-xs">
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-amber-500/30 px-2 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            وضع تجريبي
          </span>
          <span className="leading-snug">جميع البيانات المعروضة وهمية وتُستخدم لأغراض العرض فقط — لا تعكس بيانات حقيقية.</span>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({
  role,
  section,
  projectId,
  categoryId,
  orderId,
}: {
  role: Role;
  section: string;
  projectId?: string;
  categoryId?: string;
  orderId?: string;
}) {
  switch (role) {
    case "owner":
      return <OwnerSection section={section} projectId={projectId} />;
    case "contractor":
      return <ContractorSection section={section} projectId={projectId} />;
    case "supervisor":
      return <SupervisorSection section={section} projectId={projectId} />;
    case "field":
      return <FieldSection section={section} />;
    case "admin":
      return (
        <AdminSection
          section={section}
          projectId={projectId}
          categoryId={categoryId}
          orderId={orderId}
        />
      );
  }
}
