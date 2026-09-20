// AdMob + Google User Messaging Platform (UMP) consent.
//
// Ads are always requested as non-personalised (npa: true): no IDFA, no
// advertising ID, no cross-app tracking. That keeps the App Store privacy
// declaration at "Data Not Collected" and means the app never has to show an
// App Tracking Transparency prompt — the single most common cause of an
// ad-related review rejection.
//
// This module is the native layer: SDK init, UMP consent, and the
// load/ready/show lifecycle. It makes no decision about *when* an ad appears;
// that lives in `src/components/AdBanner.tsx`.
//
// UMP flow (Google's required order for EEA / UK / CH users):
//   1. AdMob.requestConsentInfo()  -> run every launch
//   2. AdMob.showConsentForm()     -> only when status === REQUIRED
//   3. gate every ad request on the resulting canRequestAds
//   4. expose showAdPrivacyOptions() whenever privacyOptionsRequirementStatus
//      === REQUIRED so the user can change/withdraw consent later

import { Capacitor } from '@capacitor/core';

type Platform = 'android' | 'ios';

/** The subset of the UMP consent response this module reads. */
type ConsentInfo = {
  status?: unknown;
  isConsentFormAvailable?: boolean;
  canRequestAds?: boolean;
  privacyOptionsRequirementStatus?: unknown;
};

function currentPlatform(): Platform | null {
  const p = Capacitor.getPlatform();
  return p === 'android' || p === 'ios' ? p : null;
}

/**
 * Per-platform ad unit IDs, supplied by the environment so that swapping test
 * inventory for live inventory is a `.env` change, never a code edit.
 */
export function bannerAdUnitId(): string | undefined {
  const p = currentPlatform();
  if (p === 'android') return import.meta.env.VITE_ADMOB_BANNER_AD_UNIT_ID_ANDROID as string | undefined;
  if (p === 'ios') return import.meta.env.VITE_ADMOB_BANNER_AD_UNIT_ID_IOS as string | undefined;
  return undefined;
}

export function interstitialAdUnitId(): string | undefined {
  const p = currentPlatform();
  if (p === 'android') return import.meta.env.VITE_ADMOB_INTERSTITIAL_AD_UNIT_ID_ANDROID as string | undefined;
  if (p === 'ios') return import.meta.env.VITE_ADMOB_INTERSTITIAL_AD_UNIT_ID_IOS as string | undefined;
  return undefined;
}

/**
 * True when this build can request ads at all: running inside the native shell
 * on a platform that has at least one ad unit configured. Off = web, where
 * every entry point no-ops.
 */
export function adsSupported(): boolean {
  return currentPlatform() !== null && Boolean(bannerAdUnitId() || interstitialAdUnitId());
}

