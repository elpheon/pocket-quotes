# Outta Pocket — native iOS & Android

The web app is bundled into a Capacitor shell. Both platforms build from this
repo; there is no remote URL involved at runtime.

- iOS bundle ID: `com.outtapocket.app`
- Android applicationId: `com.nathan.pocketquotes`

  The two deliberately differ: the Firebase apps were registered under
  different ids, and each platform's config file must match its own id or
  push breaks. Do not "fix" one to match the other.
- Display name: **Outta Pocket**
- Capacitor 8, iOS via Swift Package Manager (no CocoaPods)

## Build cycle

Any change to the web app has to be rebuilt and synced before it shows up
natively:

```bash
npm run build && npx cap sync
```

Then:

```bash
npx cap open ios
```

```bash
npx cap open android
```

Command-line builds, for checking nothing is broken:

```bash
cd android && ./gradlew assembleDebug
```

```bash
cd ios/App && xcodebuild -scheme App -sdk iphonesimulator -configuration Release -destination 'generic/platform=iOS Simulator' build
```

## AdMob

Publisher `ca-app-pub-9415402287196761`.

**App IDs** (the `~` ones) live in the native projects, because the SDK reads
them at launch and a missing or wrong value crashes the app by design:

| Platform | Where | Value |
| --- | --- | --- |
| iOS | `ios/App/App/Info.plist` → `GADApplicationIdentifier` | `ca-app-pub-9415402287196761~5296295642` |
| Android | `android/app/src/main/AndroidManifest.xml` → `com.google.android.gms.ads.APPLICATION_ID` | `ca-app-pub-9415402287196761~3603428304` |

**Ad unit IDs** (the `/` ones) live in `.env`, so swapping test inventory for
live inventory never needs a code edit. `.env.example` documents the variables.

To run against Google's test ads instead, create `.env.local` (gitignored) with
the test unit IDs from
<https://developers.google.com/admob/ios/test-ads>, then `npm run build && npx cap sync`.

### How ads behave

- **Banner** — adaptive banner at the top of the feed. The feed reserves space
  only once the SDK reports a banner actually rendered, so a no-fill leaves no
  empty strip.
- **Interstitial** — after 6–9 quotes, and never more often than once every two
  minutes. The counter only resets when an ad genuinely displayed, so a no-fill
  does not silently burn the placement.
- Every request is **non-personalised** (`npa: true`). No IDFA, no advertising
  ID, no cross-app tracking, and therefore **no App Tracking Transparency
  prompt** — which removes the most common ad-related review rejection. If you
  ever want personalised ads, that decision also means adding ATT and changing
  the App Store privacy answers.

### One thing still to do in the AdMob console

Google's consent (UMP) call currently **fails** for this account:
`Request consent info failed`. That happens when no privacy message has been
published for the app under **Privacy & messaging → GDPR** (and **US states**)
in AdMob.

The app handles this gracefully — it falls back to non-personalised ads rather
than showing nothing — but until a message is published, EEA/UK/Swiss users are
not being shown the consent form they are entitled to. Publish the GDPR message
for both app IDs, and this resolves itself with no code change.

`consentConfigurationProblem()` in `src/lib/admob.ts` reports the reason if you
ever need to check it on a device.

## Still needed before submitting

- **App icon** — a 1024×1024 PNG with **no alpha channel** (App Store Connect
  rejects transparency). Both platforms currently carry the default Capacitor
  icon.
- **Splash screen** artwork. The splash background is set to `#0d1220` to match
  the app's dark theme.
- **Age rating.** The quote content is explicit — sexual references, violence,
  profanity. This needs to be rated accordingly (17+) in App Store Connect and
  Play Console. Under-rating it is a Guideline 1.1.4 rejection, and the
  in-app NSFW filter does not change the rating you must declare.
- **Apple Developer Program** access, to create the app record and sign builds.
- Privacy Policy and Support URLs are already live and linked in-app
  (`src/lib/urls.ts`).
