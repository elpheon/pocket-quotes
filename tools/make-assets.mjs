/**
 * Turns the single supplied 1024px app icon into every asset the two native
 * projects need, then `npm run assets` hands the results to capacitor-assets.
 *
 * Run it rather than editing platform assets by hand — clients re-send
 * artwork, and this has to be reproducible.
 *
 *   npm run assets
 *
 * Two things this handles that a plain resize does not:
 *
 * 1. The artwork arrived as a JPEG named .png. App Store Connect rejects an
 *    app icon that is not really a PNG, and it only finds out at upload, so
 *    everything here is re-encoded through sharp's png().
 *
 * 2. The mark is white-on-dark. Dropped straight onto a light splash it would
 *    be invisible, so the mark is lifted off its background into an alpha mask
 *    and re-tinted per surface: dark mark on the light splash, white mark on
 *    the dark one.
 */

import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-source', 'icon.png');
const OUT = path.join(ROOT, 'assets');

/** Sampled from the supplied icon's own corners, not guessed. */
const ICON_BG = { r: 26, g: 24, b: 27, alpha: 1 };
/** The app's light and dark --background tokens from src/index.css. */
const LIGHT_BG = { r: 241, g: 244, b: 248, alpha: 1 };
const DARK_BG = { r: 13, g: 18, b: 32, alpha: 1 };
/** The app's dark --foreground, used to draw the mark on the light splash. */
const INK = { r: 13, g: 18, b: 32 };
const WHITE = { r: 255, g: 255, b: 255 };

const SPLASH = 2732;

await mkdir(OUT, { recursive: true });

// --- 1. App icon -----------------------------------------------------------
// Square, opaque, real PNG. An alpha channel here is an App Store rejection
// and renders black in the Android launcher.
await sharp(SRC)
  .flatten({ background: ICON_BG })
  .resize(1024, 1024, { fit: 'cover' })
  .png()
  .toFile(path.join(OUT, 'icon-only.png'));

// --- 2. The mark, lifted off its background --------------------------------
// The artwork is a light mark on a dark field, so its luminance is already the
// coverage mask. Joining that as the alpha channel of a solid colour gives a
// re-tintable mark on transparency.
const { width: mw, height: mh } = { width: 1024, height: 1024 };

// threshold() rather than normalise(): the artwork arrived as a JPEG, so its
// "flat" background carries compression noise. Normalising leaves that noise
// as a few units of alpha, which is enough to defeat trim() later and to haze
// the mark's edges. A hard cut gives a clean two-level coverage mask.
const maskRaw = await sharp(SRC)
  .resize(mw, mh, { fit: 'cover' })
  .greyscale()
  .threshold(128)
  .raw()
  .toBuffer();

// Clear the outermost pixel frame. The supplied JPEG carries a bright 1px
// column at x=0 — an encoder edge artifact, not artwork — and being full
// height it survives any per-row filter and drags the left bound to 0, which
// shows up as a hairline down the side of every generated asset. Real artwork
// never legitimately lives in only the edge pixel.
for (let x = 0; x < mw; x++) {
  maskRaw[x] = 0;
  maskRaw[(mh - 1) * mw + x] = 0;
}
for (let y = 0; y < mh; y++) {
  maskRaw[y * mw] = 0;
  maskRaw[y * mw + (mw - 1)] = 0;
}

/** The mark alone, in `colour`, on a transparent canvas. */
function tintedMark(colour) {
  return sharp({
    create: { width: mw, height: mh, channels: 3, background: colour },
  })
    .joinChannel(maskRaw, { raw: { width: mw, height: mh, channels: 1 } })
    .png();
}

/**
 * Bounding box of the mark, measured from the coverage mask directly.
 *
 * sharp's trim() compares colour and ignores alpha, and a tinted mark is a
 * single flat colour whose only variation *is* the alpha — so trim() sees a
 * uniform image and removes nothing. Scanning the mask is also exact, where
 * trim() would depend on a threshold.
 */
function markBounds() {
  const rows = new Array(mh).fill(0);
  const cols = new Array(mw).fill(0);
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      if (maskRaw[y * mw + x] < 128) continue;
      rows[y]++;
      cols[x]++;
    }
  }

  // A row or column has to carry more than a trace of the mark to count. The
  // supplied JPEG has a single-pixel bright column running its full height —
  // without a floor, that one artifact alone defines the bounding box and the
  // mark ends up scaled as if it filled the canvas.
  const floor = (n) => Math.max(2, Math.round(n * 0.005));
  const span = (counts, limit) => {
    const first = counts.findIndex((c) => c >= limit);
    let last = -1;
    for (let i = counts.length - 1; i >= 0; i--) {
      if (counts[i] >= limit) {
        last = i;
        break;
      }
    }
    return [first, last];
  };

  const [top, bottom] = span(rows, floor(mw));
  const [left, right] = span(cols, floor(mh));
  if (top < 0 || left < 0) throw new Error('assets-source/icon.png has no mark to extract');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

const BOUNDS = markBounds();

/** The mark in `colour`, cropped to its own extents on transparency. */
async function croppedMark(colour) {
  return sharp(await tintedMark(colour).toBuffer()).extract(BOUNDS).png().toBuffer();
}

const trimmed = await croppedMark(WHITE);
const trimmedMeta = await sharp(trimmed).metadata();

// --- 3. Android adaptive icon ---------------------------------------------
// Android masks the foreground to a circle inscribed in the safe zone (66% of
// the canvas). Artwork drawn to the edges gets clipped, so the mark is scaled
// into that zone and centred on a transparent canvas.
const SAFE = Math.round(1024 * 0.66);
const safeMark = await sharp(trimmed)
  .resize(SAFE, SAFE, { fit: 'inside' })
  .png()
  .toBuffer();
const safeMeta = await sharp(safeMark).metadata();

await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    {
      input: safeMark,
      top: Math.round((1024 - safeMeta.height) / 2),
      left: Math.round((1024 - safeMeta.width) / 2),
    },
  ])
  .png()
  .toFile(path.join(OUT, 'icon-foreground.png'));

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: ICON_BG } })
  .png()
  .toFile(path.join(OUT, 'icon-background.png'));

// --- 4. Splash screens -----------------------------------------------------
// Sized against the screen, not the canvas: the platforms aspect-fill this
// square into a portrait screen, so only the middle band of it is ever seen.
// 900px lands the mark at roughly half the screen width.
const SPLASH_MARK = 900;

async function writeSplash(file, background, markColour) {
  const mark = await sharp(await croppedMark(markColour))
    .resize(SPLASH_MARK, SPLASH_MARK, { fit: 'inside' })
    .png()
    .toBuffer();
  const { width, height } = await sharp(mark).metadata();

  await sharp({ create: { width: SPLASH, height: SPLASH, channels: 4, background } })
    .composite([
      {
        input: mark,
        top: Math.round((SPLASH - height) / 2),
        left: Math.round((SPLASH - width) / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT, file));
}

// The native splash hands over to BootSplash, which paints the app's own
// themed background — so each splash matches the theme it will hand over to.
await writeSplash('splash.png', LIGHT_BG, INK);
await writeSplash('splash-dark.png', DARK_BG, WHITE);

console.log(
  `mark occupies ${trimmedMeta.width}x${trimmedMeta.height} of ${mw}x${mh}; ` +
    `adaptive foreground inset to ${safeMeta.width}x${safeMeta.height} (66% safe zone)`,
);
