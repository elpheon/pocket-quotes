/**
 * App settings management using localStorage
 */

const HIDE_NSFW_KEY = "outofpocket_hide_nsfw";
const THEME_KEY = "outofpocket_theme";
const SHOW_BACKGROUND_KEY = "outofpocket_show_background";

export type Theme = 'light' | 'dark' | 'system';

export function getHideNSFW(): boolean {
  try {
    return localStorage.getItem(HIDE_NSFW_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHideNSFW(value: boolean): void {
  try {
    localStorage.setItem(HIDE_NSFW_KEY, value.toString());
  } catch (e) {
    console.warn("Failed to save NSFW setting:", e);
  }
}

export function getTheme(): Theme {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(value: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch (e) {
    console.warn("Failed to save theme setting:", e);
  }
}

export function getShowBackground(): boolean {
  try {
    const stored = localStorage.getItem(SHOW_BACKGROUND_KEY);
    // Default to true if not set
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function setShowBackground(value: boolean): void {
  try {
    localStorage.setItem(SHOW_BACKGROUND_KEY, value.toString());
  } catch (e) {
    console.warn("Failed to save background setting:", e);
  }
}
