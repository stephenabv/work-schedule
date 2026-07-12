export default function Logo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WorkSched logo"
      className={className}
    >
      <defs>
        <linearGradient
          id="ws-logo-gradient"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Tile */}
      <rect width="64" height="64" rx="15" fill="url(#ws-logo-gradient)" />
      {/* Staggered schedule blocks */}
      <rect x="13" y="16" width="26" height="8" rx="4" fill="white" />
      <rect x="21" y="28" width="30" height="8" rx="4" fill="white" opacity="0.85" />
      <rect x="13" y="40" width="18" height="8" rx="4" fill="white" opacity="0.7" />
      {/* "Now" dot */}
      <circle cx="41" cy="44" r="4" fill="white" opacity="0.7" />
    </svg>
  );
}
