/**
 * GOOGLE ADMOB INTEGRATION
 * 
 * This component handles AdMob banner ads using @capacitor-community/admob.
 * 
 * SETUP REQUIRED:
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
 *    <meta-data
 *      android:name="com.google.android.gms.ads.APPLICATION_ID"
 *      android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
 * 
 *    iOS (ios/App/App/Info.plist):
 *    <key>GADApplicationIdentifier</key>
 *    <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
 * 
 * 4. Replace the AD_UNIT_IDS below with your production IDs
 * 
 * TEST AD UNIT IDS (use during development):
 * - Android Banner: ca-app-pub-3940256099942544/6300978111
 * - iOS Banner: ca-app-pub-3940256099942544/2934735716
 */

import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Replace these with your production AdMob unit IDs before app store submission
const AD_UNIT_IDS = {
  android: 'ca-app-pub-3940256099942544/6300978111', // Test ID - replace with production
  ios: 'ca-app-pub-3940256099942544/2934735716', // Test ID - replace with production
};

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNativePlatform = platform === 'ios' || platform === 'android';
    setIsNative(isNativePlatform);

    if (!isNativePlatform) {
      // Running in web browser - show placeholder
      return;
    }

    // Initialize AdMob and show banner
    const initializeAd = async () => {
      try {
        // Initialize AdMob (only needed once, but safe to call multiple times)
        await AdMob.initialize({
          initializeForTesting: true, // Set to false for production
        });

        const adUnitId = platform === 'ios' ? AD_UNIT_IDS.ios : AD_UNIT_IDS.android;

        const options: BannerAdOptions = {
          adId: adUnitId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.CENTER,
          margin: 0,
        };

        await AdMob.showBanner(options);
        setAdLoaded(true);
      } catch (error) {
        console.error('AdMob error:', error);
        setAdError(error instanceof Error ? error.message : 'Failed to load ad');
      }
    };

    initializeAd();

    // Cleanup: hide banner when component unmounts
    return () => {
      if (isNativePlatform) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, []);

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
