// Mock data for the TAMM construction tracking dashboard.
// In a real backend this would come from Lovable Cloud.

export type Role = "owner" | "contractor" | "supervisor" | "field" | "admin";

export const ROLE_META: Record<
  Role,
  { label: string; tagline: string; accent: string; icon: string }
> = {
  owner: {
    label: "صاحب المشروع",
    tagline: "تابع الإنجاز وأطلق الدفعات",
    accent: "from-emerald-500/15 to-emerald-500/0",
    icon: "🏛️",
  },
  contractor: {
    label: "المقاول",
    tagline: "ارفع التقارير واطلب المستحقات",
    accent: "from-orange-500/15 to-orange-500/0",
    icon: "🛠️",
  },
  supervisor: {
    label: "المهندس المشرف",
    tagline: "راجع المراحل واعتمد التسليم",
    accent: "from-sky-500/15 to-sky-500/0",
    icon: "📐",
  },
  field: {
    label: "المهندس الميداني",
    tagline: "وثّق العمل من الموقع مباشرة",
    accent: "from-purple-500/15 to-purple-500/0",
    icon: "📷",
  },
  admin: {
    label: "إدارة تم",
    tagline: "أشرف على المنصة وحلّ النزاعات",
    accent: "from-rose-500/15 to-rose-500/0",
    icon: "🛡️",
  },
};

export const ROLES: Role[] = ["owner", "contractor", "supervisor", "field", "admin"];

export type PhaseStatus =
  | "completed"
  | "in_progress"
  | "awaiting_funding"
  | "pending_review"
  | "locked";

export interface Phase {
  id: string;
  name: string;
  amount: number; // SAR (thousands)
  progress: number; // 0..100
  status: PhaseStatus;
  dueDate: string;
}

export interface Project {
  id: string;
  name: string;
  city: string;
  owner: string;
  contractor: string;
  supervisor: string;
  totalBudget: number;
  releasedAmount: number;
  overallProgress: number;
  phases: Phase[];
}

export const MOCK_PROJECT: Project = {
  id: "PRJ-2041",
  name: "فيلا الياسمين — صنعاء",
  city: "صنعاء",
  owner: "م. أحمد الشامي",
  contractor: "شركة البناء المتقن",
  supervisor: "م. ليلى العمراني",
  totalBudget: 48,
  releasedAmount: 19.2,
  overallProgress: 42,
  phases: [
    {
      id: "P1",
      name: "الأساسات والحفر",
      amount: 8,
      progress: 100,
      status: "completed",
      dueDate: "2026-01-12",
    },
    {
      id: "P2",
      name: "الهيكل الإنشائي",
      amount: 11.2,
      progress: 100,
      status: "completed",
      dueDate: "2026-02-28",
    },
    {
      id: "P3",
      name: "البناء بالطوب والقواطع",
      amount: 7.4,
      progress: 65,
      status: "in_progress",
      dueDate: "2026-05-10",
    },
    {
      id: "P4",
      name: "التمديدات الكهربائية والصحية",
      amount: 6.8,
      progress: 0,
      status: "awaiting_funding",
      dueDate: "2026-06-30",
    },
    {
      id: "P5",
      name: "التشطيبات الداخلية",
      amount: 9.4,
      progress: 0,
      status: "locked",
      dueDate: "2026-08-15",
    },
    {
      id: "P6",
      name: "الواجهات والتسليم",
      amount: 5.2,
      progress: 0,
      status: "locked",
      dueDate: "2026-09-30",
    },
  ],
};

export const STATUS_LABEL: Record<PhaseStatus, string> = {
  completed: "مكتملة",
  in_progress: "قيد التنفيذ",
  awaiting_funding: "بانتظار التمويل",
  pending_review: "بانتظار المراجعة",
  locked: "مقفلة",
};

export const STATUS_TONE: Record<PhaseStatus, string> = {
  completed: "bg-primary-soft text-primary",
  in_progress: "bg-amber-100 text-amber-700",
  awaiting_funding: "bg-rose-100 text-rose-700",
  pending_review: "bg-sky-100 text-sky-700",
  locked: "bg-muted text-muted-foreground",
};

export interface FieldReport {
  id: string;
  phase: string;
  engineer: string;
  date: string;
  note: string;
  photos: number;
  status: "approved" | "pending" | "rejected";
}

