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
}) => {
  const styleOpacity = { opacity };

  const renderTopLeft = () => (
    <div 
      style={styleOpacity} 
      className="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-2.5 md:left-2.5 z-20 bg-gradient-to-r from-[#ff6600]/30 to-[#e65c00]/30 md:from-[#ff6600]/90 md:to-[#e65c00]/90 text-white/80 md:text-white text-[8px] sm:text-[10px] md:text-xs font-extrabold px-1 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded sm:rounded-md md:rounded-lg shadow-2xs md:shadow-md flex items-center gap-0.5 sm:gap-1 md:gap-1.5 border border-white/15 md:border-white/30 backdrop-blur-[0.5px] md:backdrop-blur-xs select-none max-w-[85%] truncate"
    >
      {showIcon && <Star size={11} fill="currentColor" className="text-yellow-300/80 md:text-yellow-300 animate-pulse shrink-0 hidden sm:inline-block" />}
      <span className="truncate">{customTopText || `⭐ [태왕 360 VR] 100% 현장 검증 실매물`}</span>
    </div>
  );

  const renderCenter = () => (
    <div 
      style={styleOpacity}
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-1 sm:p-2 md:p-4"
    >
      <div className="bg-black/10 md:bg-black/20 text-white/85 md:text-white border border-white/15 md:border-white/30 backdrop-blur-[0.5px] md:backdrop-blur-[1.5px] rounded-md sm:rounded-xl md:rounded-2xl px-2 py-0.5 sm:px-3 sm:py-1.5 md:px-6 md:py-3 text-[10px] sm:text-xs md:text-xl lg:text-3xl font-black tracking-tight flex items-center gap-1 sm:gap-2 md:gap-3 shadow-xs md:shadow-xl rotate-0 select-none text-center max-w-[94%] whitespace-nowrap">
        {showIcon && (
          <TaewangLogoIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 shrink-0 opacity-80 md:opacity-100" />
        )}
        <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] md:drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] text-white/90 md:text-white truncate">
          {customCenterText || `${officeName} 360 VR 실매물`}
        </span>
      </div>
    </div>
  );

  const renderBottomRight = () => (
    <div 
      style={styleOpacity} 
      className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 md:bottom-2.5 md:right-2.5 z-20 bg-gray-950/25 md:bg-gray-950/80 text-white/80 md:text-white text-[8px] sm:text-[10px] md:text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 rounded sm:rounded-lg md:rounded-xl shadow-2xs md:shadow-md flex items-center gap-0.5 sm:gap-1 md:gap-1.5 border border-white/10 md:border-white/20 backdrop-blur-[0.5px] md:backdrop-blur-xs select-none max-w-[85%] truncate"
    >
      {showIcon && <Phone size={11} className="text-[#ff6600]/80 md:text-[#ff6600] shrink-0 hidden sm:inline-block" />}
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
