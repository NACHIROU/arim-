import React from "react";

interface LogoProps {
  className?: string;
  variant?: "default" | "dark" | "white";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "default",
  size = "md",
}) => {
  // Dimensions par défaut basées sur la taille
  const heightMap = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
    xl: "h-16",
  };

  const appliedHeight = className.includes("h-") ? "" : heightMap[size];

  // Identifiant unique pour les gradients SVG afin d'éviter les collisions
  const gradientId = variant === "dark" ? "ahimin-dark-grad" : variant === "white" ? "ahimin-white-grad" : "ahimin-primary-grad";

  return (
    <div className={`inline-flex items-center select-none ${appliedHeight} ${className}`}>
      <svg
        viewBox="0 0 200 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible transition-transform duration-200"
        aria-label="Ahimin Logo"
      >
        <defs>
          {/* Gradient Orange / Ambre signature */}
          <linearGradient id="ahimin-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" /> {/* orange-400 */}
            <stop offset="50%" stopColor="#F97316" /> {/* orange-500 */}
            <stop offset="100%" stopColor="#EA580C" /> {/* orange-600 */}
          </linearGradient>

          {/* Gradient pour fond sombre */}
          <linearGradient id="ahimin-dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFEDD5" /> {/* orange-100 */}
            <stop offset="100%" stopColor="#FB923C" /> {/* orange-400 */}
          </linearGradient>

          {/* Gradient Blanc Pur avec brillance */}
          <linearGradient id="ahimin-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          {/* Filtre subtil de lueur (glow) */}
          <filter id="ahimin-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#F97316" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Tracé de fond décoratif / swoosh élégant */}
        <path
          d="M 125 18 C 145 14, 175 16, 188 24 C 193 27, 191 32, 186 31 C 182 30, 183 25, 178 24"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Point sur le i avec style bulle moderne */}
        <circle
          cx="108"
          cy="20"
          r="3"
          fill={`url(#${gradientId})`}
        />

        {/* Texte en écriture cursive élégante Ahimin */}
        <text
          x="8"
          y="45"
          fontFamily="'Dancing Script', 'Brush Script MT', 'Caveat', cursive"
          fontSize="46"
          fontWeight="700"
          fontStyle="italic"
          fill={`url(#${gradientId})`}
          style={{
            letterSpacing: "1px",
            filter: variant === "default" ? "url(#ahimin-glow)" : undefined,
          }}
        >
          Ahimin
        </text>

        {/* Petite virgule/flourish sous le mot */}
        <path
          d="M 38 52 C 70 57, 130 57, 170 48"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export default Logo;
