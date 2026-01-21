/**
 * DAILY NOTIFICATIONS
 * 
 * Schedules a local notification every day at 10:00 AM local time
 * using Capacitor Local Notifications plugin.
 */

import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const DAILY_NOTIFICATION_ID = 1001;

/**
 * Check if we're on a native platform
 */
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Request notification permissions
 * Returns true if granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) {
    console.log('Notifications not available on web');
    return false;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (e) {
    console.warn('Failed to request notification permission:', e);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNative()) {
    return false;
  }

  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (e) {
    console.warn('Failed to check notification permission:', e);
    return false;
  }
}

/**
 * Schedule the daily 10 AM notification
 */
export async function scheduleDailyNotification(): Promise<boolean> {
  if (!isNative()) {
    console.log('Cannot schedule notifications on web');
    return false;
  }

  try {
    // First check/request permissions
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return false;
    }

    // Cancel any existing daily notification first
    await cancelDailyNotification();

    // Calculate next 10 AM
    const now = new Date();
    const next10AM = new Date(now);
    next10AM.setHours(10, 0, 0, 0);
    
    // If it's already past 10 AM today, schedule for tomorrow
    if (now >= next10AM) {
      next10AM.setDate(next10AM.getDate() + 1);
    }

    const scheduleOptions: ScheduleOptions = {
      notifications: [
        {
          id: DAILY_NOTIFICATION_ID,
          title: 'Quote of the Day',
          body: 'Your quote of the day is ready—tap to see it.',
          schedule: {
            at: next10AM,
            repeats: true,
            every: 'day',
            allowWhileIdle: true,
          },
          actionTypeId: 'OPEN_QOTD',
          extra: {
            route: '/daily'
          }
        }
      ]
    };

    await LocalNotifications.schedule(scheduleOptions);
    console.log('Daily notification scheduled for 10 AM');
    return true;
  } catch (e) {
    console.warn('Failed to schedule daily notification:', e);
    return false;
  }
}

/**
 * Cancel the daily notification
 */
export async function cancelDailyNotification(): Promise<void> {
  if (!isNative()) {
    return;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_NOTIFICATION_ID }]
    });
  } catch (e) {
    console.warn('Failed to cancel daily notification:', e);
  }
}

/**
 * Setup notification listeners for handling taps
 */
export function setupNotificationListeners(onNotificationTap: (route: string) => void): void {
  if (!isNative()) {
    return;
  }

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    const route = notification.notification.extra?.route;
    if (route) {
      onNotificationTap(route);
    }
  });
}

/**
 * Initialize notifications on app start
 * Call this once when the app loads
 */
export async function initializeNotifications(onNotificationTap: (route: string) => void): Promise<void> {
  if (!isNative()) {
    return;
  }

  // Setup listeners
  setupNotificationListeners(onNotificationTap);

  // Schedule daily notification
  await scheduleDailyNotification();
}
