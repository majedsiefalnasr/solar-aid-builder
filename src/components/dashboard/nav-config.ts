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
  MessageSquare,
  PackageSearch,
  PlusSquare,
  Receipt,
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
    { key: "messages", label: "المحادثات", icon: MessageSquare },
    { key: "users", label: "المستخدمون", icon: Users },
    { key: "workflow", label: "إعدادات سير العمل", icon: Workflow },
    { key: "finance", label: "المالية", icon: TrendingUp },
    { key: "store", label: "المتجر", icon: Store, group: "المتجر" },
    { key: "products", label: "إدارة المنتجات", icon: PackageSearch, group: "المتجر" },
    { key: "categories", label: "الفئات", icon: Folder, group: "المتجر" },
    { key: "orders", label: "الطلبات", icon: ShoppingBag, group: "المتجر" },
  ],
  owner: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "مشاريعي", icon: Folder },
    { key: "new-project", label: "مشروع جديد", icon: PlusSquare },
    { key: "reports", label: "التقارير", icon: ClipboardList },
    { key: "payments", label: "المدفوعات", icon: CreditCard },
    { key: "messages", label: "المحادثات", icon: MessageSquare },
    { key: "purchases", label: "مشترياتي", icon: Receipt },
  ],
  contractor: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "مشاريعي", icon: Briefcase },
    { key: "tasks", label: "المهام", icon: ListChecks },
    { key: "reports", label: "التقارير", icon: ClipboardList },
    { key: "messages", label: "المحادثات", icon: MessageSquare },
    { key: "withdrawals", label: "السحوبات", icon: Wallet },
    { key: "buy-materials", label: "شراء مواد", icon: ShoppingBag },
  ],
  supervisor: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "projects", label: "المشاريع", icon: Building2 },
    { key: "assignments", label: "طلبات التعيين", icon: UserPlus },
    { key: "field-team", label: "الفريق الميداني", icon: HardHat },
    { key: "reports", label: "التقارير", icon: ClipboardList },
    { key: "approvals", label: "الاعتمادات", icon: ClipboardCheck },
    { key: "messages", label: "المحادثات", icon: MessageSquare },
  ],
  field: [
    { key: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { key: "reports", label: "تقاريري", icon: ClipboardList },
    { key: "messages", label: "المحادثات", icon: MessageSquare },
  ],
};

// Sections that exist as detail pages (accessed via projectId) but are not in the sidebar
export const DETAIL_SECTIONS: Record<Role, string[]> = {
  admin: ["project-detail", "category-detail", "order-detail"],
  owner: ["project-detail"],
  contractor: ["project-detail"],
  supervisor: ["project-detail"],
  field: [],
};

export function validSection(role: Role, section: string | undefined): string {
  const items = NAV_BY_ROLE[role];
  if (!section) return items[0].key;
  if (items.find((i) => i.key === section)) return section;
  if (DETAIL_SECTIONS[role].includes(section)) return section;
  return items[0].key;
}

export { Coins, Settings2, CheckCircle2 };
