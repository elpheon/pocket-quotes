/**
 * Covers the handoff from the native launch screen to the running app.
 *
 * Capacitor's native splash is a static image; it cannot animate. So the
 * native splash is configured with `launchAutoHide: false` and this overlay —
 * already painted by the time it is dismissed — takes over, which is what lets
 * the app show an animated loader at launch without a white flash between the
 * two.
 *
 * It dismisses on the `app-ready` event (dispatched once the feed has its
 * quotes), with a hard ceiling so a slow or failed fetch can never leave the
 * user staring at a loader, and a floor so a warm start does not flash it.
 */

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FuturisticLoader } from '@/components/FuturisticLoader';

/** Never hold the boot screen longer than this, whatever the app reports. */
const MAX_VISIBLE_MS = 2_500;
/** Below this it reads as a flicker rather than a transition. */
const MIN_VISIBLE_MS = 600;
const FADE_MS = 400;

export const APP_READY_EVENT = 'app-ready';

/** Signals that the app has what it needs to render its first screen. */
export function signalAppReady() {
  window.dispatchEvent(new Event(APP_READY_EVENT));
}

export function BootSplash() {
  const [dismissed, setDismissed] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    // Hide the native splash now that this overlay is on screen. Failure here
    // is not worth surfacing: on web there is no native splash to hide.
    if (Capacitor.isNativePlatform()) {
      void import('@capacitor/splash-screen')
        .then(({ SplashScreen }) => SplashScreen.hide())
        .catch(() => {
          /* no native splash to dismiss */
        });
    }

    const shownAt = Date.now();
    let dismissTimer: ReturnType<typeof setTimeout>;

    const dismiss = () => {
      const elapsed = Date.now() - shownAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      dismissTimer = setTimeout(() => setDismissed(true), wait);
    };

    window.addEventListener(APP_READY_EVENT, dismiss, { once: true });
    const ceiling = setTimeout(dismiss, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener(APP_READY_EVENT, dismiss);
      clearTimeout(ceiling);
      clearTimeout(dismissTimer);
    };
  }, []);

  // Removed from the tree after the fade so it cannot trap taps.
  useEffect(() => {
    if (!dismissed) return;
    const t = setTimeout(() => setUnmounted(true), FADE_MS);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (unmounted) return null;

  return (
    // z-[60] rather than z-50: BottomNav is also z-50 and renders later in the
    // tree, so an equal z-index lets the nav sit on top of the boot screen.
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-background transition-opacity"
      style={{
        opacity: dismissed ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: dismissed ? 'none' : undefined,
      }}
      role="status"
      aria-label="Starting Outta Pocket"
    >
      <FuturisticLoader size={96} label={null} />

      <div className="flex flex-col items-center gap-1.5">
        <h1 className="text-3xl font-bold tracking-wide text-foreground">Outta Pocket</h1>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Quotes that hit different
        </p>
      </div>
    </div>
  );
}
