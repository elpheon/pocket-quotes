/**
 * Remote (push) notifications.
 *
 * Distinct from `src/lib/notifications.ts`, which schedules the daily Quote of
 * the Day *locally* on the device and needs no server. This module registers
 * the device with APNs/FCM so pushes can be sent to it from outside the app —
 * in practice, from the Firebase console's Cloud Messaging composer, since
 * this app has no backend of its own.
 *
 * The registration token is the thing that matters: nothing can be delivered
 * until the device has one, and it is worth surfacing rather than hiding,
 * because the two ways this silently fails are both invisible from inside the
 * app:
 *
 *   iOS     AppDelegate must post .capacitorDidRegisterForRemoteNotifications.
 *           Without it register() resolves and 'registration' never fires.
 *   Android android/app/google-services.json must match applicationId, or the
 *           google-services Gradle plugin is skipped and FCM never initialises.
 *
 * Push does not work on the iOS Simulator: it has no APNs connection and is
 * never issued a real device token. Test on a physical device.
 */

import { Capacitor } from '@capacitor/core';

const TOKEN_STORAGE_KEY = 'push-registration-token';

export type PushState =
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'registered'; token: string }
  | { status: 'error'; message: string };

let lastState: PushState = { status: 'unsupported' };
let registerPromise: Promise<PushState> | null = null;

/** The most recent registration outcome, for diagnostics. */
export function pushState(): PushState {
  return lastState;
}

/**
 * The device's push token, if one has been issued. Persisted so it survives a
 * reload and can be read back without re-registering — handy when you need to
 * paste it into the Firebase console to send a test message.
 */
export function pushToken(): string | null {
  if (lastState.status === 'registered') return lastState.token;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function remember(token: string) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* private mode or blocked storage — the in-memory state still holds it */
  }
}

/**
 * Asks for notification permission and registers for push. Resolves once the
 * platform has either issued a token or refused.
 *
 * Safe to call more than once; the work is de-duplicated. Returns
 * `unsupported` on web rather than throwing.
 */
export function registerPush(): Promise<PushState> {
  if (!Capacitor.isNativePlatform()) {
    lastState = { status: 'unsupported' };
    return Promise.resolve(lastState);
  }
  if (registerPromise) return registerPromise;

  registerPromise = (async (): Promise<PushState> => {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // The token arrives on an event, not from register(), so the listeners
    // have to be attached before registering or the first one can be missed.
    const settled = new Promise<PushState>((resolve) => {
      void PushNotifications.addListener('registration', (token) => {
        remember(token.value);
        resolve({ status: 'registered', token: token.value });
      });
      void PushNotifications.addListener('registrationError', (err) => {
        resolve({ status: 'error', message: String(err?.error ?? err) });
      });
    });

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') {
      return { status: 'denied' };
    }

    await PushNotifications.register();

    // A device that never gets a token would otherwise leave this pending
    // forever. 30s is generous for a cold APNs/FCM handshake.
    const timeout = new Promise<PushState>((resolve) =>
      setTimeout(
        () =>
          resolve({
            status: 'error',
            message:
              'No registration token within 30s. On iOS check AppDelegate posts ' +
              '.capacitorDidRegisterForRemoteNotifications; on Android check ' +
              'google-services.json matches the applicationId.',
          }),
        30_000,
      ),
    );

    return Promise.race([settled, timeout]);
  })()
    .then((state) => {
      lastState = state;
      if (state.status !== 'registered') {
        console.warn('[push] not registered:', JSON.stringify(state));
      }
      return state;
    })
    .catch((err) => {
      lastState = { status: 'error', message: String(err?.message ?? err) };
      console.error('[push] registration failed:', lastState);
      return lastState;
    });

  return registerPromise;
}

/**
 * Subscribes the device to an FCM topic so the Firebase console can broadcast
 * to every install at once without keeping a list of tokens — which is the
 * only practical way to send from a console when there is no backend holding
 * tokens.
 *
 * iOS has no topic API in the Capacitor plugin, so this is Android-only; on
 * iOS, broadcast by selecting the app in the console composer instead.
 */
export async function subscribeToTopic(topic: string): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'android') return false;
  try {
    const { FirebaseMessaging } = (await import('@capacitor/push-notifications')) as unknown as {
      FirebaseMessaging?: { subscribeToTopic?: (o: { topic: string }) => Promise<void> };
    };
    if (!FirebaseMessaging?.subscribeToTopic) return false;
    await FirebaseMessaging.subscribeToTopic({ topic });
    return true;
  } catch (err) {
    console.warn('[push] topic subscribe failed:', err);
    return false;
  }
}
