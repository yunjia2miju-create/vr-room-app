import React from 'react';
import { Star, Phone, ShieldCheck } from 'lucide-react';

export type WatermarkPosition = 'center' | 'bottom-right' | 'top-left' | 'all';

// Custom Orange Building Icon matching the uploaded logo
export const TaewangLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`shrink-0 drop-shadow-md ${className}`}
  >
    {/* Orange Building Body */}
    <path 
      d="M10 38 C10 26 22 22 34 22 L52 22 C58 22 62 18 62 12 C62 6 68 2 76 2 L84 2 C92 2 96 6 96 12 L96 74 C96 78 92 80 86 80 L10 80 L10 38 Z" 
      fill="#FF6600" 
    />
    {/* Left Window Dot */}
    <circle cx="30" cy="46" r="5" fill="white" />
    {/* Right Window Rectangles */}
    <rect x="52" y="36" width="22" height="7" rx="3.5" fill="white" />
    <rect x="52" y="50" width="22" height="7" rx="3.5" fill="white" />
    {/* Door */}
    <path 
      d="M66 80 L66 62 C66 57 72 57 78 57 C84 57 84 62 84 80 Z" 
      fill="white" 
    />
  </svg>
);

export interface WatermarkProps {
  position?: WatermarkPosition;
  customCenterText?: string;
  customBottomText?: string;
  customTopText?: string;
  opacity?: number; // 0.1 to 1.0
  officeName?: string;
  phone?: string;
  showIcon?: boolean;
  compact?: boolean; // When true, renders appropriately scaled down for small preview grid containers
}

export const WatermarkOverlay: React.FC<WatermarkProps> = ({
  position = 'all',
  customCenterText,
  customBottomText,
  customTopText,
  opacity = 0.9,
  officeName = '태왕공인중개사사무소',
  phone = '054-455-6789',
  showIcon = true,
  compact = false,
}) => {
  const styleOpacity = { opacity };

  if (compact) {
    const renderCompactTopLeft = () => (
      <div 
        style={styleOpacity} 
        className="absolute top-1 left-1 z-20 bg-gradient-to-r from-[#ff6600]/90 to-[#e65c00]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1 border border-white/20 backdrop-blur-2xs select-none max-w-[88%] truncate pointer-events-none"
      >
        {showIcon && <Star size={10} fill="currentColor" className="text-yellow-300 shrink-0" />}
        <span className="truncate">{customTopText || `⭐ [태왕 360 VR] 현장검증`}</span>
      </div>
    );

    const renderCompactCenter = () => (
      <div 
        style={styleOpacity}
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-1"
      >
        <div className="bg-black/45 text-white border border-white/30 backdrop-blur-2xs rounded-md px-2 py-0.5 text-[10px] font-black tracking-tight flex items-center gap-1 shadow-xs select-none text-center max-w-[92%] whitespace-nowrap overflow-hidden text-ellipsis">
          {showIcon && (
            <TaewangLogoIcon className="w-3.5 h-3.5 shrink-0 opacity-95" />
          )}
          <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-white truncate">
            {customCenterText || `${officeName} 360 VR`}
          </span>
        </div>
      </div>
    );

    const renderCompactBottomRight = () => (
      <div 
        style={styleOpacity} 
        className="absolute bottom-1 right-1 z-20 bg-gray-950/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1 border border-white/20 backdrop-blur-2xs select-none max-w-[88%] truncate pointer-events-none"
      >
        {showIcon && <Phone size={10} className="text-[#ff6600] shrink-0" />}
        <span className="truncate">{customBottomText || `📞 ${phone} (태왕)`}</span>
      </div>
    );

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
        {(position === 'top-left' || position === 'all') && renderCompactTopLeft()}
        {(position === 'center' || position === 'all') && renderCompactCenter()}
        {(position === 'bottom-right' || position === 'all') && renderCompactBottomRight()}
      </div>
    );
  }

  // Full size / standard overlay
  const renderTopLeft = () => (
    <div 
      style={styleOpacity} 
      className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 z-20 bg-gradient-to-r from-[#ff6600]/90 to-[#e65c00]/90 text-white text-[10px] sm:text-xs md:text-sm font-extrabold px-2 py-1 sm:px-3 sm:py-1 md:px-3.5 md:py-1.5 rounded-md sm:rounded-lg md:rounded-xl shadow-md flex items-center gap-1 sm:gap-1.5 border border-white/30 backdrop-blur-xs select-none max-w-[85%] truncate"
    >
      {showIcon && <Star size={13} fill="currentColor" className="text-yellow-300 shrink-0" />}
      <span className="truncate">{customTopText || `⭐ [태왕 360 VR] 100% 현장 검증 실매물`}</span>
    </div>
  );

  const renderCenter = () => (
    <div 
      style={styleOpacity}
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-2 sm:p-4 md:p-6"
    >
      <div className="bg-black/35 text-white border border-white/35 backdrop-blur-xs rounded-xl sm:rounded-2xl md:rounded-3xl px-3 py-1.5 sm:px-5 sm:py-2.5 md:px-8 md:py-4 text-xs sm:text-base md:text-xl lg:text-2xl font-black tracking-tight flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 shadow-xl select-none text-center max-w-[92%] whitespace-nowrap overflow-hidden text-ellipsis">
        {showIcon && (
          <TaewangLogoIcon className="w-4 h-4 sm:w-6 sm:h-6 md:w-9 md:h-9 shrink-0 opacity-100" />
        )}
        <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] text-white truncate">
          {customCenterText || `${officeName} 360 VR 실매물`}
        </span>
      </div>
    </div>
  );

  const renderBottomRight = () => (
    <div 
      style={styleOpacity} 
      className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 z-20 bg-gray-950/85 text-white text-[10px] sm:text-xs md:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 md:px-3.5 md:py-1.5 rounded-md sm:rounded-lg md:rounded-xl shadow-md flex items-center gap-1 sm:gap-1.5 border border-white/20 backdrop-blur-xs select-none max-w-[85%] truncate"
    >
      {showIcon && <Phone size={13} className="text-[#ff6600] shrink-0" />}
      <span className="truncate">{customBottomText || `📞 상담문의: ${phone} (${officeName.slice(0, 4)})`}</span>
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
      {(position === 'top-left' || position === 'all') && renderTopLeft()}
      {(position === 'center' || position === 'all') && renderCenter()}
      {(position === 'bottom-right' || position === 'all') && renderBottomRight()}
    </div>
  );
};

export default WatermarkOverlay;
