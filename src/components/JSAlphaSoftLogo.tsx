import React from 'react';

export interface AtmosAirconLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
  isDarkTheme?: boolean;
  iconSize?: number;
}

export const AtmosAirconLogo: React.FC<AtmosAirconLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  isDarkTheme = false,
  iconSize
}) => {
  // Dimensions map
  const dimensions = {
    xs: { icon: 20, width: 90, height: 24, text: 'text-xs' },
    sm: { icon: 28, width: 130, height: 32, text: 'text-sm' },
    md: { icon: 38, width: 175, height: 44, text: 'text-base' },
    lg: { icon: 52, width: 230, height: 58, text: 'text-xl' },
    xl: { icon: 72, width: 300, height: 78, text: 'text-2xl' }
  }[size];

  // SVG Icon Component containing the exact Atmos Aircon emblem:
  // - Stylized Blue 'A'/'J' swooshing down and left
  // - Stylized Orange aerodynamic vortex with digital matrix blocks
  // - Sweeping bottom orbit swoosh connecting blue to orange
  const LogoEmblem = ({ emblemSize = 36 }: { emblemSize?: number }) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs select-none"
    >
      <defs>
        {/* Blue Gradient for 'J' and left swoosh */}
        <linearGradient id="jsBlueGrad" x1="20" y1="20" x2="110" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0080FF" />
          <stop offset="50%" stopColor="#0062E0" />
          <stop offset="100%" stopColor="#0C349C" />
        </linearGradient>

        {/* Orange Gradient for 'S' */}
        <linearGradient id="jsOrangeGrad" x1="75" y1="25" x2="165" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF931E" />
          <stop offset="45%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#D93800" />
        </linearGradient>

        {/* Swoosh Gradient spanning blue to fiery orange */}
        <linearGradient id="jsSwooshGrad" x1="10" y1="130" x2="185" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A2D8A" />
          <stop offset="25%" stopColor="#0066E0" />
          <stop offset="55%" stopColor="#B32B00" />
          <stop offset="85%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#FF8800" />
        </linearGradient>
      </defs>

      {/* --- Pixel matrix blocks floating from top-right of 'S' --- */}
      <rect x="166" y="28" width="6" height="6" fill="#FF7700" rx="0.5" />
      <rect x="175" y="32" width="6.5" height="6.5" fill="#FF5E00" rx="0.5" />
      <rect x="162" y="38" width="7" height="7" fill="#FF8000" rx="0.5" />
      <rect x="172" y="42" width="8" height="8" fill="#FF5000" rx="0.5" />
      <rect x="183" y="42" width="6.5" height="6.5" fill="#FF6A00" rx="0.5" />
      <rect x="156" y="48" width="8" height="8" fill="#FF7A00" rx="0.5" />
      <rect x="168" y="52" width="8" height="8" fill="#FF4800" rx="0.5" />
      <rect x="179" y="55" width="7" height="7" fill="#FF5E00" rx="0.5" />
      <rect x="171" y="65" width="7" height="7" fill="#FF5500" rx="0.5" />
      <rect x="180" y="67" width="5" height="5" fill="#FF7700" rx="0.5" />

      {/* --- Letter 'J' with dynamic thick stroke & rounded angle --- */}
      <path
        d="M 82 25 
           L 109 25 
           C 107 45, 96 75, 84 98 
           C 78 110, 68 120, 52 121 
           L 44 121 
           C 36 121, 31 113, 34 104 
           L 40 85 
           L 58 85 
           C 54 94, 57 99, 65 99 
           C 73 99, 81 90, 89 74 
           C 95 62, 99 43, 100 25 
           Z"
        fill="url(#jsBlueGrad)"
      />

      {/* Alternative sharper 'J' shape overlay for geometric precision */}
      <path
        d="M 84 25
           H 112
           L 96 78
           C 91 95, 78 107, 60 107
           H 46
           L 52 87
           H 61
           C 69 87, 74 81, 77 73
           Z"
        fill="url(#jsBlueGrad)"
      />

      {/* --- Letter 'S' with bold diagonal slant and curved apertures --- */}
      <path
        d="M 112 25
           H 158
           C 152 40, 142 47, 126 47
           H 108
           C 104 53, 107 58, 114 59
           H 136
           C 153 59, 159 70, 152 86
           C 144 104, 128 112, 108 112
           H 78
           L 98 68
           H 114
           C 123 68, 129 74, 127 80
           C 125 86, 119 90, 111 90
           H 99
           L 106 72
           C 107 65, 103 62, 94 61
           C 87 60, 85 54, 88 47
           C 92 34, 101 25, 112 25
           Z"
        fill="url(#jsOrangeGrad)"
      />

      {/* High-definition smooth stylized 'S' curve path */}
      <path
        d="M 114 26
           H 156
           L 150 44
           H 124
           C 117 44, 114 47, 115 50
           C 116 53, 120 55, 127 55
           H 138
           C 156 55, 162 67, 155 83
           C 148 100, 131 109, 110 109
           H 76
           L 84 91
           H 108
           C 118 91, 124 86, 126 80
           C 128 74, 124 71, 116 71
           H 105
           C 87 71, 83 58, 89 44
           C 95 31, 104 26, 114 26
           Z"
        fill="url(#jsOrangeGrad)"
      />

      {/* --- Sweeping Dynamic Bottom Orbit Crescent Swoosh --- */}
      <path
        d="M 40 85
           C 25 96, 16 112, 23 125
           C 33 143, 72 147, 120 132
           C 152 122, 178 98, 185 75
           C 178 88, 155 106, 124 116
           C 78 129, 44 125, 36 112
           C 31 102, 35 93, 40 85
           Z"
        fill="url(#jsSwooshGrad)"
      />

      {/* Additional sparkling accent dots on the swoosh */}
      <rect x="150" y="93" width="4.5" height="4.5" fill="#FF8800" rx="0.5" />
      <rect x="160" y="85" width="4" height="4" fill="#FFAA33" rx="0.5" />
      <rect x="170" y="77" width="3.5" height="3.5" fill="#FFCC66" rx="0.5" />
    </svg>
  );

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <LogoEmblem emblemSize={iconSize || dimensions.icon} />
      </div>
    );
  }

  // Full Horizontal or Vertical Logo
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <LogoEmblem emblemSize={dimensions.icon} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1">
          <span className={`font-black tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'} ${dimensions.text}`}>
            <span className="text-[#0066E0]">HVAC</span>
            <span className="ml-1 text-slate-800 dark:text-slate-100">Biz</span>
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-orange-500/15 to-blue-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 rounded tracking-wider uppercase font-mono">
            AlphaERP
          </span>
        </div>
        <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
          Enterprise HVAC Solutions
        </span>
      </div>
    </div>
  );
};

// Backwards-compatible aliases for existing imports
export const HVACBizLogo = AtmosAirconLogo;
export type HVACBizLogoProps = AtmosAirconLogoProps;
export const JSAlphaSoftLogo = AtmosAirconLogo;
export type JSAlphaSoftLogoProps = AtmosAirconLogoProps;

