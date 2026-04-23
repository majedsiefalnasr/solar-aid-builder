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
  hours: number;
  nightHours: number;
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
  // Total operating hours per day (a + b in the spec)
  dayHours: number;
  // Of which night hours (c)
  nightHours: number;
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
  city: "عدن",
  battery: "lithium",
  autonomy: 2,
  mode: "loads",
  bill: {
    kWh15Days: 450,
    dayHours: 14, // إجمالي عدد الساعات في اليوم
    nightHours: 6, // منها ساعات ليلية
  },
  devices: [
    {
      id: "preset-fridge",
      category: "fridges",
      label: "ثلاجة 10 قدم",
      watts: 150,
      qty: 1,
      hours: 10,
      nightHours: 2,
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
const PANEL_W = 550;
const SUN_HOURS = 5.5;
const SYSTEM_LOSS = 0.7;
const BATTERY_VOLT = 48;
const DOD_LITHIUM = 0.9;
const DOD_GEL = 0.5;

export function calculate(s: CalcState): CalcResult {
  if (s.mode === "bill") {
    return calculateBill(s);
  }
  return calculateLoads(s);
}

function calculateBill(s: CalcState): CalcResult {
  const kWh = Math.max(0, s.bill.kWh15Days);          // a
  const totalHours = Math.max(1, s.bill.dayHours);     // b — إجمالي ساعات اليوم
  const nightHours = Math.max(0, Math.min(totalHours, s.bill.nightHours)); // c

  // d. الحمل في الساعة (kW/h) = a / 15 / b
  const hourlyLoadKW = kWh / BILL_DAYS / totalHours;

  // e. الحمل الليلي (سعة البطارية) = round(c * d * 1.2)
  const batteryKWh = Math.round(nightHours * hourlyLoadKW * BILL_NIGHT_BUFFER);

  // f1. الألواح لتعبئة البطارية = ceil(e * 1000 / 5 / 650)
  const panelsForBattery = Math.ceil((batteryKWh * 1000) / BILL_SUN_HOURS / BILL_PANEL_W);
  // f2. الألواح للاستخدام النهاري = ceil(d * 1000 / 650)
  const panelsForDay = Math.ceil((hourlyLoadKW * 1000) / BILL_PANEL_W);
  const panelCount = Math.max(1, panelsForBattery + panelsForDay);

  // g. الإنفرتر = max(e/5, d) — kW
  const inverterKW = Math.max(batteryKWh / BILL_SUN_HOURS, hourlyLoadKW);
  const inverterKVA = round(Math.max(1, inverterKW), 2);

  // Daily energy (لعرضه فقط)
  const totalDailyKWh = kWh / BILL_DAYS;
  const nightKWh = nightHours * hourlyLoadKW;

  const panelKWp = round((panelCount * BILL_PANEL_W) / 1000, 2);
  const dod = s.battery === "lithium" ? DOD_LITHIUM : DOD_GEL;
  // For bill mode, the spec already returns the usable battery size (kWh).
  // Compute Ah from that usable size, applying DoD only for the nominal capacity disclosure.
  const batteryAh = Math.round((batteryKWh / dod * 1000) / BATTERY_VOLT);
  const surgeKVA = round(inverterKVA * 0.33, 2);

  const totalSAR =
    panelCount * 600 + batteryKWh * 1500 + inverterKVA * 800 + 1500;

  return {
    totalDailyKWh: round(totalDailyKWh, 2),
    nightKWh: round(nightKWh, 2),
    panelCount,
    panelKWp,
    batteryKWh,
    batteryAh,
    inverterKVA,
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
  const totalDailyWh = s.devices.reduce(
    (acc, d) => acc + d.watts * d.qty * d.hours,
    0,
  );
  const nightWh = s.devices.reduce(
    (acc, d) => acc + d.watts * d.qty * d.nightHours,
    0,
  );
  const maxLoadW = s.devices.reduce((acc, d) => acc + d.watts * d.qty, 0);
  const totalDailyKWh = totalDailyWh / 1000;
  const nightKWh = nightWh / 1000;

  const panelKWp = (totalDailyKWh / SUN_HOURS) / SYSTEM_LOSS;
  const panelCount = Math.max(1, Math.ceil((panelKWp * 1000) / PANEL_W));

  const dod = s.battery === "lithium" ? DOD_LITHIUM : DOD_GEL;
  const usableNeededKWh = nightKWh * (s.autonomy || 0.5);
  const batteryKWh = usableNeededKWh / dod;
  const batteryAh = (batteryKWh * 1000) / BATTERY_VOLT;

  const maxLoadKW = maxLoadW / 1000;
  const inverterKVA = Math.max(1, Math.ceil(maxLoadKW * 1.25 * 10) / 10);
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

function round(n: number, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
