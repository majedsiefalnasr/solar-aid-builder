// Shared types and storage for the solar calculator wizard.
// State persists across steps via localStorage so users don't lose progress.

export type BatteryType = "lithium" | "gel";
export type Autonomy = 0 | 1 | 2 | 3;
export type CalcMode = "loads" | "bill";

export interface Device {
  id: string;
  category: DeviceCategory;
  label: string;
  watts: number;
  qty: number;
  /** وقت بدء التشغيل بصيغة HH:mm */
  startTime: string;
  /** وقت انتهاء التشغيل بصيغة HH:mm */
  endTime: string;
}

export type DeviceCategory =
  | "fridges"
  | "ac"
  | "fans"
  | "lights"
  | "pumps"
  | "other";

export interface BillInput {
  // Total kWh consumed over the bill cycle (BILL_DAYS)
  kWh15Days: number;
  /** وقت بدء التشغيل بصيغة HH:mm */
  startTime: string;
  /** وقت انتهاء التشغيل بصيغة HH:mm */
  endTime: string;
}

export interface CalcState {
  city: string;
  battery: BatteryType;
  autonomy: Autonomy;
  mode: CalcMode;
  devices: Device[];
  bill: BillInput;
}

export const defaultState: CalcState = {
  city: "تعز",
  battery: "lithium",
  autonomy: 1,
  mode: "loads",
  bill: {
    kWh15Days: 450,
    startTime: "08:00",
    endTime: "22:00",
  },
  devices: [
    {
      id: "preset-fridge",
      category: "fridges",
      label: "ثلاجة 10 قدم",
      watts: 150,
      qty: 1,
      startTime: "08:00",
      endTime: "18:00",
    },
  ],
};

const KEY = "mutajadidah:calc:v1";

