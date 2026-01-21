/**
 * App settings management using localStorage
 */

const HIDE_NSFW_KEY = "outofpocket_hide_nsfw";

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
