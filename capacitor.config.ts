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
 * For development hot-reload, the server URL below points to Lovable's preview.
 * For production builds, remove or comment out the server section.
 */

const config: CapacitorConfig = {
  appId: 'app.lovable.2febe13a9bf84f51beecaf74f2784c1f',
  appName: 'Out of Pocket',
  webDir: 'dist',
  
  // Development server for hot-reload
  // Comment this out for production builds
  server: {
    url: 'https://2febe13a-9bf8-4f51-beec-af74f2784c1f.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  
  // iOS-specific settings
  ios: {
    contentInset: 'automatic',
  },
  
  // Android-specific settings  
  android: {
    allowMixedContent: true,
  },
};

export default config;
