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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract URLs from string (handle missing newlines by splitting on http)
  const urls = imageUrl 
    ? imageUrl
        .split(/(?=https?:\/\/)/) // Split right before http:// or https://
        .map(u => u.trim())
        .filter(u => u.length > 0)
    : ['/sphere.jpg'];
    
  if (urls.length === 0) {
    urls.push('/sphere.jpg');
  }

  // Preload next and previous images for faster navigation
  useEffect(() => {
    if (urls.length > 1) {
      const nextIndex = (currentIndex + 1) % urls.length;
      const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
      
      const img1 = new Image();
      img1.src = urls[nextIndex];
      
      const img2 = new Image();
      img2.src = urls[prevIndex];
    }
  }, [currentIndex, urls]);

  useEffect(() => {
    if (!containerRef.current) return;
    setError(null);
    setIsLoaded(false);

    let viewerInstance: any = null;

    // Delay initialization to ensure the container is fully available
    const initTimer = setTimeout(() => {
      try {
        viewerInstance = new Viewer({
          container: containerRef.current!,
          panorama: urls[0],
          touchmoveTwoFingers: false,
          mousewheel: true,
          defaultZoomLvl: 0,
          navbar: [
            'zoom',
            'move',
            'download',
            'fullscreen',
          ],
          defaultPitch: 0,
        });

        // Kick-start rendering with a small delay to ensure the container is measured correctly
        setTimeout(() => {
          if (viewerInstance) viewerInstance.resize();
        }, 500);

        viewerRef.current = viewerInstance;

        // Log event firing to diagnose issues
        viewerInstance.addEventListener('panorama-error', (e: any) => {
          console.error('PSV: panorama-error fired:', e);
          setError('360 이미지를 불러올 수 없습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
        });

        viewerInstance.addEventListener('position-updated', () => {
          setHasInteracted(true);
        });
        viewerInstance.addEventListener('zoom-updated', () => {
          setHasInteracted(true);
        });
        viewerInstance.addEventListener('ready', () => {
          console.log('PSV: ready fired');
          setIsLoaded(true);
        });
        viewerInstance.addEventListener('panorama-loaded', () => {
          console.log('PSV: panorama-loaded fired');
          setIsLoaded(true);
        });
        viewerInstance.addEventListener('render', () => {
          console.log('PSV: render fired');
          setIsLoaded(true);
        });

        const handleInteraction = () => setHasInteracted(true);
        containerRef.current?.addEventListener('mousedown', handleInteraction, { once: true });
        containerRef.current?.addEventListener('touchstart', handleInteraction, { once: true });

      } catch (err: any) {
        console.error('Failed to initialize photo-sphere-viewer:', err);
        setError('360 VR 뷰어를 초기화하지 못했습니다. WebGL 지원 여부를 확인하세요.');
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (viewerInstance) {
        try {
          viewerInstance.destroy();
        } catch (e) {
          console.error('Error destroying viewer:', e);
        }
      }
    };
  }, [imageUrl]); // Only re-init if the raw imageUrl string changes entirely

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!viewerRef.current || urls.length <= 1) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    setCurrentIndex(nextIndex);
    setError(null);
    viewerRef.current.setPanorama(urls[nextIndex], { transition: 100, showLoader: true, zoom: 0 }).catch((err: any) => {
      console.error('goToNext error:', err);
    });
  };

  const goToPrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!viewerRef.current || urls.length <= 1) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    setCurrentIndex(prevIndex);
    setError(null);
    viewerRef.current.setPanorama(urls[prevIndex], { transition: 100, showLoader: true, zoom: 0 }).catch((err: any) => {
      console.error('goToPrev error:', err);
    });
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
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


      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-white font-bold tracking-wide">360° 고화질 파노라마 불러오는 중...</span>
          <span className="text-gray-300 text-xs mt-2">잠시만 기다려주세요.</span>
        </div>
      )}

      {/* Transparent overlay content */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10 transition-opacity duration-500 ${hasInteracted || !isLoaded ? 'opacity-0' : 'opacity-100'}`}>
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
      <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 pointer-events-none flex flex-col items-center z-10 text-[#156e52] drop-shadow-md opacity-90">
        <div className="flex items-center gap-2 mb-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#d9f2e6" stroke="#0e533d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M14 4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/><path d="M10 4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5"/><path d="M11 14h1v1"/><path d="M10 11V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v6.5a2 2 0 0 1-.5.73l-1.38 1.38A2 2 0 0 0 4.7 19.3L8 23.5"/><path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H8"/>
          </svg>
          <span className="font-extrabold text-2xl tracking-wide font-black">드래그하여 360° VR 투어</span>
        </div>
        <span className="font-extrabold text-2xl tracking-wide font-black">태왕공인중개사사무소 054-455-6789</span>
      </div>

      {/* Navigation Arrows */}
      {urls.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm cursor-pointer"
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
