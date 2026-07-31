import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Key, ExternalLink, Check, RefreshCw, Info } from 'lucide-react';

interface NaverMapProps {
  addr: string;
  name: string;
  listingNo?: string;
  room?: string;
}

declare global {
  interface Window {
    naver?: any;
  }
}

export default function NaverMap({ addr, name, listingNo, room }: NaverMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string>(() => {
    return localStorage.getItem('naver_map_client_id') || import.meta.env.VITE_NAVER_MAP_CLIENT_ID || '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const fullAddr = `경상북도 구미시 ${addr.replace(/^경상북도\s*구미시\s*/, '')}`;
  const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(fullAddr)}`;

  // Save client ID to localStorage
  const handleSaveClientId = (keyToSave: string) => {
    const cleaned = keyToSave.trim();
    if (cleaned) {
      localStorage.setItem('naver_map_client_id', cleaned);
      setClientId(cleaned);
      setShowKeyModal(false);
      setMapError(null);
    } else {
      localStorage.removeItem('naver_map_client_id');
      setClientId('');
      setShowKeyModal(false);
    }
  };

  // Load Naver Maps SDK script dynamically
  useEffect(() => {
    if (!clientId) {
      setIsScriptLoaded(false);
      return;
    }

    // Check if script already loaded for this clientId
    const existingScript = document.getElementById('naver-map-script') as HTMLScriptElement;
    if (existingScript) {
      if (existingScript.src.includes(clientId) && window.naver && window.naver.maps) {
        setIsScriptLoaded(true);
        return;
      } else {
        existingScript.remove();
      }
    }

    setIsScriptLoaded(false);
    setMapError(null);

    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
    script.async = true;

    script.onload = () => {
      if (window.naver && window.naver.maps) {
        setIsScriptLoaded(true);
      } else {
        setMapError('네이버 지도 SDK를 로드하지 못했습니다. Client ID를 확인해주세요.');
      }
    };

    script.onerror = () => {
      setMapError('네이버 지도 API 호출에 실패했습니다. Client ID가 유효한지 또는 네이버 클라우드 웹 서비스 URL(도메인)이 등록되었는지 확인해주세요.');
    };

    document.head.appendChild(script);
  }, [clientId]);

  // Render Map using Naver Map API
  useEffect(() => {
    if (!isScriptLoaded || !window.naver || !window.naver.maps || !mapElementRef.current) return;

    setIsGeocoding(true);
    setMapError(null);

    const container = mapElementRef.current;

    // Default coordinates: Sagok-dong / Gumi Center
    let defaultLat = 36.0961;
    let defaultLng = 128.3615;

    const renderMapWithCoords = (lat: number, lng: number, addressTitle: string) => {
      try {
        const location = new window.naver.maps.LatLng(lat, lng);
        const mapOptions = {
          center: location,
          zoom: 16,
          minZoom: 10,
          maxZoom: 19,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
          mapTypeControl: true,
        };

        const map = new window.naver.maps.Map(container, mapOptions);

        // Marker
        const marker = new window.naver.maps.Marker({
          position: location,
          map: map,
          title: name || '매물 위치',
          animation: window.naver.maps.Animation.DROP,
        });

        // InfoWindow
        const infoWindowContent = `
          <div style="padding: 10px 14px; min-width: 180px; font-family: sans-serif; font-size: 13px;">
            <div style="font-weight: 800; color: #ff6600; margin-bottom: 3px;">${name} ${room ? room + '호' : ''}</div>
            <div style="font-size: 12px; color: #4b5563;">${addressTitle}</div>
            ${listingNo ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">매물번호: ${listingNo}</div>` : ''}
          </div>
        `;

        const infoWindow = new window.naver.maps.InfoWindow({
          content: infoWindowContent,
          borderColor: '#ff6600',
          borderWidth: 2,
          anchorSize: new window.naver.maps.Size(12, 12),
          backgroundColor: '#fff',
        });

        infoWindow.open(map, marker);

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });

        setIsGeocoding(false);
      } catch (err: any) {
        console.error('Naver Map render error:', err);
        setMapError('지도를 그리는 중 오류가 발생했습니다.');
        setIsGeocoding(false);
      }
    };

    // Geocoding to find coordinates by address
    if (window.naver.maps.Service && window.naver.maps.Service.geocode) {
      window.naver.maps.Service.geocode(
        { query: fullAddr },
        (status: any, response: any) => {
          if (status === window.naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
            const item = response.v2.addresses[0];
            const lat = parseFloat(item.y);
            const lng = parseFloat(item.x);
            renderMapWithCoords(lat, lng, item.roadAddress || item.jibunAddress || fullAddr);
          } else {
            // Fallback try with simplified address
            const simpleAddr = `구미시 ${addr.split(' ')[0] || ''}`;
            window.naver.maps.Service.geocode(
              { query: simpleAddr },
              (status2: any, response2: any) => {
                if (status2 === window.naver.maps.Service.Status.OK && response2.v2.addresses.length > 0) {
                  const item2 = response2.v2.addresses[0];
                  renderMapWithCoords(parseFloat(item2.y), parseFloat(item2.x), fullAddr);
                } else {
                  renderMapWithCoords(defaultLat, defaultLng, fullAddr);
                }
              }
            );
          }
        }
      );
    } else {
      renderMapWithCoords(defaultLat, defaultLng, fullAddr);
    }
  }, [isScriptLoaded, fullAddr, name, room, listingNo]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Header bar with Client ID Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#03C75A] animate-pulse"></span>
          <span className="font-bold text-gray-800">네이버 지도 (Naver Dynamic Map)</span>
          {clientId ? (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium text-[11px] flex items-center gap-1">
              <Check size={12} /> API Key 설정됨
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-[11px]">
              Client ID 필요
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setInputKey(clientId);
            setShowKeyModal(true);
          }}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 px-2.5 py-1 rounded font-bold transition-colors cursor-pointer"
        >
          <Key size={13} className="text-[#03C75A]" />
          <span>{clientId ? 'Client ID 변경' : '네이버 지도 API 키 등록'}</span>
        </button>
      </div>

      {/* Main Map Box */}
      <div className="w-full aspect-[16/9] md:aspect-[2/1] min-h-[280px] bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 shadow-sm">
        {clientId && isScriptLoaded && !mapError ? (
          <div ref={mapElementRef} className="w-full h-full z-0" />
        ) : isGeocoding ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500 z-10">
            <RefreshCw className="animate-spin text-[#03C75A] mb-2" size={28} />
            <span className="font-bold text-sm">네이버 지도로 위치 찾는 중...</span>
          </div>
        ) : (
          /* Placeholder View if no key or error */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f4fbf7] p-6 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#03C75A]/10 text-[#03C75A] flex items-center justify-center mb-3">
              <MapPin size={26} />
            </div>

            <h4 className="font-bold text-gray-900 text-base mb-1">
              {name} ({fullAddr})
            </h4>

            {mapError ? (
              <p className="text-xs text-red-600 font-medium max-w-md bg-red-50 p-2.5 rounded-lg border border-red-200 mb-4">
                {mapError}
              </p>
            ) : (
              <p className="text-xs text-gray-600 max-w-md mb-4 leading-relaxed">
                화면에 네이버 지도를 직접 렌더링하려면 <strong>네이버 클라우드 플랫폼 Client ID</strong> 등록이 필요합니다.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setInputKey(clientId);
                  setShowKeyModal(true);
                }}
                className="bg-[#03C75A] hover:bg-[#02b350] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Key size={14} />
                네이버 Client ID 입력하기
              </button>

              <a
                href={searchUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink size={14} className="text-[#03C75A]" />
                네이버 지도 웹에서 위치 보기
              </a>
            </div>
          </div>
        )}

        {/* Floating Quick Action Button */}
        <div className="absolute bottom-4 right-4 z-20">
          <a
            href={searchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#03C75A] text-white py-2.5 px-4 rounded-lg font-bold text-xs md:text-sm shadow-lg hover:bg-[#02b350] hover:scale-[1.02] transition-all text-center"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            네이버 지도로 열기 & 길찾기
          </a>
        </div>
      </div>

      {/* Naver Client ID Entry Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            {/* Header */}
            <div className="bg-[#03C75A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Key size={18} />
                네이버 지도 API Client ID 설정
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-white/80 hover:text-white transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-gray-700">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <Info size={16} /> 네이버 클라우드 플랫폼 Client ID 안내
                </div>
                <p>
                  네이버 지도를 웹 화면에 직접 띄우려면 네이버 클라우드 플랫폼에서 발급받은 <strong>Client ID</strong>가 필요합니다.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Client ID 입력</label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="예: 5x1a2b3c4d (영문/숫자 조합)"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 font-mono text-sm focus:border-[#03C75A] focus:ring-1 focus:ring-[#03C75A] outline-none"
                />
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs text-gray-600">
                <div className="font-bold text-gray-800">📌 Client ID 무료 발급 방법 (1분 소요):</div>
                <ol className="list-decimal list-inside space-y-1 leading-normal">
                  <li><strong>ncloud.com</strong> (네이버 클라우드 플랫폼) 접속 및 로그인</li>
                  <li><strong>Console &gt; AI·NAVER API &gt; Application Services &gt; Maps</strong> 이동</li>
                  <li><strong>Application 등록</strong> (서비스 선택: <strong>Web Dynamic Map</strong>)</li>
                  <li>서비스 URL에 <code>http://localhost:3000</code> 또는 본 서비스 도메인 등록</li>
                  <li>발급된 <strong>Client ID</strong>를 복사하여 위 입력란에 붙여넣기!</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-2">
              {clientId && (
                <button
                  type="button"
                  onClick={() => handleSaveClientId('')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  지우기 (초기화)
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleSaveClientId(inputKey)}
                className="px-5 py-2 bg-[#03C75A] hover:bg-[#02b350] text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                저장 및 지도 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
