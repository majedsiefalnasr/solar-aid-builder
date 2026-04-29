// Pre-built solar packages. Each package is sized from a "15-day commercial bill"
// (kWh) using the same logic as the bill-mode solar calculator (see calculator.ts).
//
// Sizing assumptions (mirror bill-mode in src/lib/calculator.ts):
//   - 15-day cycle, dayHours = 14, nightHours = 6 (typical residential)
//   - Panels: 650 W modules, 5 sun-hours/day, rounded UP to nearest EVEN number
//   - Battery (LiFePO4 48V, DOD 0.9): night load × 1.2 safety
//   - Inverter (kVA): max(panel kWp, hourly load) rounded UP to next integer,
//     and strictly greater than total panel kWp
//   - Cost (SAR): panels×600 + battery_kWh×1500 + inverter_kVA×800 + 1500 install

import type { CalcResult, CalcState } from "./calculator";

export type PackageGroup = "homes" | "buildings" | "influencers";

export interface SolarPackage {
  id: string;
  group: PackageGroup;
  name: string;
  subtitle: string;
  kWh15Days: number; // commercial bill over 15 days
  appliances?: string[]; // appliances that can be powered by this package
  comingSoon?: boolean;
}

const HOMES: SolarPackage[] = [
  {
    id: "home-small",
    group: "homes",
    name: "حزمة شقة صغيرة",
    subtitle: "تستهلك حتى 140 kWh كل 30 يوم",
    kWh15Days: 70,
    appliances: [
      "إضاءة: 17 لمبة",
      "ثلاجة إنفرتر (و)",
      "شاشة 24 بوصة",
      "4 مراوح (24V)",
      "غسالة 7 كيلو",
      "خلاط",
      "مودم (راوتر)",
    ],
  },
  {
    id: "home-medium",
    group: "homes",
    name: "حزمة شقة متوسطة",
    subtitle: "تستهلك حتى 300 kWh كل 30 يوم",
    kWh15Days: 150,
    appliances: [
      "إضاءة: 28 لمبة",
      "ثلاجة إنفرتر (و)",
      "شاشتان 32 بوصة",
      "6 مراوح (24V)",
      "غسالة 8 كيلو",
      "خلاط ومحضرة طعام",
      "مكيف صغير (تشغيل جزئي)",
      "مودم (راوتر)",
    ],
  },
  {
    id: "home-large",
    group: "homes",
    name: "حزمة شقة كبيرة",
    subtitle: "تستهلك حتى 420 kWh كل 30 يوم",
    kWh15Days: 210,
    appliances: [
      "إضاءة: 40 لمبة",
      "ثلاجة إنفرتر كبيرة + فريزر",
      "3 شاشات",
      "8 مراوح (24V)",
      "غسالة 10 كيلو",
      "خلاط وميكروويف",
      "مكيف (تشغيل جزئي)",
      "مودم (راوتر)",
    ],
  },
];

const BUILDINGS: SolarPackage[] = [
  {
    id: "bld-1f-2u",
    group: "buildings",
    name: "عمارة دور واحد · شقتان",
    subtitle: "استهلاك تقديري 320 kWh / 30 يوم",
    kWh15Days: 160,
    appliances: [
      "34 لمبة",
      "ثلاجتان إنفرتر",
      "شاشتان",
      "8 مراوح (24V)",
      "غسالتان وخلاطان",
      "مودم لكل شقة",
    ],
  },
  {
    id: "bld-2f-4u",
    group: "buildings",
    name: "عمارة دورين · 4 شقق",
    subtitle: "استهلاك تقديري 640 kWh / 30 يوم",
    kWh15Days: 320,
    appliances: [
      "68 لمبة",
      "4 ثلاجات إنفرتر",
      "4 شاشات",
      "16 مروحة (24V)",
      "4 غسالات و4 خلاطات",
      "مكيف صغير (تشغيل جزئي)",
      "مودم مركزي",
    ],
  },
  {
    id: "bld-3f-6u",
    group: "buildings",
    name: "عمارة 3 أدوار · 6 شقق",
    subtitle: "استهلاك تقديري 1038 kWh / 30 يوم",
    kWh15Days: 519,
    appliances: [
      "102 لمبة",
      "6 ثلاجات إنفرتر",
      "6 شاشات",
      "24 مروحة (24V)",
      "6 غسالات و6 خلاطات",
      "2 مكيف (تشغيل جزئي)",
      "مودم مركزي",
    ],
  },
  {
    id: "bld-4f-8u",
    group: "buildings",
    name: "عمارة 4 أدوار · 8 شقق",
    subtitle: "استهلاك تقديري 1280 kWh / 30 يوم",
    kWh15Days: 640,
    appliances: [
      "136 لمبة",
      "8 ثلاجات إنفرتر (متوسط)",
      "8 شاشات",
      "32 مروحة (24V)",
      "8 غسالات و8 خلاطات",
      "4 مكيفات (تشغيل جزئي)",
      "مودم مركزي",
    ],
  },
];

