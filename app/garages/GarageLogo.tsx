interface GarageLogoProps {
  name: string;
  size?: number;
}

export function GarageLogo({ name, size = 120 }: GarageLogoProps) {
  const gradientId = `garageGradient-${name.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Toit du garage */}
        <path
          d="M20 40 L60 20 L100 40 L100 80 L20 80 Z"
          fill={`url(#${gradientId})`}
          stroke="#0ea5e9"
          strokeWidth="2"
        />

        {/* Porte du garage */}
        <rect x="40" y="60" width="40" height="20" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" rx="2" />

        {/* Voiture stylisée à l'intérieur */}
        <ellipse cx="60" cy="70" rx="12" ry="6" fill="#0ea5e9" fillOpacity="0.6" />
        <rect x="50" y="68" width="20" height="4" fill="#0ea5e9" fillOpacity="0.4" rx="1" />

        {/* Texte du nom */}
        <text
          x="60"
          y="100"
          fontSize="16"
          fontWeight="bold"
          fill="#0f172a"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {name.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
