import { Monitor, Moon, Palette, RotateCcw, Sun, Type } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/dashboard-data";
import {
  resetSettings,
  setRolePref,
  setSetting,
  useSettings,
  type FontFamily,
  type FontSize,
  type LayoutMode,
  type ThemeMode,
} from "@/lib/settings-store";
import { PageHeader } from "./section-shell";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "النظام", icon: Monitor },
];

const FONT_OPTIONS: { value: FontFamily; label: string; sample: string }[] = [
  { value: "cairo", label: "Cairo (افتراضي)", sample: "كايرو • Cairo" },
  { value: "tajawal", label: "Tajawal", sample: "تجوال • Tajawal" },
  { value: "ibm", label: "IBM Plex Arabic", sample: "آي بي إم • IBM" },
  { value: "noto", label: "Noto Sans Arabic", sample: "نوتو • Noto" },
];

const SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "صغير" },
  { value: "md", label: "متوسط" },
  { value: "lg", label: "كبير" },
  { value: "xl", label: "كبير جداً" },
];

const LAYOUT_OPTIONS: { value: LayoutMode; label: string; desc: string }[] = [
  { value: "boxed", label: "محتوى مُؤطّر", desc: "أقصى عرض 1500px للمحتوى" },
  { value: "wide", label: "عريض", desc: "أقصى عرض 1800px" },
  { value: "full", label: "بعرض الشاشة", desc: "بدون حد أقصى" },
];

