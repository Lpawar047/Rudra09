import React from 'react';

interface RudraLogoProps {
  className?: string;
  variant?: 'full' | 'symbol-only';
  height?: number | string;
}

export const RudraLogo: React.FC<RudraLogoProps> = ({
  className = '',
  variant = 'full',
  height = 48,
}) => {
  if (variant === 'symbol-only') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 260"
        height={height}
        className={`inline-block ${className}`}
      >
        <defs>
          <linearGradient id="goldGradSymbol" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="#FFD600" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="navyGradSymbol" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F1F1F" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* Outer Shield Navy */}
        <path
          d="M 120,20 L 210,50 C 210,140 185,200 120,230 C 55,200 30,140 30,50 Z"
          fill="none"
          stroke="url(#navyGradSymbol)"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        {/* Inner Shield Gold */}
        <path
          d="M 120,35 L 198,61 C 198,135 175,187 120,213 C 65,187 42,135 42,61 Z"
          fill="none"
          stroke="url(#goldGradSymbol)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Stylized R */}
        <path
          d="M 65,70 L 105,70 C 125,70 138,80 138,97 C 138,112 127,121 112,124 L 138,160 L 114,160 L 92,128 L 87,128 L 87,160 L 65,160 Z M 87,88 L 87,112 L 103,112 C 113,112 118,107 118,100 C 118,93 113,88 103,88 Z"
          fill="url(#navyGradSymbol)"
        />

        {/* 3 Ascending Gold Bars */}
        <rect x="142" y="120" width="10" height="40" rx="2" fill="url(#goldGradSymbol)" />
        <rect x="157" y="100" width="10" height="60" rx="2" fill="url(#goldGradSymbol)" />
        <rect x="172" y="80" width="10" height="80" rx="2" fill="url(#goldGradSymbol)" />

        {/* Automobile Silhouette */}
        <path
          d="M 35,197 C 50,180 75,167 105,165 C 145,163 185,170 202,181 C 212,187 214,197 210,203 C 200,209 170,213 120,213 C 70,213 40,209 35,197 Z"
          fill="url(#navyGradSymbol)"
        />
        <path
          d="M 75,172 C 90,158 130,158 165,170 C 140,165 100,165 75,172 Z"
          fill="#FFFFFF"
        />

        {/* Road Swoosh Gold */}
        <path
          d="M 75,213 C 120,213 180,185 245,175 C 185,200 130,245 105,265 C 80,245 65,225 75,213 Z"
          fill="url(#goldGradSymbol)"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 460"
        height={height}
        className="w-auto"
      >
        <defs>
          <linearGradient id="goldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="#FFD600" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>

          <linearGradient id="navyGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F1F1F" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* 1. SHIELD EMBLEM */}
        <g transform="translate(0, 10)">
          {/* Outer Deep Charcoal Shield */}
          <path
            d="M 250,30 L 340,60 C 340,150 315,210 250,240 C 185,210 160,150 160,60 Z"
            fill="none"
            stroke="url(#navyGradMain)"
            strokeWidth="12"
            strokeLinejoin="round"
          />
          {/* Inner Yellow Shield */}
          <path
            d="M 250,45 L 328,71 C 328,145 305,197 250,223 C 195,197 172,145 172,71 Z"
            fill="none"
            stroke="url(#goldGradMain)"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* 2. STYLIZED 'R' */}
          <path
            d="M 195,80 L 235,80 C 255,80 268,90 268,107 C 268,122 257,131 242,134 L 268,170 L 244,170 L 222,138 L 217,138 L 217,170 L 195,170 Z M 217,98 L 217,122 L 233,122 C 243,122 248,117 248,110 C 248,103 243,98 233,98 Z"
            fill="url(#navyGradMain)"
          />

          {/* 3. ASCENDING GOLD BARS */}
          <rect x="272" y="130" width="10" height="40" rx="2" fill="url(#goldGradMain)" />
          <rect x="287" y="110" width="10" height="60" rx="2" fill="url(#goldGradMain)" />
          <rect x="302" y="90" width="10" height="80" rx="2" fill="url(#goldGradMain)" />

          {/* 4. AUTOMOBILE SILHOUETTE */}
          <path
            d="M 165,207 C 180,190 205,177 235,175 C 275,173 315,180 332,191 C 342,197 344,207 340,213 C 330,219 300,223 250,223 C 200,223 170,219 165,207 Z"
            fill="url(#navyGradMain)"
          />
          <path
            d="M 205,182 C 220,168 260,168 295,180 C 270,175 230,175 205,182 Z"
            fill="#FFFFFF"
          />

          {/* 5. ROAD SWOOSH */}
          <path
            d="M 205,223 C 250,223 310,195 375,185 C 315,210 260,255 235,275 C 210,255 195,235 205,223 Z"
            fill="url(#goldGradMain)"
          />
          <path
            d="M 235,275 C 265,245 325,205 375,185 C 330,210 270,260 235,275 Z"
            fill="url(#navyGradMain)"
          />
        </g>

        {/* 6. MAIN BRAND NAME - RUDRA */}
        <text
          x="250"
          y="350"
          textAnchor="middle"
          fontFamily="'Montserrat', 'Arial Black', 'Helvetica', sans-serif"
          fontSize="64"
          fontWeight="900"
          letterSpacing="6"
          fill="#111111"
        >
          RUDRA
        </text>

        {/* 7. SERVICES TEXT WITH GOLD LINES */}
        <line x1="85" y1="398" x2="175" y2="398" stroke="url(#goldGradMain)" strokeWidth="3.5" strokeLinecap="round" />
        <text
          x="250"
          y="406"
          textAnchor="middle"
          fontFamily="'Montserrat', 'Arial', 'Helvetica', sans-serif"
          fontSize="26"
          fontWeight="800"
          letterSpacing="14"
          fill="url(#goldGradMain)"
        >
          SERVICES
        </text>
        <line x1="325" y1="398" x2="415" y2="398" stroke="url(#goldGradMain)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
