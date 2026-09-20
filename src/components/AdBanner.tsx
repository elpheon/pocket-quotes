/**
 * GOOGLE ADMOB PLACEMENT
 *
 * Banner: adaptive banner pinned to the top of the feed.
 * Interstitial: full-screen, every 6–9 quotes and no more than once every
 * two minutes.
 *
 * The SDK, UMP consent flow and load/show lifecycle live in `@/lib/admob`.
 * This file only decides *when* an ad is allowed to appear.
 *
 * Ad unit IDs come from the environment (see `.env.example`), so switching
 * between Google's test inventory and the live units is a config change, not
 * a code change.
 */

import { useEffect, useState } from 'react';
import {
  adsSupported,
  bannerHeightPx,
  initAdMob,
  isFullScreenAdShowing,
  isInterstitialReady,
  onAdEvent,
  prepareInterstitial,
  removeBanner,
  showBanner,
  showInterstitial,
} from '@/lib/admob';

export { prepareInterstitial } from '@/lib/admob';

/**
 * Fallback height reserved for the banner until the SDK reports the real one.
 * An adaptive banner's height varies by device, so the reported value wins.
 */
const FALLBACK_BANNER_HEIGHT_PX = 50;

// ============================================================
// Banner Ad — adaptive banner at the top of the feed
// ============================================================

interface BannerAdProps {
  className?: string;
}

export function StickyBannerAd({ className }: BannerAdProps) {
  const supported = adsSupported();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!supported) return;

    // Space is reserved only once the SDK confirms a banner rendered — a
    // no-fill or a declined consent then leaves no dead strip at the top.
    const unsubscribe = onAdEvent((event) => {
      if (event === 'banner-loaded') {
        setHeight(bannerHeightPx() ?? FALLBACK_BANNER_HEIGHT_PX);
      } else if (event === 'banner-failed') {
        setHeight(0);
      }
    });

    void showBanner();

    return () => {
      unsubscribe();
      void removeBanner();
    };
  }, [supported]);

  // Web / any build without ad units configured: render nothing at all, so the
  // feed does not carry a dead placeholder strip.
  if (!supported) return null;

  // Native: AdMob renders as an overlay at TOP_CENTER, so all this element
  // does is reserve the space. It stays collapsed until a banner is actually
  // showing — a user who declined consent gets no empty gap.
  return <div className={`w-full shrink-0 ${className ?? ''}`} style={{ height }} aria-hidden />;
}

// ============================================================
// Interstitial pacing
// ============================================================

/** Minimum wall-clock gap between two interstitials. */
const MIN_INTERSTITIAL_GAP_MS = 2 * 60 * 1000;
/** Quotes the user must scroll past before the first interstitial of a run. */
const MIN_QUOTES_BETWEEN = 6;
const MAX_QUOTES_BETWEEN = 9;

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let nextInterstitialAt = randomBetween(MIN_QUOTES_BETWEEN, MAX_QUOTES_BETWEEN);
let quotesSinceLastInterstitial = 0;
let lastInterstitialShownAt = 0;

// As soon as an interstitial is dismissed, queue up the next one so it is
// warm by the time the counter comes round again.
onAdEvent((event) => {
  if (event === 'interstitial-dismissed') void prepareInterstitial();
});

/**
 * Called once per quote the user scrolls past. Shows an interstitial when both
 * the quote counter and the time gap allow it, and there is a loaded ad to
 * show. The counter only resets on an ad that was genuinely displayed, so a
 * "No Fill" response does not silently cost the user a placement.
 */
export function checkAndShowInterstitial(): void {
  if (!adsSupported()) return;

  quotesSinceLastInterstitial++;
  if (quotesSinceLastInterstitial < nextInterstitialAt) return;
  if (isFullScreenAdShowing()) return;
  if (Date.now() - lastInterstitialShownAt < MIN_INTERSTITIAL_GAP_MS) return;

  if (!isInterstitialReady()) {
    // Nothing loaded yet — request one for next time rather than dropping the
    // placement entirely.
    void prepareInterstitial();
    return;
  }

  void (async () => {
    const shown = await showInterstitial();
    if (!shown) return;
    lastInterstitialShownAt = Date.now();
    quotesSinceLastInterstitial = 0;
    nextInterstitialAt = randomBetween(MIN_QUOTES_BETWEEN, MAX_QUOTES_BETWEEN);
  })();
}

/**
 * Runs the SDK init + UMP consent flow and warms the first interstitial.
 * Safe to call from anywhere; it no-ops off-device and de-duplicates itself.
 */
export async function initAds(): Promise<void> {
  const canRequestAds = await initAdMob();
  if (canRequestAds) void prepareInterstitial();
}
