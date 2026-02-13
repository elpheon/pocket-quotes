/**
 * GOOGLE ADMOB INTEGRATION
 * 
 * Banner Ad: Persistent banner at top of feed, refreshes every 30 seconds.
 * Interstitial Ad: Full-screen ad shown every 4th quote.
 * 
 * ============================================================
 * SETUP REQUIRED FOR PRODUCTION:
 * ============================================================
 * 
 * 1. Create an AdMob account at https://admob.google.com
 * 2. Register your apps and get Ad Unit IDs for Banner + Interstitial
 * 3. Replace the AD_UNIT_IDS below with your production IDs
 * 4. Set INITIALIZE_FOR_TESTING to false
 * 
 * See capacitor.config.ts comments for native manifest setup.
 * ============================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// ============================================================
// PRODUCTION: Replace these with your real AdMob Ad Unit IDs
// ============================================================
const AD_UNIT_IDS = {
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111', // TEST
    ios: 'ca-app-pub-3940256099942544/2934735716',     // TEST
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712', // TEST
    ios: 'ca-app-pub-3940256099942544/4411468910',     // TEST
  },
};

const INITIALIZE_FOR_TESTING = true;
const BANNER_REFRESH_MS = 30_000;

// Singleton initialization
let admobInitialized = false;
let admobInitializing = false;

async function ensureAdMobInit(): Promise<boolean> {
  if (admobInitialized) return true;
  if (admobInitializing) {
    // Wait for in-progress init
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (admobInitialized) { clearInterval(check); resolve(true); }
      }, 100);
      setTimeout(() => { clearInterval(check); resolve(false); }, 5000);
    });
  }
  admobInitializing = true;
  try {
    await AdMob.initialize({ initializeForTesting: INITIALIZE_FOR_TESTING });
    admobInitialized = true;
    return true;
  } catch (e) {
    console.error('AdMob init error:', e);
    return false;
  } finally {
    admobInitializing = false;
  }
}

// ============================================================
// Banner Ad Component – sticky at top, auto-refreshes
// ============================================================
interface BannerAdProps {
  className?: string;
}

export function StickyBannerAd({ className }: BannerAdProps) {
  const refreshTimer = useRef<ReturnType<typeof setInterval>>();
  const platform = Capacitor.getPlatform();
  const isNative = platform === 'ios' || platform === 'android';

  const showBanner = useCallback(async () => {
    try {
      await AdMob.removeBanner().catch(() => {});
      await new Promise(r => setTimeout(r, 50));
      const adId = platform === 'ios' ? AD_UNIT_IDS.banner.ios : AD_UNIT_IDS.banner.android;
      const options: BannerAdOptions = {
        adId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.TOP_CENTER,
        margin: 0,
      };
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Banner ad error:', e);
    }
  }, [platform]);

  useEffect(() => {
    if (!isNative) return;

    let mounted = true;
    (async () => {
      const ready = await ensureAdMobInit();
      if (!ready || !mounted) return;
      await showBanner();
      // Auto-refresh every 30 seconds
      refreshTimer.current = setInterval(showBanner, BANNER_REFRESH_MS);
    })();

    return () => {
      mounted = false;
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      AdMob.removeBanner().catch(() => {});
    };
  }, [isNative, showBanner]);

  // Web placeholder
  if (!isNative) {
    return (
      <div className={`flex w-full items-center justify-center bg-card border-b border-border py-2 ${className ?? ''}`}>
        <p className="text-xs text-muted-foreground">📢 Banner Ad (native only)</p>
      </div>
    );
  }

  // Native: AdMob renders as an overlay at TOP_CENTER; reserve space
  return <div className={`w-full h-[50px] shrink-0 ${className ?? ''}`} />;
}

// ============================================================
// Interstitial Ad – preload + show on demand
// ============================================================
let interstitialLoaded = false;

export async function prepareInterstitial(): Promise<void> {
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return;
  
  const ready = await ensureAdMobInit();
  if (!ready) return;

  try {
    const adId = platform === 'ios' ? AD_UNIT_IDS.interstitial.ios : AD_UNIT_IDS.interstitial.android;
    const options: AdOptions = { adId };
    await AdMob.prepareInterstitial(options);
    interstitialLoaded = true;
  } catch (e) {
    console.error('Interstitial prepare error:', e);
    interstitialLoaded = false;
  }
}

export async function showInterstitial(): Promise<void> {
  if (!interstitialLoaded) {
    await prepareInterstitial();
  }
  try {
    await AdMob.showInterstitial();
    interstitialLoaded = false;
    // Pre-load next one
    prepareInterstitial();
  } catch (e) {
    console.error('Interstitial show error:', e);
    interstitialLoaded = false;
  }
}

/**
 * Check if an interstitial should be shown at this quote index.
 * Triggers every 4th quote (indices 3, 7, 11, …).
 */
export function shouldShowInterstitial(quoteIndex: number): boolean {
  return (quoteIndex + 1) % 4 === 0;
}