export const FIELD_REPORTS: FieldReport[] = [
  {
    id: "RPT-118",
    phase: "البناء بالطوب",
    engineer: "م. سامي الحاج",
    date: "2026-04-21",
    note: "تم إنجاز جدران الدور الأول، جودة الطوب مطابقة.",
    photos: 14,
    status: "approved",
  },
  {
    id: "RPT-119",
    phase: "البناء بالطوب",
    engineer: "م. سامي الحاج",
    date: "2026-04-22",
    note: "بدء العمل على جدران الدور الثاني.",
    photos: 9,
    status: "pending",
  },
  {
    id: "RPT-120",
    phase: "التمديدات الصحية",
    engineer: "م. ياسر القباطي",
    date: "2026-04-23",
    note: "ملاحظة على ميول الصرف، يلزم إعادة التنفيذ في الجناح الشرقي.",
    photos: 6,
    status: "rejected",
  },
];

export interface PaymentRequest {
  id: string;
  phase: string;
  amount: number;
  contractor: string;
  submittedAt: string;
  status: "pending" | "approved" | "released" | "rejected";
}

export const PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: "PAY-301",
    phase: "الهيكل الإنشائي",
    amount: 11.2,
    contractor: "شركة البناء المتقن",
    submittedAt: "2026-03-01",
    status: "released",
  },
  {
    id: "PAY-302",
    phase: "البناء بالطوب — دفعة أولى",
    amount: 3_700,
    contractor: "شركة البناء المتقن",
    submittedAt: "2026-04-10",
    status: "approved",
  },
  {
    id: "PAY-303",
    phase: "البناء بالطوب — دفعة ثانية",
    amount: 3_700,
    contractor: "شركة البناء المتقن",
    submittedAt: "2026-04-22",
    status: "pending",
  },
];

export interface Dispute {
  id: string;
  project: string;
  raisedBy: string;
  topic: string;
  status: "open" | "mediating" | "resolved";
  openedAt: string;
}

export const DISPUTES: Dispute[] = [
  {
    id: "DSP-12",
    project: "فيلا الياسمين",
    raisedBy: "صاحب المشروع",
    topic: "خلاف على جودة الميول في الصرف الصحي",
    status: "mediating",
    openedAt: "2026-04-22",
  },
  {
    id: "DSP-09",
    project: "مجمع النور التجاري",
    raisedBy: "المقاول",
    topic: "تأخر تحرير دفعة الهيكل",
    status: "open",
    openedAt: "2026-04-19",
  },
];

export const PLATFORM_STATS = {
  activeProjects: 124,
  contractors: 312,
  totalTracked: 8_400_000, // SAR (thousands)
  openDisputes: 7,
};

// ---------- Purchases (Owner shopping orders) ----------
export type PurchaseStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

export interface PurchaseOrder {
  id: string;
  date: string;
  itemsCount: number;
  total: number; // SAR
  status: PurchaseStatus;
  paymentMethod: string;
  deliveryEta?: string;
  preview: { name: string; qty: number }[];
}

export const PURCHASES: PurchaseOrder[] = [
  {
    id: "ORD-7821",
    date: "2026-04-21",
    itemsCount: 4,
    total: 1_240,
    status: "shipped",
    paymentMethod: "بطاقة بنكية",
    deliveryEta: "2026-04-25",
    preview: [
      { name: "إسمنت بورتلاندي 50كغ", qty: 20 },
      { name: "حديد تسليح 12مم", qty: 50 },
    ],
  },
  {
    id: "ORD-7798",
    date: "2026-04-15",
    itemsCount: 2,
    total: 480,
    status: "delivered",
    paymentMethod: "الدفع عند الاستلام",
    preview: [
      { name: "لوح طاقة شمسية 550W", qty: 4 },
    ],
  },
  {
    id: "ORD-7755",
    date: "2026-04-09",
    itemsCount: 1,
    total: 95,
    status: "returned",
    paymentMethod: "محفظة إلكترونية",
    preview: [{ name: "مفتاح كهربائي ذكي", qty: 2 }],
  },
  {
    id: "ORD-7820",
    date: "2026-04-22",
    itemsCount: 6,
    total: 2_180,
    status: "processing",
    paymentMethod: "بطاقة بنكية",
    deliveryEta: "2026-04-28",
    preview: [
      { name: "بلوك خرساني 20سم", qty: 200 },
      { name: "أكياس إسمنت", qty: 30 },
    ],
  },
];

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  processing: "قيد التحضير",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  returned: "مُرجع",
  cancelled: "ملغي",
};

export const PURCHASE_STATUS_TONE: Record<PurchaseStatus, "muted" | "primary" | "accent" | "danger" | "info"> = {
  processing: "accent",
  shipped: "info",
  delivered: "primary",
  returned: "danger",
  cancelled: "muted",
};

