/**
 * User Preferences Manager - Manages user preferences via cookies
 */

import { setJsonCookie, getJsonCookie } from "./cookieManager";
import { trackFeatureUsage } from "./activityTracker";

export interface UserPreferences {
  // Theme preferences
  theme?: "light" | "dark" | "auto";

  // Layout preferences
  sidebarCollapsed?: boolean;
  compactMode?: boolean;

  // Feature preferences
  enableNotifications?: boolean;
  enableAnalytics?: boolean;

  // Display preferences
  itemsPerPage?: number;
  sortBy?: string;
  filterPresets?: Record<string, unknown>;

  // Language & localization
  language?: string;
  timezone?: string;

  // Custom preferences
  [key: string]: unknown;
}

const PREFERENCES_COOKIE_NAME = "user_preferences";
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  sidebarCollapsed: false,
  compactMode: false,
  enableNotifications: true,
  // Note: enableAnalytics is NOT included here so banner shows on first visit
  itemsPerPage: 10,
  language: "en",
};

/**
 * Get all user preferences
 */
export function getPreferences(): UserPreferences {
  const saved = getJsonCookie<UserPreferences>(PREFERENCES_COOKIE_NAME);
  return { ...DEFAULT_PREFERENCES, ...saved };
}

/**
 * Get a specific preference
 */
export function getPreference<T = unknown>(key: string): T | undefined;
export function getPreference<T = unknown>(key: string, defaultValue: T): T;
export function getPreference<T = unknown>(
  key: string,
  defaultValue?: T,
): T | undefined {
  const preferences = getPreferences();
  return (preferences[key] as T) ?? defaultValue;
}

/**
 * Set a specific preference
 */
export function setPreference<T>(key: string, value: T): void {
  const preferences = getPreferences();
  preferences[key] = value;
  setJsonCookie(PREFERENCES_COOKIE_NAME, preferences, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
  trackFeatureUsage("preference_changed", { preference: key, value });
}

/**
 * Set multiple preferences at once
 */
export function setPreferences(updates: Partial<UserPreferences>): void {
  const preferences = getPreferences();
  const updated = { ...preferences, ...updates };
  setJsonCookie(PREFERENCES_COOKIE_NAME, updated, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
  trackFeatureUsage("preferences_updated", { changes: Object.keys(updates) });
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
  setJsonCookie(PREFERENCES_COOKIE_NAME, DEFAULT_PREFERENCES, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
  trackFeatureUsage("preferences_reset");
}

/**
 * Merge preferences with defaults
 */
export function mergePreferences(
  custom: Partial<UserPreferences>,
): UserPreferences {
  return { ...DEFAULT_PREFERENCES, ...custom };
}

// Convenience methods for common preferences

export function getTheme(): "light" | "dark" | "auto" {
  return getPreference("theme", "auto") as "light" | "dark" | "auto";
}

export function setTheme(theme: "light" | "dark" | "auto"): void {
  setPreference("theme", theme);
}

export function isSidebarCollapsed(): boolean {
  return getPreference("sidebarCollapsed", false) as boolean;
}

export function setSidebarCollapsed(collapsed: boolean): void {
  setPreference("sidebarCollapsed", collapsed);
}

export function isCompactMode(): boolean {
  return getPreference("compactMode", false) as boolean;
}

export function setCompactMode(compact: boolean): void {
  setPreference("compactMode", compact);
}

export function areNotificationsEnabled(): boolean {
  return getPreference("enableNotifications", true) as boolean;
}

export function setNotificationsEnabled(enabled: boolean): void {
  setPreference("enableNotifications", enabled);
}

export function isAnalyticsEnabled(): boolean | undefined {
  return getPreference("enableAnalytics") as boolean | undefined;
}

export function setAnalyticsEnabled(enabled: boolean): void {
  setPreference("enableAnalytics", enabled);
}

export function getItemsPerPage(): number {
  return getPreference("itemsPerPage", 10) as number;
}

export function setItemsPerPage(count: number): void {
  setPreference("itemsPerPage", count);
}

export function getLanguage(): string {
  return getPreference("language", "en") as string;
}

export function setLanguage(lang: string): void {
  setPreference("language", lang);
}

export function getSortBy(): string | undefined {
  return getPreference("sortBy") as string | undefined;
}

export function setSortBy(sort: string): void {
  setPreference("sortBy", sort);
}

export function getFilterPresets(): Record<string, unknown> {
  return getPreference("filterPresets", {}) as Record<string, unknown>;
}

export function setFilterPresets(presets: Record<string, unknown>): void {
  setPreference("filterPresets", presets);
}