export function loadState(): CalcState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(s: CalcState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const CITIES = ["عدن", "صنعاء", "تعز", "حضرموت", "المكلا", "إب"] as const;

export const FRIDGE_PRESETS = [
  { label: "ثلاجة 8 قدم", watts: 120 },
  { label: "ثلاجة 10 قدم", watts: 150 },
  { label: "ثلاجة 12 قدم", watts: 180 },
  { label: "ثلاجة 14 قدم", watts: 200 },
  { label: "ثلاجة 16 قدم", watts: 240 },
  { label: "ثلاجة 18 قدم", watts: 280 },
  { label: "ثلاجة 20-22 قدم", watts: 350 },
  { label: "ديب فريزر صغير", watts: 150 },
  { label: "ديب فريزر كبير", watts: 250 },
];

export const AC_PRESETS = [
  { label: "سبليت 9000", watts: 900 },
  { label: "سبليت 12000", watts: 1200 },
  { label: "سبليت 18000", watts: 1800 },
  { label: "سبليت 24000", watts: 2400 },
  { label: "شباك 12000", watts: 1400 },
  { label: "صحراوي", watts: 350 },
];

export const FAN_PRESETS = [
  { label: "مروحة سقف", watts: 75 },
  { label: "مروحة قائمة", watts: 60 },
  { label: "شفاط", watts: 45 },
];

export const LIGHT_PRESETS = [
  { label: "لمبة LED 9W", watts: 9 },
  { label: "لمبة LED 15W", watts: 15 },
  { label: "كشاف 30W", watts: 30 },
];

export const PUMP_PRESETS = [
  { label: "مضخة 0.5 HP", watts: 370 },
  { label: "مضخة 1 HP", watts: 750 },
  { label: "مضخة 1.5 HP", watts: 1100 },
];

// ---------- Calculation engine ----------
export interface CalcResult {
  totalDailyKWh: number;
  nightKWh: number;
  panelCount: number;
  panelKWp: number;
  batteryKWh: number;
  batteryAh: number;
  inverterKVA: number;
  maxLoadKW: number;
  surgeKVA: number;
  totalSAR: number;
  // Bill-mode breakdown (للعرض التفصيلي في صفحة النتائج)
  billBreakdown?: {
    hourlyLoadKW: number;     // d
    nightLoadKW: number;      // e (battery size, kWh)
    panelsForBattery: number; // f1
    panelsForDay: number;     // f2
  };
}

// Bill-mode constants per spec
const BILL_DAYS = 15;
const BILL_PANEL_W = 650;        // solar board (watt) for bill mode
const BILL_SUN_HOURS = 5;        // hours of sun
const BILL_NIGHT_BUFFER = 1.2;   // +20% safety on night load

// Loads-mode constants
const PANEL_W = 650;
const SUN_HOURS = 5.5;
const NIGHT_BUFFER = 1.2;

// متوسط ساعات ذروة الإشعاع الشمسي لكل مدينة (ساعة/يوم)
const CITY_SUN_HOURS: Record<string, number> = {
  "عدن": 6,
  "صنعاء": 5.8,
  "تعز": 5.7,
  "حضرموت": 6.2,
  "المكلا": 6,
  "إب": 5.5,
};

function sunHoursFor(city: string): number {
  return CITY_SUN_HOURS[city] ?? SUN_HOURS;
}
const SYSTEM_LOSS = 0.7;
const BATTERY_VOLT = 48;
const DOD_LITHIUM = 0.9;
const DOD_GEL = 0.5;

/**
 * تحويل وقت بصيغة HH:mm إلى عدد الدقائق منذ منتصف الليل.
 */
function parseHM(t: string): number {
  if (!t || typeof t !== "string") return 0;
  const [h, m] = t.split(":").map((x) => Number(x) || 0);
  return Math.max(0, Math.min(23, h)) * 60 + Math.max(0, Math.min(59, m));
}

/**
 * الساعات الليلية = من 16:00 إلى 07:59 (شاملة).
 * يعني: الدقيقة ليلية إذا كانت >= 16:00 أو < 08:00.
 */
function isNightMinute(minuteOfDay: number): boolean {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  return m >= 16 * 60 || m < 8 * 60;
}

/**
 * يحسب إجمالي وعدد ساعات التشغيل النهارية والليلية بين وقتَي البدء والانتهاء.
 * - النهار: من 08:00 إلى 15:59
 * - الليل: من 16:00 إلى 07:59 (يلتف لليوم التالي)
 */
export function computeHours(
  start: string,
  end: string,
): { total: number; night: number; day: number } {
  const s = parseHM(start);
  let e = parseHM(end);
  if (e === s) return { total: 0, night: 0, day: 0 };
  if (e < s) e += 1440; // امتداد لليوم التالي
  let nightMin = 0;
  for (let m = s; m < e; m++) {
    if (isNightMinute(m)) nightMin++;
  }
  const totalMin = e - s;
  return {
    total: totalMin / 60,
    night: nightMin / 60,
    day: (totalMin - nightMin) / 60,
  };
}

export function calculate(s: CalcState): CalcResult {
  if (s.mode === "bill") {
    return calculateBill(s);
  }
  return calculateLoads(s);
}

function calculateBill(s: CalcState): CalcResult {
  const kWh = Math.max(0, s.bill.kWh15Days);          // a
  const { total: totalHoursRaw, night: nightHoursRaw } = computeHours(
    s.bill.startTime,
    s.bill.endTime,
  );
  const totalHours = Math.max(1, totalHoursRaw);
  const nightHours = Math.max(0, Math.min(totalHours, nightHoursRaw));
  const hasBatteries = (s.autonomy ?? 0) > 0;

  // d. الحمل في الساعة (kW/h) = a / 15 / b
  const hourlyLoadKW = kWh / BILL_DAYS / totalHours;

  // الحمل النهاري (وات لحظي) = d * 1000
  const dayLoadW = hourlyLoadKW * 1000;
  // الحمل الليلي (Wh) = c * d * 1000
  const nightWh = nightHours * hourlyLoadKW * 1000;

  // e. سعة البطارية بالـ kWh — فقط إذا تم اختيار التخزين
  const batteryKWh = hasBatteries
    ? Math.round(nightHours * hourlyLoadKW * BILL_NIGHT_BUFFER)
    : 0;

  // عدد الألواح = ((الحمل الليلي بالوات × 1.2 / ساعات ذروة الإشعاع للمدينة) + الحمل النهاري بالوات) / 650
  // ثم يُقرّب إلى أعلى عدد زوجي
  const peakSun = sunHoursFor(s.city);
  const rawPanels = Math.max(
    1,
    ((nightWh * BILL_NIGHT_BUFFER) / peakSun + dayLoadW) / BILL_PANEL_W,
  );
  const panelCount = roundUpToEven(rawPanels);
  const panelsForBattery = hasBatteries
    ? Math.ceil((nightWh * BILL_NIGHT_BUFFER) / peakSun / BILL_PANEL_W)
    : 0;
  const panelsForDay = Math.max(0, panelCount - panelsForBattery);

  // قدرة الإنفرتر = Max(الحمل النهاري × 1.5، الحمل الليلي / ساعات ذروة الإشعاع)
  // ثم تُقرَّب لأعلى عدد صحيح
  const panelKWp = (panelCount * BILL_PANEL_W) / 1000;
  const inverterRawW = Math.max(dayLoadW * 1.5, nightWh / peakSun);
  const inverterKW = inverterRawW / 1000;
  const inverterKVA = Math.max(1, Math.ceil(inverterKW));

  // Daily energy (لعرضه فقط)
  const totalDailyKWh = kWh / BILL_DAYS;
  const nightKWh = nightHours * hourlyLoadKW;

  const dod = s.battery === "lithium" ? DOD_LITHIUM : DOD_GEL;
  // For bill mode, the spec already returns the usable battery size (kWh).
  const batteryAh = hasBatteries
    ? Math.round((batteryKWh / dod * 1000) / BATTERY_VOLT)
    : 0;
  const surgeKVA = round(inverterKVA * 0.33, 2);

  const totalSAR =
    panelCount * 600 + batteryKWh * 1500 + inverterKVA * 800 + 1500;

  return {
    totalDailyKWh: round(totalDailyKWh, 2),
    nightKWh: round(nightKWh, 2),
    panelCount,
    panelKWp: round(panelKWp, 2),
    batteryKWh,
    batteryAh,
    inverterKVA: round(inverterKVA, 2),
    maxLoadKW: round(inverterKW, 2),
    surgeKVA,
    totalSAR: Math.round(totalSAR),
    billBreakdown: {
      hourlyLoadKW: round(hourlyLoadKW, 2),
      nightLoadKW: batteryKWh,
      panelsForBattery,
      panelsForDay,
    },
  };
}

function calculateLoads(s: CalcState): CalcResult {
  // نحسب لكل جهاز ساعات النهار/الليل من بين وقت البدء والانتهاء
  const perDevice = s.devices.map((d) => {
    const h = computeHours(d.startTime, d.endTime);
    return { d, ...h };
  });

  // الحمل النهاري = قدرة الجهاز × العدد (بدون عدد الساعات) — قدرة لحظية بالوات
  // فقط للأجهزة التي تعمل خلال ساعات النهار
  const dayLoadW = perDevice.reduce(
    (acc, x) => acc + (x.day > 0 ? x.d.watts * x.d.qty : 0),
    0,
  );
  // الحمل الليلي = قدرة الجهاز × العدد × عدد ساعات الليل — طاقة بالـ Wh
  const nightWh = perDevice.reduce(
    (acc, x) => acc + x.d.watts * x.d.qty * x.night,
    0,
  );
  const maxLoadW = dayLoadW;
  const dayLoadKW = dayLoadW / 1000;
  const nightKWh = nightWh / 1000;
  const hasBatteries = (s.autonomy ?? 0) > 0;

  // عرض إجمالي الطاقة اليومية التقريبية (نهار + ليل) للمستخدم فقط
  const totalDailyKWh =
    perDevice.reduce((acc, x) => acc + x.d.watts * x.d.qty * x.total, 0) / 1000;

  const dod = s.battery === "lithium" ? DOD_LITHIUM : DOD_GEL;
  // سعة البطارية لتغطية الحمل الليلي بالكامل (مع DoD)
  const batteryKWh = hasBatteries ? nightKWh / dod : 0;
  const batteryAh = hasBatteries ? (batteryKWh * 1000) / BATTERY_VOLT : 0;

  // عدد الألواح = ((الحمل الليلي بالوات × 1.2 / ساعات ذروة الإشعاع للمدينة) + الحمل النهاري بالوات) / 650
  // ثم يُقرّب إلى العدد الزوجي التالي (مثلاً 2.5 → 4)
  const peakSun = sunHoursFor(s.city);
  const rawPanels = Math.max(
    1,
    ((nightWh * NIGHT_BUFFER) / peakSun + dayLoadW) / PANEL_W,
  );
  const panelCount = roundUpToEven(rawPanels);
  const panelKWp = (panelCount * PANEL_W) / 1000;

  const maxLoadKW = maxLoadW / 1000;
  // قدرة الإنفرتر = Max(الحمل النهاري × 1.5، الحمل الليلي / ساعات ذروة الإشعاع)
  // ثم تُقرَّب لأعلى عدد صحيح
  const inverterRawW = Math.max(dayLoadW * 1.5, nightWh / peakSun);
  const inverterKVA = Math.max(1, Math.ceil(inverterRawW / 1000));
  const surgeKVA = Math.round(inverterKVA * 0.33 * 100) / 100;

  const totalSAR =
    panelCount * 600 + batteryKWh * 1500 + inverterKVA * 800 + 1500;

  return {
    totalDailyKWh: round(totalDailyKWh, 2),
    nightKWh: round(nightKWh, 2),
    panelCount,
    panelKWp: round(panelKWp, 2),
    batteryKWh: round(batteryKWh, 2),
    batteryAh: Math.round(batteryAh),
    inverterKVA: round(inverterKVA, 2),
    maxLoadKW: round(maxLoadKW, 2),
    surgeKVA,
    totalSAR: Math.round(totalSAR),
  };
}

function roundUpToEven(n: number): number {
  const ceiled = Math.ceil(n);
  return ceiled % 2 === 0 ? ceiled : ceiled + 1;
}

function round(n: number, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
