/**
 * GOOGLE ADMOB INTEGRATION
 * 
 * This component handles AdMob banner ads using @capacitor-community/admob.
 * 
 * ============================================================
 * SETUP REQUIRED FOR PRODUCTION:
 * ============================================================
 * 
 * 1. Create an AdMob account at https://admob.google.com
 * 
 * 2. Register your apps and get Ad Unit IDs:
 *    - Create an iOS app in AdMob → Get App ID and Banner Ad Unit ID
 *    - Create an Android app in AdMob → Get App ID and Banner Ad Unit ID
 * 
 * 3. Add your AdMob App ID to native manifests:
 * 
 *    Android (android/app/src/main/AndroidManifest.xml):
 *    Add inside <application> tag:
 *    <meta-data
 *      android:name="com.google.android.gms.ads.APPLICATION_ID"
 *      android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
 * 
 *    iOS (ios/App/App/Info.plist):
 *    Add inside <dict>:
 *    <key>GADApplicationIdentifier</key>
 *    <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
 * 
 * 4. Replace the AD_UNIT_IDS below with your production IDs
 * 
 * 5. Set initializeForTesting to false in the AdMob.initialize() call below
 * 
 * ============================================================
 * TEST AD UNIT IDS (use during development):
 * - Android Banner: ca-app-pub-3940256099942544/6300978111
 * - iOS Banner: ca-app-pub-3940256099942544/2934735716
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// ============================================================
// PRODUCTION: Replace these with your real AdMob Ad Unit IDs
// ============================================================
const AD_UNIT_IDS = {
  android: 'ca-app-pub-3940256099942544/6300978111', // TEST ID - Replace with: ca-app-pub-XXXX/YYYY
  ios: 'ca-app-pub-3940256099942544/2934735716',     // TEST ID - Replace with: ca-app-pub-XXXX/YYYY
};

// ============================================================
// PRODUCTION: Set this to false before submitting to app stores
// ============================================================
const INITIALIZE_FOR_TESTING = true;

interface AdBannerProps {
  className?: string;
  isVisible?: boolean; // Controls whether the ad overlay is shown
}

export function AdBanner({ className, isVisible = true }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNativePlatform = platform === 'ios' || platform === 'android';
    setIsNative(isNativePlatform);

    if (!isNativePlatform) {
      return;
    }

    // Initialize AdMob once
    const initializeAdMob = async () => {
      try {
        await AdMob.initialize({
          initializeForTesting: INITIALIZE_FOR_TESTING,
        });
        setIsInitialized(true);
      } catch (error) {
        console.error('AdMob initialization error:', error);
        setAdError(error instanceof Error ? error.message : 'Failed to initialize');
      }
    };

    initializeAdMob();
  }, []);

  // Show/hide banner based on visibility
  useEffect(() => {
    if (!isNative || !isInitialized) return;

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === 'ios' ? AD_UNIT_IDS.ios : AD_UNIT_IDS.android;

    const manageBanner = async () => {
      try {
        if (isVisible) {
          const options: BannerAdOptions = {
            adId: adUnitId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.CENTER,
            margin: 0,
          };
          await AdMob.showBanner(options);
          setAdLoaded(true);
        } else {
          await AdMob.hideBanner();
        }
      } catch (error) {
        console.error('AdMob banner error:', error);
        setAdError(error instanceof Error ? error.message : 'Failed to manage ad');
      }
    };

    manageBanner();

    // Cleanup: hide banner when component unmounts
    return () => {
      AdMob.hideBanner().catch(console.error);
    };
  }, [isNative, isInitialized, isVisible]);

  // Web placeholder (shown in browser during development)
  if (!isNative) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center bg-card ${className}`}>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-8 py-12">
          <div className="text-4xl">📢</div>
          <p className="text-center text-lg font-medium text-muted-foreground">
            AdMob Banner
          </p>
          <p className="max-w-xs text-center text-sm text-muted-foreground/70">
            Ads will appear here in the native app.
            This placeholder is shown in web preview.
          </p>
        </div>
      </div>
    );
  }

  // Native app - ad loads via AdMob plugin overlay
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-card ${className}`}>
      {adError ? (
        <p className="text-sm text-muted-foreground">Ad unavailable</p>
      ) : !adLoaded ? (
        <p className="text-sm text-muted-foreground">Loading ad...</p>
      ) : (
        // Ad is displayed as native overlay by AdMob plugin
        <div className="h-[50px]" /> // Space for banner
      )}
    </div>
  );
}

/**
 * Check if an ad should be shown at this index
 * Shows ad after every 4th quote (positions 4, 8, 12, etc. = indices 3, 7, 11)
 */
export function shouldShowAd(quoteIndex: number): boolean {
  return (quoteIndex + 1) % 4 === 0;
}
