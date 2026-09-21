/**
 * Loading indicator built from the same rotated-square motif as
 * GeometricBackground, so it reads as part of the app rather than a generic
 * spinner: three counter-rotating diamonds, a sweeping arc, and a pulsing core.
 *
 * Drawn in `currentColor` so it inherits the surrounding text colour and works
 * in both themes without a second copy. Honours prefers-reduced-motion — every
 * animation is disabled in `index.css`, leaving a static mark.
 */

interface FuturisticLoaderProps {
  /** Rendered size in px. */
  size?: number;
  className?: string;
  /** Accessible label; set to null inside a container that already labels it. */
  label?: string | null;
}

export function FuturisticLoader({
  size = 72,
  className,
  label = 'Loading',
}: FuturisticLoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`loader-mark text-foreground ${className ?? ''}`}
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        {/* Fades the sweeping arc out along its own length. */}
        <linearGradient id="loader-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Outer diamond — slowest, clockwise. */}
      <rect
        className="loader-spin-slow"
        x="18"
        y="18"
        width="64"
        height="64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.35"
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Middle diamond — counter-rotating, so the two cross constantly. */}
      <rect
        className="loader-spin-reverse"
        x="28"
        y="28"
        width="44"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Inner diamond — fastest, carries the most weight. */}
      <rect
        className="loader-spin-fast"
        x="37"
        y="37"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Sweep: an arc that orbits the whole mark and gives it direction. */}
      <circle
        className="loader-sweep"
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#loader-sweep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="70 213"
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Core. */}
      <circle className="loader-pulse" cx="50" cy="50" r="3.5" fill="currentColor" />
    </svg>
  );
}
