import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Banknote,
  Upload,
  CheckCircle2,
  User,
  UserPlus,
  ShoppingBag,
  Printer,
  Download,
  Sun,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { Steps } from "./cart";
import { readProductCart, cartTotal, type ProductCartLine } from "@/lib/cart-store";
import { products } from "@/lib/products";
import { arabicNumber } from "@/components/calculator-shell";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | تم" },
      { name: "description", content: "أكمل بياناتك واختر طريقة الدفع." },
    ],
  }),
  component: CheckoutPage,
});

interface SolarPayload {
  state: { city?: string; battery?: string; autonomy?: number };
  result: {
    panelKWp: number;
    batteryKWh: number;
    panelCount: number;
    inverterKVA: number;
    totalSAR: number;
  };
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<1 | 2>(1);
  const [authMode, setAuthMode] = useState<"guest" | "login" | "register">("guest");
  const [pay, setPay] = useState<"bank" | "card">("bank");
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [lines, setLines] = useState<ProductCartLine[]>([]);
  const [solar, setSolar] = useState<SolarPayload | null>(null);

  useEffect(() => {
    setLines(readProductCart());
    try {
      const raw = localStorage.getItem("mutajadidah:cart:v1");
      setSolar(raw ? JSON.parse(raw) : null);
    } catch {
      setSolar(null);
    }
  }, []);

  const productsTotal = useMemo(() => cartTotal(lines, products), [lines]);
  const solarTotal = solar?.result.totalSAR ?? 0;
  const grandTotal = productsTotal + solarTotal;

  const handleConfirm = () => {
    const num = `TM-${Date.now().toString().slice(-8)}`;
    setOrderNumber(num);
    setDone(true);
  };

