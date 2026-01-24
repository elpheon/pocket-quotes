import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Trigger a light impact haptic (for toggles, switches)
 */
export async function hapticLight() {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  }
}

/**
 * Trigger a medium impact haptic (for double-tap favorite)
 */
export async function hapticMedium() {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  }
}

/**
 * Trigger a success notification haptic (for form submissions)
 */
export async function hapticSuccess() {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  }
}
