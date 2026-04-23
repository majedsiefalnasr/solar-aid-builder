import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { TammMark } from "@/components/tamm-logo";
import { ROLE_META, ROLES, type Role } from "@/lib/dashboard-data";

interface DashboardSearch {
  role: Role;
}

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const role = search.role as Role;
    return {
      role: ROLES.includes(role) ? role : "owner",
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

const NAV_BY_ROLE: Record<
  Role,
  { label: string; icon: typeof Home; key: string }[]
> = {
  owner: [
    { label: "نظرة عامة", icon: LayoutDashboard, key: "overview" },
    { label: "مشاريعي", icon: Building2, key: "projects" },
    { label: "الدفعات", icon: CreditCard, key: "payments" },
    { label: "التقارير", icon: FileText, key: "reports" },
  ],
  contractor: [
    { label: "نظرة عامة", icon: LayoutDashboard, key: "overview" },
    { label: "أعمالي", icon: Building2, key: "projects" },
    { label: "طلب دفعة", icon: CreditCard, key: "payments" },
    { label: "رفع تقرير", icon: FileText, key: "reports" },
  ],
  supervisor: [
    { label: "نظرة عامة", icon: LayoutDashboard, key: "overview" },
    { label: "للمراجعة", icon: ShieldCheck, key: "review" },
    { label: "المشاريع", icon: Building2, key: "projects" },
  ],
  field: [
    { label: "اليوم", icon: LayoutDashboard, key: "today" },
    { label: "تقاريري", icon: FileText, key: "reports" },
  ],
  admin: [
    { label: "نظرة عامة", icon: LayoutDashboard, key: "overview" },
    { label: "المستخدمون", icon: Users, key: "users" },
    { label: "النزاعات", icon: ShieldCheck, key: "disputes" },
    { label: "الإعدادات", icon: Settings, key: "settings" },
  ],
};

function DashboardLayout() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const meta = ROLE_META[role];
  const nav = NAV_BY_ROLE[role];

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-l border-border bg-card md:flex md:flex-col">
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

          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-muted hover:text-primary first:bg-primary-soft first:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
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
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur md:px-8">
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

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <DashboardContent role={role} />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

import { OwnerDashboard } from "@/components/dashboard/owner-dashboard";
import { ContractorDashboard } from "@/components/dashboard/contractor-dashboard";
import { SupervisorDashboard } from "@/components/dashboard/supervisor-dashboard";
import { FieldDashboard } from "@/components/dashboard/field-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

function DashboardContent({ role }: { role: Role }) {
  switch (role) {
    case "owner":
      return <OwnerDashboard />;
    case "contractor":
      return <ContractorDashboard />;
    case "supervisor":
      return <SupervisorDashboard />;
    case "field":
      return <FieldDashboard />;
    case "admin":
      return <AdminDashboard />;
  }
}
