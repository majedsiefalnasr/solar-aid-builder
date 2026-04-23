import { useSyncExternalStore } from "react";
import type { Role } from "./dashboard-data";

export type ThemeMode = "light" | "dark" | "system";
export type FontFamily = "cairo" | "tajawal" | "ibm" | "noto";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type LayoutMode = "boxed" | "wide" | "full";
export type Density = "comfortable" | "compact";

export interface RolePrefs {
  // Owner
  showPaymentReminders?: boolean;
  showProjectAlerts?: boolean;
  // Contractor
  showWithdrawalAlerts?: boolean;
  defaultPhaseView?: "list" | "kanban";
  // Supervisor
  autoApproveMinor?: boolean;
  showFieldTeamLocation?: boolean;
  // Field
  reportReminders?: boolean;
  offlineMode?: boolean;
  // Admin
  showRevenueWidget?: boolean;
  showSystemHealth?: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  layout: LayoutMode;
  density: Density;
  reducedMotion: boolean;
  showDemoBanner: boolean;
  rolePrefs: Record<Role, RolePrefs>;
}

const STORAGE_KEY = "tamm_app_settings_v1";

const DEFAULT: AppSettings = {
  theme: "light",
  fontFamily: "cairo",
  fontSize: "md",
  layout: "boxed",
  density: "comfortable",
  reducedMotion: false,
  showDemoBanner: true,
  rolePrefs: {
    owner: { showPaymentReminders: true, showProjectAlerts: true },
    contractor: { showWithdrawalAlerts: true, defaultPhaseView: "list" },
    supervisor: { autoApproveMinor: false, showFieldTeamLocation: true },
    field: { reportReminders: true, offlineMode: false },
    admin: { showRevenueWidget: true, showSystemHealth: true },
  },
};

let state: AppSettings = load();
const listeners = new Set<() => void>();

function load(): AppSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      rolePrefs: { ...DEFAULT.rolePrefs, ...(parsed.rolePrefs ?? {}) },
    };
  } catch {
    return DEFAULT;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function emit() {
  listeners.forEach((l) => l());
  applyToDOM();
}

export function applyToDOM() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Theme
  const isDark =
    state.theme === "dark" ||
    (state.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);

  // Font family
  const fontMap: Record<FontFamily, string> = {
    cairo: '"Cairo", "Inter", system-ui, sans-serif',
    tajawal: '"Tajawal", "Cairo", "Inter", sans-serif',
    ibm: '"IBM Plex Sans Arabic", "Cairo", sans-serif',
    noto: '"Noto Sans Arabic", "Cairo", sans-serif',
  };
  root.style.setProperty("--font-sans", fontMap[state.fontFamily]);
  root.style.setProperty("--font-display", fontMap[state.fontFamily]);

  // Font size — root font-size scaling
  const sizeMap: Record<FontSize, string> = {
    sm: "14px",
    md: "16px",
    lg: "17.5px",
    xl: "19px",
  };
  root.style.fontSize = sizeMap[state.fontSize];

  // Reduced motion
  root.dataset.reducedMotion = state.reducedMotion ? "true" : "false";
  // Density
  root.dataset.density = state.density;
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
  state = { ...state, [key]: value };
  persist();
  emit();
}

export function setRolePref<K extends keyof RolePrefs>(
  role: Role,
  key: K,
  value: RolePrefs[K],
) {
  state = {
    ...state,
    rolePrefs: {
      ...state.rolePrefs,
      [role]: { ...state.rolePrefs[role], [key]: value },
    },
  };
  persist();
  emit();
}

export function resetSettings() {
  state = DEFAULT;
  persist();
  emit();
}

export function getSettings(): AppSettings {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT,
  );
}

// Listen to system theme changes when in system mode
if (typeof window !== "undefined") {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    if (state.theme === "system") applyToDOM();
  });
}
