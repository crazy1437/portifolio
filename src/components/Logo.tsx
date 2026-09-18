/**
 * JuicyBruh brand assets.
 *
 * The mark is a chunky burger badge with a drip running off the patty —
 * the drips form the "J" silhouette. Pure SVG so it stays crisp at favicon
 * and hero sizes, and inherits the app's border/shadow language.
 */

const INK = "#241a12";

export function JuicyMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="JuicyBruh logo">
      {/* badge */}
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#ff5c1f" stroke={INK} strokeWidth="3" />
      {/* bun top */}
      <path
        d="M14 30c0-9.4 8-16 18-16s18 6.6 18 16c0 2-1.6 3-3.5 3h-29C15.6 33 14 32 14 30Z"
        fill="#ffd23f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* seeds */}
      <circle cx="24" cy="24" r="1.6" fill={INK} />
      <circle cx="32" cy="21.5" r="1.6" fill={INK} />
      <circle cx="40" cy="24" r="1.6" fill={INK} />
      {/* lettuce ruff */}
      <path
        d="M14 33h36c1.5 0 2.5 1.4 1.8 2.8l-1.4 2.7c-.9 1.8-2 1.3-2.9.2-1-1.2-2.6-1.2-3.6 0-1 1.2-2.6 1.2-3.6 0-1-1.2-2.6-1.2-3.6 0-1 1.2-2.6 1.2-3.6 0-1-1.2-2.6-1.2-3.6 0-1 1.2-2.6 1.2-3.6 0-1-1.2-2.6-1.2-3.6 0-.9 1.1-2 1.6-2.9-.2l-1.4-2.7C11.5 34.4 12.5 33 14 33Z"
        fill="#8fe04a"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* patty with the juicy drip (the "J") */}
      <path
        d="M14 40h36v6c0 2-1.6 3-3.5 3H34c-1.7 0-3 1.3-3 3v2.5a3.5 3.5 0 1 1-7 0V49h-6c-2.4 0-4-1.3-4-3v-6Z"
        fill="#7a5638"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* drip shine */}
      <circle cx="29" cy="52.5" r="1.4" fill="#f43f6e" />
    </svg>
  );
}

export function Wordmark({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`font-display text-2xl font-black tracking-tight ${className}`}>
      Juicy
      <span className={dark ? "text-mango-300" : "text-pepper-500"}>Bruh</span>
    </span>
  );
}

/** Mark + wordmark locked together, links home. */
export function LogoLockup({
  dark = false,
  markClass = "h-10 w-10",
  className = "",
}: {
  dark?: boolean;
  markClass?: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <JuicyMark className={markClass} />
      <Wordmark dark={dark} />
    </span>
  );
}
