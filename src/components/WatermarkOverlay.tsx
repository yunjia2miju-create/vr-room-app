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
      className="absolute top-3 left-3 z-20 bg-gradient-to-r from-[#ff6600] to-[#e65c00] text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-white/30 backdrop-blur-xs select-none"
    >
      {showIcon && <Star size={14} fill="currentColor" className="text-yellow-300 animate-pulse" />}
      <span>{customTopText || `⭐ [태왕 360 VR] 100% 현장 검증 실매물`}</span>
    </div>
  );

  const renderCenter = () => (
    <div 
      style={styleOpacity}
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4"
    >
      <div className="bg-black/10 text-white border border-white/20 backdrop-blur-[1px] rounded-2xl px-6 py-4 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3.5 shadow-xl rotate-0 select-none text-center max-w-[95%]">
        {showIcon && <TaewangLogoIcon size={44} className="sm:w-12 sm:h-12 md:w-14 md:h-14" />}
        <span className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] text-white">
          {customCenterText || `${officeName} 360 VR 실매물`}
        </span>
      </div>
    </div>
  );

  const renderBottomRight = () => (
    <div 
      style={styleOpacity} 
      className="absolute bottom-3 right-3 z-20 bg-gray-950/85 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-white/20 backdrop-blur-md select-none"
    >
      {showIcon && <Phone size={14} className="text-[#ff6600] shrink-0" />}
      <span>{customBottomText || `📞 상담문의: ${phone} (${officeName.slice(0, 4)})`}</span>
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
