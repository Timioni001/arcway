import Link from "next/link";

/** Arcway's own mark: a route rising over an arch to a destination node. Not derived from the Arc logo. */
export function LogoMark({ className = "logo__mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#07152F" stroke="rgba(170,205,255,.18)" />
      <path d="M8 23v-6a8 8 0 0 1 16 0" stroke="#EAF5FF" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="22" r="2.6" fill="#3B82F6" />
      <circle cx="24" cy="22" r="5" fill="#3B82F6" opacity=".18" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Arcway home">
      <LogoMark />
      <span className="logo__word">arcway</span>
    </Link>
  );
}
