/**
 * ADMOB BANNER PLACEHOLDER
 * 
 * This component shows where AdMob banners will appear.
 * In production with Capacitor, replace this with actual AdMob integration.
 * 
 * HOW TO SET UP ADMOB:
 * 
 * 1. Install the Capacitor AdMob plugin:
 *    npm install @capacitor-community/admob
 * 
 * 2. Add your AdMob app ID to android/app/src/main/AndroidManifest.xml:
 *    <meta-data
 *      android:name="com.google.android.gms.ads.APPLICATION_ID"
 *      android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
 * 
 * 3. For iOS, add to ios/App/App/Info.plist:
 *    <key>GADApplicationIdentifier</key>
 *    <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
 * 
 * 4. Replace the AD_UNIT_IDS below with your production IDs
 * 
 * TEST AD UNIT IDS (for development):
 * - Android Banner: ca-app-pub-3940256099942544/6300978111
 * - iOS Banner: ca-app-pub-3940256099942544/2934735716
 * 
 * AD DISPLAY LOGIC:
 * The Feed screen tracks which quote index the user is viewing.
 * Every 4th quote (index 3, 7, 11, etc.), an ad banner is shown.
 * This component is inserted as a full-screen "card" in the feed.
 */

// Replace these with your production AdMob unit IDs
export const AD_UNIT_IDS = {
  android: 'ca-app-pub-3940256099942544/6300978111', // Test ID
  ios: 'ca-app-pub-3940256099942544/2934735716', // Test ID
};

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-card ${className}`}>
      {/* Placeholder for development */}
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-8 py-12">
        <div className="text-4xl">📢</div>
        <p className="text-center text-lg font-medium text-muted-foreground">
          AdMob Banner
        </p>
        <p className="max-w-xs text-center text-sm text-muted-foreground/70">
          This space shows an ad every 4th quote.
          Replace with actual AdMob in production.
        </p>
      </div>
    </div>
  );
}

/**
 * Check if an ad should be shown at this index
 * Shows ad after every 4th quote (positions 4, 8, 12, etc. = indices 3, 7, 11)
 */
export function shouldShowAd(quoteIndex: number): boolean {
  // Show ad after every 4th quote
  return (quoteIndex + 1) % 4 === 0;
}
