/**
 * App settings management using localStorage
 */

const HIDE_NSFW_KEY = "outofpocket_hide_nsfw";
const THEME_KEY = "outofpocket_theme";
const SHOW_BACKGROUND_KEY = "outofpocket_show_background";
const NOTIFICATION_ENABLED_KEY = "outofpocket_notification_enabled";
const NOTIFICATION_HOUR_KEY = "outofpocket_notification_hour";
const NOTIFICATION_MINUTE_KEY = "outofpocket_notification_minute";

export type Theme = 'light' | 'dark' | 'system';

export function getHideNSFW(): boolean {
  try {
    const stored = localStorage.getItem(HIDE_NSFW_KEY);
    // Default to true (hide NSFW) if not set
    return stored === null ? true : stored === "true";
  } catch {
    return true;
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

export function getNotificationEnabled(): boolean {
  try {
    const stored = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
    // Default to true if not set
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function setNotificationEnabled(value: boolean): void {
  try {
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, value.toString());
  } catch (e) {
    console.warn("Failed to save notification enabled setting:", e);
  }
}

export function getNotificationTime(): { hour: number; minute: number } {
  try {
    const hour = localStorage.getItem(NOTIFICATION_HOUR_KEY);
    const minute = localStorage.getItem(NOTIFICATION_MINUTE_KEY);
    return {
      hour: hour !== null ? parseInt(hour, 10) : 10,
      minute: minute !== null ? parseInt(minute, 10) : 0,
    };
  } catch {
    return { hour: 10, minute: 0 };
  }
}

export function setNotificationTime(hour: number, minute: number): void {
  try {
    localStorage.setItem(NOTIFICATION_HOUR_KEY, hour.toString());
    localStorage.setItem(NOTIFICATION_MINUTE_KEY, minute.toString());
  } catch (e) {
    console.warn("Failed to save notification time setting:", e);
  }
}