  if (done) {
    return (
      <OrderSuccess
        orderNumber={orderNumber}
        customer={customer}
        lines={lines}
        solar={solar}
        productsTotal={productsTotal}
        solarTotal={solarTotal}
        grandTotal={grandTotal}
        payMethod={pay}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <Steps current={stage as 1 | 2} />

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-10">
          {stage === 1 ? (
            <>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">بياناتك</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                أكمل طلبك بسرعة كزائر، أو سجّل دخولك للاستفادة من حفظ طلباتك.
              </p>

              {/* Auth toggle */}
              <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1.5">
                <ModeBtn
                  active={authMode === "guest"}
                  onClick={() => setAuthMode("guest")}
                  icon={<ShoppingBag className="h-4 w-4" />}
                >
                  شراء كزائر
                </ModeBtn>
                <ModeBtn
                  active={authMode === "login"}
                  onClick={() => setAuthMode("login")}
                  icon={<User className="h-4 w-4" />}
                >
                  تسجيل الدخول
                </ModeBtn>
                <ModeBtn
                  active={authMode === "register"}
                  onClick={() => setAuthMode("register")}
                  icon={<UserPlus className="h-4 w-4" />}
                >
                  إنشاء حساب
                </ModeBtn>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {authMode === "guest" && (
                  <>
                    <Field
                      label="الاسم"
                      placeholder="أحمد محمد"
                      value={customer.name}
                      onChange={(v) => setCustomer({ ...customer, name: v })}
                    />
                    <Field
                      label="رقم الجوال"
                      placeholder="+967 7XX XXX XXX"
                      type="tel"
                      value={customer.phone}
                      onChange={(v) => setCustomer({ ...customer, phone: v })}
                    />
                    <Field
                      label="العنوان"
                      placeholder="المدينة، الحي، الشارع"
                      full
                      value={customer.address}
                      onChange={(v) => setCustomer({ ...customer, address: v })}
                    />
                    <Field
                      label="ملاحظات"
                      placeholder="أي تفاصيل إضافية تساعدنا في تجهيز طلبك"
                      full
                      textarea
                      value={customer.notes}
                      onChange={(v) => setCustomer({ ...customer, notes: v })}
                    />
                  </>
                )}
                {authMode === "login" && (
                  <>
                    <Field label="البريد الإلكتروني" placeholder="you@example.com" type="email" full />
                    <Field label="كلمة المرور" placeholder="••••••••" type="password" full />
                  </>
                )}
                {authMode === "register" && (
                  <>
                    <Field label="الاسم الكامل" placeholder="أحمد محمد" />
                    <Field label="رقم الجوال" placeholder="+967 7XX XXX XXX" type="tel" />
                    <Field label="البريد الإلكتروني" placeholder="you@example.com" type="email" />
                    <Field label="كلمة المرور" placeholder="••••••••" type="password" />
                    <Field
                      label="عنوان التركيب"
                      placeholder="المدينة، الحي، الشارع"
                      full
                    />
                  </>
                )}
              </div>

              <hr className="my-7 border-border" />

              <div className="flex items-center justify-between" dir="ltr">
                <button
                  onClick={() => setStage(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                  dir="rtl"
                >
                  متابعة للدفع
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate({ to: "/cart" })}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                  dir="rtl"
                >
                  <ArrowRight className="h-4 w-4" />
                  العودة للسلة
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">طريقة الدفع</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                اختر الطريقة المناسبة لإتمام عملية الشراء.
              </p>

              <div className="mt-6 grid gap-3">
                <PayOption
                  selected={pay === "bank"}
                  onClick={() => setPay("bank")}
                  icon={<Banknote className="h-5 w-5" />}
                  title="تحويل بنكي"
                  desc="حوّل المبلغ وارفع صورة الإيصال للتأكيد السريع."
                />
                <PayOption
                  selected={pay === "card"}
                  onClick={() => setPay("card")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="بطاقة بنكية"
                  desc="فيزا، ماستركارد، مدى — دفع آمن ومشفر."
                />
              </div>

              {pay === "bank" ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-muted p-4 text-sm">
                    <div className="font-bold text-ink">تفاصيل التحويل</div>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <div>البنك: البنك الأهلي السعودي</div>
                      <div>اسم الحساب: شركة تم للطاقة</div>
                      <div>IBAN: SA00 0000 0000 0000 0000 0000</div>
                    </div>
                  </div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background py-8 text-center transition hover:border-primary">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm font-bold text-ink">رفع صورة الإيصال</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      PNG أو JPG حتى 5MB
                    </span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="رقم البطاقة" placeholder="0000 0000 0000 0000" full />
                  <Field label="اسم حامل البطاقة" placeholder="ahmed mohammed" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="MM/YY" placeholder="08/29" />
                    <Field label="CVV" placeholder="•••" />
                  </div>
                </div>
              )}

              <hr className="my-7 border-border" />

              <div className="flex items-center justify-between" dir="ltr">
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95"
                  dir="rtl"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تأكيد الطلب
                </button>
                <button
                  onClick={() => setStage(1)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  dir="rtl"
                >
                  <ArrowRight className="h-4 w-4" />
                  السابق
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  full,
  textarea,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  full?: boolean;
  textarea?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold text-ink">{label}</span>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
      )}
    </label>
  );
}

function PayOption({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-right transition ${
        selected
          ? "border-primary bg-primary-soft/50"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-extrabold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}

function OrderSuccess({
  orderNumber,
  customer,
  lines,
  solar,
  productsTotal,
  solarTotal,
  grandTotal,
  payMethod,
}: {
  orderNumber: string;
  customer: CustomerInfo;
  lines: ProductCartLine[];
  solar: SolarPayload | null;
  productsTotal: number;
  solarTotal: number;
  grandTotal: number;
  payMethod: "bank" | "card";
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const orderDate = useMemo(
    () => new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
    []
  );

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: `${orderNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(printRef.current)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
      <div className="no-print">
        <SiteNav />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        {/* Action bar */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تم استلام طلبك
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-cta transition hover:bg-primary/95 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "جارٍ التحميل..." : "تحميل PDF"}
            </button>
          </div>
        </div>

        {/* Printable receipt */}
        <div
          ref={printRef}
          dir="rtl"
          className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-10"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="text-2xl font-extrabold text-primary">تَم</div>
              <div className="mt-1 text-xs text-muted-foreground">شركة تم للطاقة والبناء</div>
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">رقم الطلب</div>
              <div className="text-base font-extrabold text-ink" dir="ltr">
                {orderNumber}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{orderDate}</div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-3 text-xl font-extrabold text-ink md:text-2xl">
              تم استلام طلبك بنجاح
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              سيتواصل معك فريق تم خلال 24 ساعة لتأكيد الطلب وجدولة التسليم.
            </p>
          </div>

          {/* Customer info */}
          <div className="mt-6 rounded-2xl bg-muted p-4">
            <div className="mb-2 text-xs font-extrabold text-ink">بيانات العميل</div>
            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
              <InfoRow label="الاسم" value={customer.name || "—"} />
              <InfoRow label="رقم الجوال" value={customer.phone || "—"} />
              <InfoRow label="العنوان" value={customer.address || "—"} full />
              {customer.notes && <InfoRow label="ملاحظات" value={customer.notes} full />}
              <InfoRow
                label="طريقة الدفع"
                value={payMethod === "bank" ? "تحويل بنكي" : "بطاقة بنكية"}
              />
            </div>
          </div>

          {/* Items table */}
          <div className="mt-6">
            <div className="mb-2 text-xs font-extrabold text-ink">المنتجات المطلوبة</div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-right text-xs">
                <thead className="bg-muted text-ink">
                  <tr>
                    <th className="px-3 py-2 font-bold">#</th>
                    <th className="px-3 py-2 font-bold">المنتج</th>
                    <th className="px-3 py-2 font-bold">الكمية</th>
                    <th className="px-3 py-2 font-bold">السعر</th>
                    <th className="px-3 py-2 font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {solar && (
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">1</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-primary" />
                          <span className="font-bold text-ink">
                            نظام شمسي {solar.result.panelKWp} kWp · {solar.result.batteryKWh} kWh
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {arabicNumber(solar.result.panelCount)} لوح · إنفرتر{" "}
                          {solar.result.inverterKVA} kVA
                        </div>
                      </td>
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2" dir="ltr">
                        {solar.result.totalSAR.toLocaleString("en-US")}
                      </td>
                      <td className="px-3 py-2 font-bold text-ink" dir="ltr">
                        {solar.result.totalSAR.toLocaleString("en-US")}
                      </td>
                    </tr>
                  )}
                  {lines.map((line, i) => {
                    const p = products.find((x) => x.id === line.productId);
                    if (!p) return null;
                    const lineTotal = p.price * line.qty;
                    return (
                      <tr key={line.productId} className="border-t border-border">
                        <td className="px-3 py-2 text-muted-foreground">
                          {i + (solar ? 2 : 1)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-bold text-ink">{p.name}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {p.brand}
                          </div>
                        </td>
                        <td className="px-3 py-2">{line.qty}</td>
                        <td className="px-3 py-2" dir="ltr">
                          {p.price.toLocaleString("en-US")}
                        </td>
                        <td className="px-3 py-2 font-bold text-ink" dir="ltr">
                          {lineTotal.toLocaleString("en-US")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-5 ml-auto max-w-xs space-y-1.5 text-xs">
            {solar && (
              <TotalRow label="نظام الطاقة" value={`${solarTotal.toLocaleString("en-US")} ر.س`} />
            )}
            {lines.length > 0 && (
              <TotalRow
                label={`المنتجات (${lines.length})`}
                value={`${productsTotal.toLocaleString("en-US")} ر.س`}
              />
            )}
            <TotalRow label="الشحن" value="مجاني" />
            <div className="my-2 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-ink">الإجمالي</span>
              <span className="text-lg font-extrabold text-primary" dir="ltr">
                {grandTotal.toLocaleString("en-US")} ر.س
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
            شكراً لاختياركم تَم — لأي استفسار: support@tamm.online
          </div>
        </div>

        <div className="no-print mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
          >
            العودة للرئيسية
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <div className="no-print">
        <SiteFooter />
      </div>
    </div>
  );
}

function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-ink" dir="ltr">
        {value}
      </span>
    </div>
  );
}
