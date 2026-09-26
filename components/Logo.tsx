import Link from "next/link";

/** Arcway's own mark: a route rising over an arch to a destination node. Not derived from the Arc logo. */
export function LogoMark({ className = "logo__mark", id = "aw-mark" }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3D91BE" />
          <stop offset="1" stopColor="#193F7A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <path d="M8 23v-6a8 8 0 0 1 16 0" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="22" r="2.8" fill="#C9EAF3" />
    </svg>
  );
}

export function Logo({ id }: { id?: string }) {
  return (
    <Link href="/" className="logo" aria-label="Arcway home">
      <LogoMark id={id} />
      <span className="logo__word">arcway</span>
    </Link>
  );
}
