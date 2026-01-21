import type { CapacitorConfig } from '@capacitor/cli';

/**
 * CAPACITOR CONFIGURATION
 * 
 * This file configures your native iOS and Android apps.
 * 
 * SETUP STEPS:
 * 1. Export this project to GitHub (use the "Export to GitHub" button)
 * 2. Clone the repo locally: git clone YOUR_REPO_URL
 * 3. Install dependencies: npm install
 * 4. Add platforms: npx cap add ios && npx cap add android
 * 5. Build the web app: npm run build
 * 6. Sync to native: npx cap sync
 * 7. Open in IDE: npx cap open ios (or android)
 * 
 * ============================================================
 * PRODUCTION CHECKLIST (before submitting to app stores):
 * ============================================================
 * 1. Change appId to your own bundle identifier (e.g., com.yourcompany.outofpocket)
 * 2. Comment out or remove the entire "server" block below
 * 3. Update AdMob IDs in src/components/AdBanner.tsx
 * 4. Update store URLs in src/pages/About.tsx
 * 5. Run: npm run build && npx cap sync
 */

const config: CapacitorConfig = {
  // ============================================================
  // PRODUCTION: Change this to your own bundle identifier
  // Example: 'com.yourcompany.outofpocket'
  // ============================================================
  appId: 'app.lovable.2febe13a9bf84f51beecaf74f2784c1f',
  appName: 'Out of Pocket',
  webDir: 'dist',
  
  // ============================================================
  // DEVELOPMENT SERVER - REMOVE FOR PRODUCTION
  // Comment out or delete this entire "server" block before building
  // your production app for the app stores.
  // ============================================================
  server: {
    url: 'https://2febe13a-9bf8-4f51-beec-af74f2784c1f.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  // ============================================================
  // END DEVELOPMENT SERVER
  // ============================================================
  
  // iOS-specific settings
  ios: {
    contentInset: 'automatic',
  },
  
  // Android-specific settings  
  android: {
    allowMixedContent: true,
  },

  // Splash screen configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