export function SettingsSection({ role }: { role: Role }) {
  const settings = useSettings();
  const rolePrefs = settings.rolePrefs[role] ?? {};

  return (
    <>
      <PageHeader
        title="الإعدادات"
        subtitle="خصّص تجربتك على المنصة — السمات، الخطوط، التخطيط، وتفضيلات دورك"
        action={
          <button
            onClick={() => {
              resetSettings();
              toast.success("تمت استعادة الإعدادات الافتراضية");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-destructive hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            استعادة الافتراضي
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme */}
        <Card title="المظهر" icon={Palette}>
          <Field label="السمة">
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = settings.theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSetting("theme", opt.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-bold transition ${
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Toggle
            label="حركات مخفّفة"
            desc="تقليل الحركات والانتقالات"
            checked={settings.reducedMotion}
            onChange={(v) => setSetting("reducedMotion", v)}
          />
          <Toggle
            label="إظهار شريط الوضع التجريبي"
            desc="الشريط السفلي للتنبيه بأن البيانات وهمية"
            checked={settings.showDemoBanner}
            onChange={(v) => setSetting("showDemoBanner", v)}
          />
        </Card>

        {/* Typography */}
        <Card title="الخطوط والحجم" icon={Type}>
          <Field label="نوع الخط">
            <div className="grid gap-2">
              {FONT_OPTIONS.map((opt) => {
                const active = settings.fontFamily === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSetting("fontFamily", opt.value)}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm transition ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-muted-foreground">{opt.sample}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="حجم الخط">
            <div className="grid grid-cols-4 gap-2">
              {SIZE_OPTIONS.map((opt) => {
                const active = settings.fontSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSetting("fontSize", opt.value)}
                    className={`rounded-xl border-2 py-2.5 text-xs font-bold transition ${
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </Card>

        {/* Layout */}
        <Card title="التخطيط" icon={Monitor}>
          <Field label="عرض المحتوى">
            <div className="space-y-2">
              {LAYOUT_OPTIONS.map((opt) => {
                const active = settings.layout === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSetting("layout", opt.value)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-right transition ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-ink">{opt.label}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{opt.desc}</div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        active ? "border-primary bg-primary" : "border-border"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="الكثافة">
            <div className="grid grid-cols-2 gap-2">
              {(["comfortable", "compact"] as const).map((v) => {
                const active = settings.density === v;
                return (
                  <button
                    key={v}
                    onClick={() => setSetting("density", v)}
                    className={`rounded-xl border-2 py-2.5 text-xs font-bold transition ${
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {v === "comfortable" ? "مريحة" : "مدمجة"}
                  </button>
                );
              })}
            </div>
          </Field>
        </Card>

        {/* Role-specific */}
        <Card title={`تفضيلات ${roleLabel(role)}`} icon={Palette}>
          {role === "owner" && (
            <>
              <Toggle
                label="تذكير الدفعات"
                desc="إظهار تنبيه عند وجود دفعة مستحقة"
                checked={!!rolePrefs.showPaymentReminders}
                onChange={(v) => setRolePref(role, "showPaymentReminders", v)}
              />
              <Toggle
                label="تنبيهات حالة المشاريع"
                desc="عند تحديث حالة أي مشروع"
                checked={!!rolePrefs.showProjectAlerts}
                onChange={(v) => setRolePref(role, "showProjectAlerts", v)}
              />
            </>
          )}
          {role === "contractor" && (
            <>
              <Toggle
                label="تنبيهات السحوبات"
                desc="عند اعتماد أو رفض طلب سحب"
                checked={!!rolePrefs.showWithdrawalAlerts}
                onChange={(v) => setRolePref(role, "showWithdrawalAlerts", v)}
              />
              <Field label="عرض المراحل الافتراضي">
                <div className="grid grid-cols-2 gap-2">
                  {(["list", "kanban"] as const).map((v) => {
                    const active = (rolePrefs.defaultPhaseView ?? "list") === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setRolePref(role, "defaultPhaseView", v)}
                        className={`rounded-xl border-2 py-2.5 text-xs font-bold transition ${
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        {v === "list" ? "قائمة" : "Kanban"}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}
          {role === "supervisor" && (
            <>
              <Toggle
                label="اعتماد تلقائي للتقارير الصغيرة"
                desc="اعتماد التقارير اليومية بدون مراجعة يدوية"
                checked={!!rolePrefs.autoApproveMinor}
                onChange={(v) => setRolePref(role, "autoApproveMinor", v)}
              />
              <Toggle
                label="إظهار موقع الفريق الميداني"
                desc="عرض خريطة لموقع المهندسين"
                checked={!!rolePrefs.showFieldTeamLocation}
                onChange={(v) => setRolePref(role, "showFieldTeamLocation", v)}
              />
            </>
          )}
          {role === "field" && (
            <>
              <Toggle
                label="تذكير برفع التقارير"
                desc="إشعار يومي عند نهاية الدوام"
                checked={!!rolePrefs.reportReminders}
                onChange={(v) => setRolePref(role, "reportReminders", v)}
              />
              <Toggle
                label="الوضع غير المتصل"
                desc="حفظ التقارير محلياً ورفعها لاحقاً"
                checked={!!rolePrefs.offlineMode}
                onChange={(v) => setRolePref(role, "offlineMode", v)}
              />
            </>
          )}
          {role === "admin" && (
            <>
              <Toggle
                label="إظهار ودجت الإيرادات"
                desc="بطاقة إيرادات المنصة في لوحة التحكم"
                checked={!!rolePrefs.showRevenueWidget}
                onChange={(v) => setRolePref(role, "showRevenueWidget", v)}
              />
              <Toggle
                label="مراقبة صحة النظام"
                desc="عرض حالة الخدمات والـ API"
                checked={!!rolePrefs.showSystemHealth}
                onChange={(v) => setRolePref(role, "showSystemHealth", v)}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}

function roleLabel(role: Role): string {
  return {
    owner: "العميل",
    contractor: "المقاول",
    supervisor: "المهندس المشرف",
    field: "المهندس الميداني",
    admin: "الإدارة",
  }[role];
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Sun;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-extrabold text-ink">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-background p-3">
      <div className="min-w-0">
        <div className="text-sm font-bold text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-primary" : "bg-muted"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "right-0.5" : "right-[22px]"
          }`}
        />
      </button>
    </label>
  );
}