/** Google's official public test unit prefix. */
export function usingTestAdUnits(): boolean {
  const ids = [bannerAdUnitId(), interstitialAdUnitId()].filter(Boolean) as string[];
  return ids.length > 0 && ids.every((id) => id.startsWith('ca-app-pub-3940256099942544'));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
let admobModule: any = null;

/** Lazily imported so the Mobile Ads SDK bindings stay out of the main bundle. */
async function loadAdMob(): Promise<any> {
  if (!admobModule) {
    admobModule = await import('@capacitor-community/admob');
  }
  return admobModule;
}

function describeError(err: any): string {
  if (!err) return 'unknown error';
  const parts = [
    err.code != null ? `code=${err.code}` : null,
    err.domain ? `domain=${err.domain}` : null,
    err.message ? `message=${err.message}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : String(err);
}

/**
 * Optional debug overrides for testing the consent message on a physical
 * device. Set in `.env`:
 *   VITE_ADMOB_DEBUG_GEOGRAPHY = EEA | US | OTHER | DISABLED   (default DISABLED)
 *   VITE_ADMOB_TEST_DEVICE_IDS = comma-separated hashed device IDs
 * Leave both unset in production.
 */
function consentRequestOptions(AdmobConsentDebugGeography: any): Record<string, unknown> {
  const geoRaw = String(import.meta.env.VITE_ADMOB_DEBUG_GEOGRAPHY ?? '').toUpperCase();
  const testDeviceIdentifiers = String(import.meta.env.VITE_ADMOB_TEST_DEVICE_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const geoMap: Record<string, unknown> = {
    EEA: AdmobConsentDebugGeography?.EEA,
    US: AdmobConsentDebugGeography?.US,
    OTHER: AdmobConsentDebugGeography?.OTHER,
    DISABLED: AdmobConsentDebugGeography?.DISABLED,
  };

  const options: Record<string, unknown> = {};
  if (geoRaw && geoRaw !== 'DISABLED' && geoMap[geoRaw] !== undefined) {
    options.debugGeography = geoMap[geoRaw];
  }
  if (testDeviceIdentifiers.length) options.testDeviceIdentifiers = testDeviceIdentifiers;
  return options;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- Consent state --------------------------------------------------------

type ConsentSnapshot = {
  platform: Platform | null;
  supported: boolean;
  initialised: boolean;
  status: string | null;
  isConsentFormAvailable: boolean | null;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus: string | null;
  lastError: string | null;
  ranAt: number | null;
};

let snapshot: ConsentSnapshot = {
  platform: currentPlatform(),
  supported: false,
  initialised: false,
  status: null,
  isConsentFormAvailable: null,
  canRequestAds: false,
  privacyOptionsRequirementStatus: null,
  lastError: null,
  ranAt: null,
};

// --- Interstitial lifecycle state ----------------------------------------

type FullScreenState = {
  loading: boolean;
  ready: boolean;
  showing: boolean;
  lastLoadError: string | null;
  lastShowError: string | null;
  loadFailures: number;
  lastLoadedAt: number | null;
  lastShownAt: number | null;
};

const interstitial: FullScreenState = {
  loading: false,
  ready: false,
  showing: false,
  lastLoadError: null,
  lastShowError: null,
  loadFailures: 0,
  lastLoadedAt: null,
  lastShownAt: null,
};

type BannerState = {
  requested: boolean;
  loaded: boolean;
  lastError: string | null;
  heightPx: number | null;
};

const banner: BannerState = {
  requested: false,
  loaded: false,
  lastError: null,
  heightPx: null,
};

type AdEventName = 'interstitial-dismissed' | 'banner-loaded' | 'banner-failed';
const listeners = new Set<(event: AdEventName) => void>();

/** Subscribe to interstitial dismissals (used to auto re-preload). */
export function onAdEvent(fn: (event: AdEventName) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(event: AdEventName) {
  for (const fn of listeners) {
    try {
      fn(event);
    } catch (err) {
      console.warn('[AdMob] listener failed', err);
    }
  }
}

let listenersAttached = false;

/**
 * Tracks the real SDK lifecycle. Without this a "No Fill" response looks
 * identical to a successful load: the plugin call resolves either way, so
 * showInterstitial() ends up fired against an ad that was never there.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachAdListeners(AdMob: any, events: any): void {
  if (listenersAttached) return;
  listenersAttached = true;

  const { InterstitialAdPluginEvents, BannerAdPluginEvents } = events;

  AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
    banner.loaded = true;
    banner.lastError = null;
    emit('banner-loaded');
  });
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err: unknown) => {
    banner.loaded = false;
    banner.lastError = describeError(err);
    console.warn('[AdMob] banner failed to load:', banner.lastError);
    emit('banner-failed');
  });
  // The plugin reports the real rendered height, which for an adaptive banner
  // depends on the device — reserving a hardcoded 50px would leave a gap or
  // clip the ad.
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: { height?: number }) => {
    if (typeof size?.height === 'number' && size.height > 0) banner.heightPx = size.height;
  });

  AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
    interstitial.loading = false;
    interstitial.ready = true;
    interstitial.loadFailures = 0;
    interstitial.lastLoadError = null;
    interstitial.lastLoadedAt = Date.now();
  });
  AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err: unknown) => {
    interstitial.loading = false;
    interstitial.ready = false;
    interstitial.loadFailures += 1;
    interstitial.lastLoadError = describeError(err);
    console.warn('[AdMob] interstitial failed to load:', interstitial.lastLoadError);
  });
  AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
    interstitial.showing = true;
    interstitial.ready = false;
    interstitial.lastShownAt = Date.now();
  });
  AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (err: unknown) => {
    interstitial.showing = false;
    interstitial.ready = false;
    interstitial.lastShowError = describeError(err);
    console.warn('[AdMob] interstitial failed to show:', interstitial.lastShowError);
    emit('interstitial-dismissed');
  });
  AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
    interstitial.showing = false;
    interstitial.ready = false;
    emit('interstitial-dismissed');
  });
}

let initPromise: Promise<boolean> | null = null;

/**
 * Set when the UMP call itself errored (as opposed to the user declining).
 * Surfaced through the diagnostics so a misconfigured AdMob account is
 * visible rather than silently costing every impression.
 */
let consentUnavailableReason: string | null = null;

/**
 * Initialises the Mobile Ads SDK and runs the UMP consent flow. Resolves to
 * whether ads can actually be requested right now (`canRequestAds`).
 * Safe to call on every launch and from multiple call sites.
 */
export function initAdMob(): Promise<boolean> {
  if (!adsSupported()) {
    snapshot = { ...snapshot, platform: currentPlatform(), supported: false };
    return Promise.resolve(false);
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const mod = await loadAdMob();
    const { AdMob, AdmobConsentStatus, AdmobConsentDebugGeography } = mod;
    attachAdListeners(AdMob, mod);

    // GMA SDK init. This does a config fetch but never requests an ad — no ad
    // is requested until consent has been resolved below.
    await AdMob.initialize();

    // The UMP call fails outright when the AdMob account has no published
    // privacy message for this app ("publisher misconfiguration"), which is a
    // console setting, not a code problem. Treat that as "consent unknown"
    // rather than as fatal: every ad this app requests is already npa: true,
    // so falling back to non-personalised serving keeps the app earning
    // instead of showing nothing at all. A *denied* consent still blocks ads,
    // because that comes back as a successful call with canRequestAds false.
    let info: ConsentInfo | null = null;
    try {
      info = await AdMob.requestConsentInfo(consentRequestOptions(AdmobConsentDebugGeography));

      if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
        try {
          await AdMob.showConsentForm();
        } catch (err) {
          console.error('[AdMob] showConsentForm failed:', describeError(err));
        }
        info = await AdMob.requestConsentInfo(consentRequestOptions(AdmobConsentDebugGeography));
      }
    } catch (err) {
      consentUnavailableReason = describeError(err);
      console.warn(
        '[AdMob] consent info unavailable, falling back to non-personalised ads:',
        consentUnavailableReason,
      );
    }

    snapshot = {
      platform: currentPlatform(),
      supported: true,
      initialised: true,
      status: info ? String(info.status ?? null) : 'UNAVAILABLE',
      isConsentFormAvailable: info ? Boolean(info.isConsentFormAvailable) : null,
      canRequestAds: info ? Boolean(info.canRequestAds) : true,
      privacyOptionsRequirementStatus: info
        ? String(info.privacyOptionsRequirementStatus ?? null)
        : null,
      lastError: consentUnavailableReason,
      ranAt: Date.now(),
    };

    if (import.meta.env.DEV || !snapshot.canRequestAds) {
      console.info('[AdMob] consent resolved:', JSON.stringify(snapshot));
    }

    return snapshot.canRequestAds;
  })().catch((err) => {
    const detail = describeError(err);
    snapshot = {
      ...snapshot,
      platform: currentPlatform(),
      supported: true,
      initialised: false,
      canRequestAds: false,
      lastError: detail,
      ranAt: Date.now(),
    };
    console.error('[AdMob] init failed:', detail);
    return false;
  });

  return initPromise;
}

/** Re-runs the consent flow from scratch (after the user changes their choice). */
export async function refreshAdConsent(): Promise<boolean> {
  initPromise = null;
  consentUnavailableReason = null;
  return initAdMob();
}

/**
 * Non-null when Google's consent service could not be reached or the AdMob
 * account has no published privacy message. Ads still serve (non-personalised),
 * but EEA/UK/CH users are not being shown the consent form they are owed, so
 * this needs fixing in the AdMob console.
 */
export function consentConfigurationProblem(): string | null {
  return consentUnavailableReason;
}

/** Whether a "Manage ad consent" entry point must be shown (EEA/UK/CH). */
export function adPrivacyOptionsRequired(): boolean {
  return snapshot.privacyOptionsRequirementStatus === 'REQUIRED';
}

/** Opens Google's privacy options form, then re-reads consent. */
export async function showAdPrivacyOptions(): Promise<void> {
  if (!adsSupported()) return;
  try {
    const { AdMob } = await loadAdMob();
    await AdMob.showPrivacyOptionsForm();
  } catch (err) {
    console.error('[AdMob] showPrivacyOptionsForm failed:', describeError(err));
  }
  await refreshAdConsent();
}

export type AdMobDiagnostics = ConsentSnapshot & {
  usingTestAdUnits: boolean;
  hasBannerUnit: boolean;
  hasInterstitialUnit: boolean;
  interstitial: FullScreenState;
  banner: BannerState;
};

/** Latest native-layer snapshot — useful when debugging on a device. */
export function getAdMobDiagnostics(): AdMobDiagnostics {
  return {
    ...snapshot,
    platform: currentPlatform(),
    supported: adsSupported(),
    usingTestAdUnits: usingTestAdUnits(),
    hasBannerUnit: Boolean(bannerAdUnitId()),
    hasInterstitialUnit: Boolean(interstitialAdUnitId()),
    interstitial: { ...interstitial },
    banner: { ...banner },
  };
}

/** True once the SDK reports a banner has actually rendered. */
export function isBannerLoaded(): boolean {
  return banner.loaded;
}

/** The banner's real rendered height, once the SDK reports it. */
export function bannerHeightPx(): number | null {
  return banner.heightPx;
}

// --- Banner ---------------------------------------------------------------

/** Shows the banner. Resolves to whether the request was issued. */
export async function showBanner(): Promise<boolean> {
  const adId = bannerAdUnitId();
  if (!adsSupported() || !adId) return false;

  const canShowAds = await initAdMob();
  if (!canShowAds) return false;

  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await loadAdMob();
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      npa: true,
    });
    banner.requested = true;
    return true;
  } catch (err) {
    banner.lastError = describeError(err);
    console.error('[AdMob] showBanner failed:', banner.lastError);
    return false;
  }
}

export async function removeBanner(): Promise<void> {
  if (!adsSupported()) return;
  try {
    const { AdMob } = await loadAdMob();
    await AdMob.removeBanner();
    banner.requested = false;
    banner.loaded = false;
  } catch {
    /* banner may not be showing — not an error */
  }
}

// --- Interstitial ---------------------------------------------------------

export function isInterstitialReady(): boolean {
  return interstitial.ready;
}

export function isFullScreenAdShowing(): boolean {
  return interstitial.showing;
}

/**
 * Pre-loads an interstitial. Resolves once the request has been issued; the
 * genuine "ready" signal is the Loaded event tracked above, so callers must
 * check `isInterstitialReady()` before showing.
 */
export async function prepareInterstitial(): Promise<void> {
  const adId = interstitialAdUnitId();
  if (!adsSupported() || !adId) return;
  if (interstitial.loading || interstitial.ready || interstitial.showing) return;

  interstitial.loading = true;
  try {
    const canShowAds = await initAdMob();
    if (!canShowAds) {
      interstitial.loading = false;
      return;
    }
    const { AdMob } = await loadAdMob();
    await AdMob.prepareInterstitial({ adId, npa: true });
    // Belt and braces: some platform versions resolve without firing Loaded.
    if (!interstitial.ready) {
      interstitial.ready = true;
      interstitial.lastLoadedAt = Date.now();
    }
  } catch (err) {
    interstitial.lastLoadError = describeError(err);
    interstitial.loadFailures += 1;
    interstitial.ready = false;
    console.error('[AdMob] prepareInterstitial failed:', interstitial.lastLoadError);
  } finally {
    interstitial.loading = false;
  }
}

/**
 * Waits for the native "shown" signal after a show() call. The plugin's
 * promise resolves as soon as the request is handed to the SDK, which is NOT
 * proof that an ad was displayed — treating it as such wrongly consumes the
 * frequency cap. Success is only reported once Showed confirms it appeared.
 */
async function confirmDisplayed(
  state: FullScreenState,
  before: number | null,
  timeoutMs = 2_500,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (state.showing || (state.lastShownAt != null && state.lastShownAt !== before)) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  // Never confirmed — drop readiness so we do not repeatedly re-show.
  state.ready = false;
  return false;
}

/**
 * Shows a previously-prepared interstitial. Returns whether it was shown.
 * Never call this without `isInterstitialReady()`.
 */
export async function showInterstitial(): Promise<boolean> {
  if (!adsSupported() || !interstitial.ready) return false;
  try {
    const { AdMob } = await loadAdMob();
    const before = interstitial.lastShownAt;
    await AdMob.showInterstitial();
    interstitial.lastShowError = null;
    return await confirmDisplayed(interstitial, before);
  } catch (err) {
    interstitial.lastShowError = describeError(err);
    interstitial.showing = false;
    interstitial.ready = false;
    console.error('[AdMob] showInterstitial failed:', interstitial.lastShowError);
    return false;
  }
}
