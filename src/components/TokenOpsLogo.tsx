import { Link } from "@tanstack/react-router";

type Props = {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
};

/**
 * TokenOps Atlas brand mark — a gold "token coin" with an
 * ascending bar chart inside (rising cost / savings curve).
 */
export function TokenOpsLogo({
  size = 36,
  showWordmark = true,
  showTagline = false,
  className = "",
}: Props) {
  return (
    <Link to="/" className={`to-logo flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="to-coin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4D08A" />
            <stop offset="55%" stopColor="#E8B964" />
            <stop offset="100%" stopColor="#C9963F" />
          </linearGradient>
          <linearGradient id="to-bars" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0A0B10" />
            <stop offset="100%" stopColor="#1A1C26" />
          </linearGradient>
        </defs>
        {/* outer coin */}
        <circle cx="32" cy="32" r="30" fill="url(#to-coin)" />
        {/* inner ring */}
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="#0B0D14"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {/* ascending bars */}
        <g>
          <rect x="20" y="36" width="5" height="8" rx="1" fill="url(#to-bars)" stroke="#E8B964" strokeWidth="1" />
          <rect x="28" y="30" width="5" height="14" rx="1" fill="url(#to-bars)" stroke="#E8B964" strokeWidth="1" />
          <rect x="36" y="24" width="5" height="20" rx="1" fill="url(#to-bars)" stroke="#F0C674" strokeWidth="1" />
          <rect x="44" y="18" width="5" height="26" rx="1" fill="#E8B964" />
        </g>
        {/* sparkle */}
        <circle cx="48" cy="20" r="1.6" fill="#4DD8C4" />
      </svg>
      {showWordmark && (
        <div className="leading-tight">
          <span className="brand-wordmark block text-[15px] font-semibold tracking-wide">
            TokenOps <span className="to-gold-text">Atlas</span>
          </span>
          {showTagline && (
            <span className="to-eyebrow block text-[10px]">
              FINOPS FOR LLM TOKENS
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
