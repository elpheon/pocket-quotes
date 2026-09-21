import type { CapacitorConfig } from '@capacitor/cli';

/**
 * CAPACITOR CONFIGURATION — production.
 *
 * The web assets are bundled into the app (webDir: 'dist'); there is no
 * `server` block, so the app does not load a remote URL. That is deliberate:
 * a shipped app pointing at a hosted URL is both an Apple 4.2 rejection risk
 * and a blank screen the moment the host is unreachable.
 *
 * Build cycle after any web change:
 *   npm run build && npx cap sync
 *   npx cap open ios      # or: npx cap open android
 */
const config: CapacitorConfig = {
  appId: 'com.outtapocket.app',
  appName: 'Out of Pocket',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },

  android: {
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      // The web layer dismisses the splash itself (see BootSplash.tsx) so the
      // static native image hands over to the animated loader with no white
      // flash in between. launchShowDuration is the safety net if the web
      // layer never boots at all.
      launchShowDuration: 3000,
      launchAutoHide: false,
      // Matches the app's dark --background (hsl 222 47% 11%) so the splash
      // does not flash a different colour against the app chrome.
      backgroundColor: '#0d1220',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
