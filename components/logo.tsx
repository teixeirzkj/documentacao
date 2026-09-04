const SIZES = {
  sm: { text: "text-lg", mic: 11, gap: "-mb-4", px: 32 },
  lg: { text: "text-3xl", mic: 16, gap: "-mb-6", px: 56 },
} as const;

export function Logo({ size = "sm", logoUrl }: { size?: keyof typeof SIZES; logoUrl?: string | null }) {
  const { text, mic, gap, px } = SIZES[size];

  if (logoUrl) {
    // Plain <img> (not next/image) so the browser sizes it from the file's
    // real aspect ratio instead of a hardcoded width/height that would
    // distort whatever shape a future logo upload happens to have.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="Logo" style={{ height: px, width: "auto" }} className="object-contain" />;
  }

  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight ${text}`}>
      <span className="text-(--color-text)">Fr</span>
      <span className="relative text-(--color-primary)">
        <svg
          width={mic}
          height={mic}
          viewBox="0 0 24 24"
          fill="none"
          className={`absolute left-1/2 top-0 block -translate-x-1/2 -translate-y-full ${gap} rotate-[18deg]`}
        >
          <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
          <path
            d="M5 11a7 7 0 0 0 14 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        édy
      </span>
    </span>
  );
}
