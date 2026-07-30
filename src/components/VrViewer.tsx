import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface VrViewerProps {
  imageUrl?: string;
  propertyName?: string;
  propertyAddr?: string;
}

export default function VrViewer({ imageUrl, propertyName, propertyAddr }: VrViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract URLs from string (split by newlines, trim, remove empty)
  const urls = imageUrl 
    ? imageUrl.split('\n').map(u => u.trim()).filter(u => u.length > 0)
    : ['https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg'];
    
  if (urls.length === 0) {
    urls.push('https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg');
  }

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    let viewerInstance: any = null;

    try {
      viewerInstance = new Viewer({
        container: containerRef.current,
        panorama: urls[0],
        touchmoveTwoFingers: false,
        mousewheel: true,
        navbar: [
          'autorotate',
          'zoom',
          'move',
          'download',
          'fullscreen',
        ],
      });

      viewerRef.current = viewerInstance;

      viewerInstance.addEventListener('ready', () => {
        setLoading(false);
      });

    } catch (err: any) {
      console.error('Failed to initialize photo-sphere-viewer:', err);
      setError('360 VR 뷰어를 초기화하지 못했습니다. WebGL 지원 여부를 확인하세요.');
      setLoading(false);
    }

    return () => {
      if (viewerInstance) {
        try {
          viewerInstance.destroy();
        } catch (e) {
          console.error('Error destroying viewer:', e);
        }
      }
    };
  }, [imageUrl]); // Only re-init if the raw imageUrl string changes entirely

  const goToNext = () => {
    if (!viewerRef.current || urls.length <= 1) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    setCurrentIndex(nextIndex);
    viewerRef.current.setPanorama(urls[nextIndex], { transition: 100, showLoader: false });
  };

  const goToPrev = () => {
    if (!viewerRef.current || urls.length <= 1) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    setCurrentIndex(prevIndex);
    viewerRef.current.setPanorama(urls[prevIndex], { transition: 100, showLoader: false });
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff6600] mb-3"></div>
          <p className="text-sm font-medium">360 VR 공간을 불러오고 있습니다...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 bg-black/80 px-4 text-center z-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-red-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="font-bold text-base mb-1">{error}</p>
          <p className="text-xs text-gray-400 max-w-sm">
            입력된 이미지 주소가 올바르지 않거나, CORS(보안 정책) 차단으로 인해 360 뷰어로 직접 불러올 수 없습니다.
          </p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full aspect-[2/1] min-h-[350px] sm:min-h-[500px]" />

      {/* Transparent overlay content */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10">
        <div className="bg-[#0b1f3c] text-white flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-xl mb-2 opacity-95">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="font-bold text-xl tracking-widest">360</span>
        </div>
        
        {propertyName && (
          <div className="bg-[#121c2d]/90 text-white px-6 py-3 rounded-xl text-center shadow-lg border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-blue-300 font-bold tracking-wider mb-1">360° VR 투어 지원</div>
            <div className="font-extrabold text-sm sm:text-base mb-1">{propertyName}</div>
            {propertyAddr && <div className="text-xs text-gray-300">{propertyAddr}</div>}
          </div>
        )}
      </div>

      {/* Drag text instruction */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none flex flex-col items-center z-10 animate-pulse text-[#156e52] opacity-90 drop-shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#d9f2e6" stroke="#0e533d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M14 4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/><path d="M10 4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5"/><path d="M11 14h1v1"/><path d="M10 11V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v6.5a2 2 0 0 1-.5.73l-1.38 1.38A2 2 0 0 0 4.7 19.3L8 23.5"/><path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H8"/>
          </svg>
          <span className="font-extrabold text-2xl tracking-wide font-black">드래그하여 360° VR 투어</span>
        </div>
        <span className="font-extrabold text-2xl tracking-wide font-black">태왕공인중개사사무소</span>
      </div>

      {/* Navigation Arrows */}
      {urls.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold z-20 backdrop-blur-sm">
            {currentIndex + 1} / {urls.length}
          </div>
        </>
      )}
    </div>
  );
}