const INFLUENCERS: SolarPackage[] = [
  {
    id: "inf-naif",
    group: "influencers",
    name: "حزمة عمارة نايف الوافي",
    subtitle: "تشكيلة المؤثر — قريباً",
    kWh15Days: 0,
    comingSoon: true,
  },
  {
    id: "inf-rashad",
    group: "influencers",
    name: "حزمة عمارة رشاد السامعي",
    subtitle: "تشكيلة المؤثر — قريباً",
    kWh15Days: 0,
    comingSoon: true,
  },
  {
    id: "inf-taha",
    group: "influencers",
    name: "حزمة منزل طه صالح",
    subtitle: "تشكيلة المؤثر — قريباً",
    kWh15Days: 0,
    comingSoon: true,
  },
];

export const SOLAR_PACKAGES: SolarPackage[] = [...HOMES, ...BUILDINGS, ...INFLUENCERS];

export const PACKAGE_GROUPS: Array<{ id: PackageGroup; title: string; subtitle: string; items: SolarPackage[] }> = [
  {
    id: "homes",
    title: "حزم بحسب حجم بيتك",
    subtitle: "اختر الحزمة المناسبة لمساحة سكنك واستهلاكك اليومي.",
    items: HOMES,
  },
  {
    id: "buildings",
    title: "حزم العمائر السكنية",
    subtitle: "حلول جماعية للعمائر متعددة الأدوار والشقق.",
    items: BUILDINGS,
  },
  {
    id: "influencers",
    title: "حزم المؤثرين",
    subtitle: "حزم مختارة من تركيبات حقيقية لمؤثرين معروفين.",
    items: INFLUENCERS,
  },
];

export function getPackage(id: string): SolarPackage | undefined {
  return SOLAR_PACKAGES.find((p) => p.id === id);
}

// ---------------- Sizing engine (mirrors calculator.ts bill mode) ----------------
const BILL_DAYS = 15;
const PANEL_W = 650;
const SUN_HOURS = 5;
const NIGHT_BUFFER = 1.2;
const BATTERY_VOLT = 48;
const DOD_LITHIUM = 0.9;
const DAY_HOURS = 14; // total operating hours
const NIGHT_HOURS = 6; // of which night

function roundUpToEven(n: number): number {
  const c = Math.ceil(n);
  return c % 2 === 0 ? c : c + 1;
}

function round(n: number, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function sizePackage(pkg: SolarPackage): { state: CalcState; result: CalcResult } {
  const kWh = Math.max(0, pkg.kWh15Days);
  const totalHours = DAY_HOURS;
  const nightHours = NIGHT_HOURS;

  const hourlyLoadKW = kWh / BILL_DAYS / totalHours;
  const batteryKWh = Math.round(nightHours * hourlyLoadKW * NIGHT_BUFFER);
  const panelsForBattery = Math.ceil((batteryKWh * 1000) / SUN_HOURS / PANEL_W);
  const panelsForDay = Math.ceil((hourlyLoadKW * 1000) / PANEL_W);
  const rawPanels = Math.max(1, panelsForBattery + panelsForDay);
  const panelCount = roundUpToEven(rawPanels);

  const panelKWp = (panelCount * PANEL_W) / 1000;
  const inverterKW = Math.max(panelKWp, hourlyLoadKW, batteryKWh / SUN_HOURS);
  const inverterKVA = Math.max(1, Math.ceil(inverterKW + 0.0001));

  const totalDailyKWh = kWh / BILL_DAYS;
  const nightKWh = nightHours * hourlyLoadKW;

  const batteryAh = Math.round(((batteryKWh / DOD_LITHIUM) * 1000) / BATTERY_VOLT);
  const surgeKVA = round(inverterKVA * 0.33, 2);

  const totalSAR = panelCount * 600 + batteryKWh * 1500 + inverterKVA * 800 + 1500;

  const result: CalcResult = {
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

  const state: CalcState = {
    city: "عدن",
    battery: "lithium",
    autonomy: 1,
    mode: "bill",
    devices: [],
    bill: {
      kWh15Days: kWh,
      dayHours: totalHours,
      nightHours,
    },
  };

  return { state, result };
}
