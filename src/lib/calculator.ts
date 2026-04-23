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
  // Total kWh consumed over a 15-day commercial bill cycle
  kWh15Days: number;
  dayHours: number;
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
    dayHours: 10,
    nightHours: 6,
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
}

const PANEL_W = 550; // single panel rated power
const SUN_HOURS = 5.5; // average peak sun hours (Yemen)
const SYSTEM_LOSS = 0.7; // 30% losses
const BATTERY_VOLT = 48;
const DOD_LITHIUM = 0.9;
const DOD_GEL = 0.5;

export function calculate(s: CalcState): CalcResult {
  let totalDailyKWh: number;
  let nightKWh: number;
  let maxLoadW: number;

  if (s.mode === "bill") {
    // Daily consumption averaged over 15 days
    totalDailyKWh = s.bill.kWh15Days / 15;
    const totalHours = Math.max(1, s.bill.dayHours + s.bill.nightHours);
    nightKWh = totalDailyKWh * (s.bill.nightHours / totalHours);
    // Approx max simultaneous load: distribute daily energy over operating hours
    maxLoadW = (totalDailyKWh * 1000) / totalHours;
  } else {
    const totalDailyWh = s.devices.reduce(
      (acc, d) => acc + d.watts * d.qty * d.hours,
      0,
    );
    const nightWh = s.devices.reduce(
      (acc, d) => acc + d.watts * d.qty * d.nightHours,
      0,
    );
    maxLoadW = s.devices.reduce((acc, d) => acc + d.watts * d.qty, 0);
    totalDailyKWh = totalDailyWh / 1000;
    nightKWh = nightWh / 1000;
  }

  const panelKWp = (totalDailyKWh / SUN_HOURS) / SYSTEM_LOSS;
  const panelCount = Math.max(1, Math.ceil((panelKWp * 1000) / PANEL_W));

  const dod = s.battery === "lithium" ? DOD_LITHIUM : DOD_GEL;
  const usableNeededKWh = nightKWh * (s.autonomy || 0.5);
  const batteryKWh = usableNeededKWh / dod;
  const batteryAh = (batteryKWh * 1000) / BATTERY_VOLT;

  const maxLoadKW = maxLoadW / 1000;
  const inverterKVA = Math.max(1, Math.ceil(maxLoadKW * 1.25 * 10) / 10);
  const surgeKVA = Math.round(inverterKVA * 0.33 * 100) / 100;

  // Rough pricing (SAR): panels 600/each, battery 1500/kWh, inverter 800/kVA, install 1500
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
