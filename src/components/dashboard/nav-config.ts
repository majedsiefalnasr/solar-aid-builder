import {
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Coins,
  CreditCard,
  Folder,
  HardHat,
  LayoutDashboard,
  ListChecks,
  PackageSearch,
  PlusSquare,
  Settings2,
  ShoppingBag,
  Store,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import type { Role } from "@/lib/dashboard-data";

export interface NavItem {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  group?: string;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  admin: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "المشاريع", icon: Building2 },
    { key: "assignments", label: "طلبات التعيين", icon: UserPlus },
    { key: "payments", label: "المدفوعات", icon: CreditCard },
    { key: "users", label: "المستخدمون", icon: Users },
    { key: "workflow", label: "إعدادات سير العمل", icon: Workflow },
    { key: "finance", label: "المالية", icon: TrendingUp },
    { key: "store", label: "المتجر", icon: Store, group: "المتجر" },
    { key: "products", label: "إدارة المنتجات", icon: PackageSearch, group: "المتجر" },
    { key: "orders", label: "الفئات والطلبات", icon: ShoppingBag, group: "المتجر" },
  ],
  owner: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "مشاريعي", icon: Folder },
    { key: "new-project", label: "مشروع جديد", icon: PlusSquare },
    { key: "payments", label: "المدفوعات", icon: CreditCard },
    { key: "store", label: "المتجر", icon: Store },
  ],
  contractor: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "مشاريعي", icon: Briefcase },
    { key: "tasks", label: "المهام", icon: ListChecks },
    { key: "withdrawals", label: "السحوبات", icon: Wallet },
    { key: "buy-materials", label: "شراء مواد", icon: ShoppingBag },
  ],
  supervisor: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "المشاريع", icon: Building2 },
    { key: "assignments", label: "طلبات التعيين", icon: UserPlus },
    { key: "field-team", label: "الفريق الميداني", icon: HardHat },
    { key: "approvals", label: "الاعتمادات", icon: ClipboardCheck },
  ],
  field: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "reports", label: "تقاريري", icon: ClipboardList },
  ],
};

export function validSection(role: Role, section: string | undefined): string {
  const items = NAV_BY_ROLE[role];
  if (!section) return items[0].key;
  return items.find((i) => i.key === section)?.key ?? items[0].key;
}

export { Coins, Settings2, CheckCircle2 };
