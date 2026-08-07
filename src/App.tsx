import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import AdminPage from './components/AdminPage';
import VrViewer from './components/VrViewer';
import WatermarkOverlay, { WatermarkPosition, TaewangLogoIcon } from './components/WatermarkOverlay';
import { auth } from './firebase';
import { 
  Building2, 
  Check, 
  ChevronDown, 
  FileText, 
  Info, 
  Leaf,
  Loader2,
  Plus, 
  Search, 
  Shield, 
  X 
} from 'lucide-react';

export const PROPERTIES = [
  { id: '1', mgt: '태왕', name: '크라운빌', addr: '사곡동 422-168', room: '501', type: '미투', contract: '월', deposit: '300', rent: '30', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '출비 : 1543#', vr: true },
  { id: '2', mgt: '태왕', name: '어린왕자 하나', addr: '옥계동 950', room: '301', type: '미투', contract: '월', deposit: '300', rent: '35', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '', vr: true },
  { id: '3', mgt: '태왕', name: '고야드', addr: '사곡동 267-54', room: '301', type: '원룸', contract: '월 가능, 풀 옵션', deposit: '200', rent: '30', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '현)4119', vr: false },
  { id: '4', mgt: '태왕', name: '니캉내캉', addr: '원평동 1034-10', room: '206', type: '미투', contract: '반전. 월 가능', deposit: '300', rent: '40', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '승강기 있음. 보증금 월세조정가능', vr: true },
  { id: '5', mgt: '태왕', name: '니캉내캉', addr: '원평동 1034-10', room: '205', type: '미투', contract: '전세.반전. 월 가능', deposit: '300\n5,000', rent: '38\n8', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '승강기있음. 보증금월세조정가능', vr: true },
  { id: '6', mgt: '태왕', name: '힐링타운', addr: '송정동 26-9', room: '305', type: '원룸', contract: '월 가능, 풀 옵션', deposit: '200', rent: '28', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '즉시 입주가능', vr: false },
  { id: '7', mgt: '태왕', name: '리치하우스', addr: '사곡동 422-56', room: '201', type: '투룸', contract: '월 가능, 풀 옵션', deposit: '300', rent: '55', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '', vr: true },
  { id: '8', mgt: '태왕', name: '이화빌', addr: '형곡동 192-8', room: '205', type: '미투', contract: '월 가능, 풀 옵션', deposit: '200', rent: '32', phone: '사무실 054-455-6789, 휴대폰 010-7590-0111', note: '', vr: true },
];

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const Vr360LogoIcon = ({ className = "w-8 h-8 md:w-9 md:h-9" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <mask id="building-mask-global">
      <rect width="100" height="100" fill="white" />
      <circle cx="32.5" cy="56" r="7" fill="black" />
      <rect x="56.5" y="32" width="24" height="9" rx="4.5" fill="black" />
      <rect x="56.5" y="48" width="24" height="9" rx="4.5" fill="black" />
      <path d="M 60 90 L 60 74 A 8.5 8.5 0 0 1 77 74 L 77 90 Z" fill="black" />
    </mask>
    <g mask="url(#building-mask-global)" fill="currentColor">
      <path d="M 12 90 L 12 50 A 12 12 0 0 1 24 38 L 41 38 A 12 12 0 0 1 53 50 L 53 90 Z" />
      <path d="M 47 90 L 47 27 A 12 12 0 0 1 59 15 L 78 15 A 12 12 0 0 1 90 27 L 90 90 Z" />
    </g>
  </svg>
);


export function formatAddress(addr: string, isLoggedIn: boolean) {
  if (!addr) return '';
  if (isLoggedIn) return addr;
  // Non-logged in user: remove lot number (지번) e.g. "봉곡동 205-5" -> "봉곡동"
  return addr.replace(/\s+\d+([-\d]+)?(?=\s|\(|$)/g, '').trim();
}

function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('taewang_admin_logged') === 'true' || !!auth.currentUser;
    } catch {
      return !!auth.currentUser;
    }
  });

  const location = useLocation();

  useEffect(() => {
    const checkLogin = () => {
      try {
        const logged = sessionStorage.getItem('taewang_admin_logged') === 'true' || !!auth.currentUser;
        setIsLoggedIn(logged);
      } catch {
        setIsLoggedIn(!!auth.currentUser);
      }
    };

    checkLogin();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          sessionStorage.setItem('taewang_admin_logged', 'true');
        } catch {}
        setIsLoggedIn(true);
      } else {
        checkLogin();
      }
    });

    window.addEventListener('storage', checkLogin);
    window.addEventListener('focus', checkLogin);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('focus', checkLogin);
    };
  }, [location]);

  return isLoggedIn;
}

function Home({ properties, boardPosts }: { properties: any[]; boardPosts: any[] }) {
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  const todayFormatted = React.useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  }, []);

  // Search & Filter States
  const [searchType, setSearchType] = useState('전체');
  const [searchDong, setSearchDong] = useState('전체');
  const [searchContract, setSearchContract] = useState('전체');
  const [searchName, setSearchName] = useState('');
  const [searchAddr, setSearchAddr] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [searchPropertyId, setSearchPropertyId] = useState('');
  const [bunbeon, setBunbeon] = useState('');
  const [bubeon, setBubeon] = useState('');

  // Interactive filters
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<{ type: string; dong: string } | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'전체' | '광고중' | '광고종료'>('전체');

  // Group properties dynamically for "취급 매물" table
  const groupedStats = React.useMemo(() => {
    const groups: { [key: string]: { type: string; location: string; dong: string; total: number; sell: number; jeonse: number; monthly: number; short: number } } = {};
    
    properties.forEach(p => {
      const type = p.type || '원룸';
      let dong = '';
      const parts = (p.addr || '').split(' ');
      const dongPart = parts.find(part => part.endsWith('동') || part.endsWith('읍') || part.endsWith('면'));
      if (dongPart) {
        dong = dongPart;
      } else {
        dong = parts[0] || '구미시';
      }
      const locationKey = `구미시 ${dong}`;
      const key = `${type}_${locationKey}`;
      
      if (!groups[key]) {
        groups[key] = {
          type,
          location: locationKey,
          dong,
          total: 0,
          sell: 0,
          jeonse: 0,
          monthly: 0,
          short: 0
        };
      }
      
      groups[key].total += 1;
      
      const contract = p.contract || '';
      if (contract.includes('전세')) {
        groups[key].jeonse += 1;
      } else if (contract.includes('단기')) {
        groups[key].short += 1;
      } else if (contract.includes('매매')) {
        groups[key].sell += 1;
      } else {
        groups[key].monthly += 1;
      }
    });
    
    return Object.values(groups);
  }, [properties]);

  // Extract unique dongs
  const uniqueDongs = React.useMemo(() => {
    const dongs = new Set<string>();
    properties.forEach(p => {
      const parts = (p.addr || '').split(' ');
      const dongPart = parts.find(part => part.endsWith('동') || part.endsWith('읍') || part.endsWith('면'));
      if (dongPart) {
        dongs.add(dongPart);
      }
    });
    return Array.from(dongs).sort();
  }, [properties]);

  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>();
    properties.forEach(p => {
      const type = p.type || '원룸';
      types.add(type);
    });
    return Array.from(types).sort();
  }, [properties]);

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchType('전체');
    setSearchDong('전체');
    setSearchContract('전체');
    setSearchName('');
    setSearchAddr('');
    setPriceMin('');
    setPriceMax('');
    setSearchPropertyId('');
    setBunbeon('');
    setBubeon('');
    setSelectedGroupFilter(null);
    setActiveStatusFilter('전체');
  };

  // Main filter calculation
  const filteredUserProperties = React.useMemo(() => {
    return properties.filter(p => {
      const noteStr = (p.note || '').toLowerCase();
      
      // 1. Status Filter
      if (activeStatusFilter === '광고종료') {
        if (!noteStr.includes('종료') && !noteStr.includes('완료') && !noteStr.includes('퇴거')) return false;
      } else if (activeStatusFilter === '광고중') {
        if (noteStr.includes('종료') || noteStr.includes('완료') || noteStr.includes('퇴거')) return false;
      }

      // 2. Handled Property Row Click Filter
      if (selectedGroupFilter) {
        if (p.type !== selectedGroupFilter.type) return false;
        if (!(p.addr || '').includes(selectedGroupFilter.dong)) return false;
      }

      // 3. Type Filter
      if (searchType !== '전체') {
        if (p.type !== searchType) return false;
      }

      // 4. Dong Filter
      if (searchDong !== '전체') {
        if (!(p.addr || '').includes(searchDong)) return false;
      }

      // 4b. Contract Filter
      if (searchContract !== '전체') {
        const contract = p.contract || '';
        if (searchContract === '전세') {
          if (!contract.includes('전세')) return false;
        } else if (searchContract === '매매') {
          if (!contract.includes('매매')) return false;
        } else if (searchContract === '단기') {
          if (!contract.includes('단기')) return false;
        } else if (searchContract === '월세') {
          if (contract.includes('전세') && !contract.includes('월')) return false;
        }
      }

      // 5. Name Filter (건물명)
      if (searchName.trim() !== '') {
        const term = searchName.trim().toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        const roomStr = (p.room || '').toLowerCase();
        const fullStr = `${nameStr} ${roomStr}`;
        const noSpaceName = nameStr.replace(/\s+/g, '');
        const noSpaceTerm = term.replace(/\s+/g, '');

        if (!nameStr.includes(term) && !noSpaceName.includes(noSpaceTerm) && !fullStr.includes(term)) {
          return false;
        }
      }

      // 6. Address Filter (상세주소)
      if (searchAddr.trim() !== '') {
        const term = searchAddr.trim().toLowerCase();
        const addrStr = (p.addr || '').toLowerCase();
        const noSpaceAddr = addrStr.replace(/\s+/g, '');
        const noSpaceTerm = term.replace(/\s+/g, '');
        const noteStr = (p.note || '').toLowerCase();

        if (!addrStr.includes(term) && !noSpaceAddr.includes(noSpaceTerm) && !noteStr.includes(term)) {
          return false;
        }
      }

      // 7. Bunbeon & Bubeon Filter
      if (bunbeon.trim() !== '') {
        if (!(p.addr || '').includes(bunbeon.trim())) return false;
      }
      if (bubeon.trim() !== '') {
        if (!(p.addr || '').includes(bubeon.trim())) return false;
      }

      // 8. Price Range Filter (monthly rent - 월세범위)
      if (priceMin.trim() !== '') {
        const minVal = parseInt(priceMin, 10);
        if (!isNaN(minVal)) {
          const rentNumbers = (p.rent || '').match(/\d+/g);
          const rentVal = rentNumbers && rentNumbers.length > 0 ? parseInt(rentNumbers[0], 10) : 0;
          if (rentVal < minVal) return false;
        }
      }
      if (priceMax.trim() !== '') {
        const maxVal = parseInt(priceMax, 10);
        if (!isNaN(maxVal)) {
          const rentNumbers = (p.rent || '').match(/\d+/g);
          const rentVal = rentNumbers && rentNumbers.length > 0 ? parseInt(rentNumbers[0], 10) : 0;
          if (rentVal > maxVal) return false;
        }
      }

      // 9. Property ID Filter (매물번호)
      if (searchPropertyId.trim() !== '') {
        const cleanSearchNum = searchPropertyId.trim().replace(/[^0-9]/g, '');
        const pIdStr = String(p.id).trim();

        if (cleanSearchNum !== '') {
          // Check if p.id equals cleanSearchNum or includes it
          if (pIdStr !== cleanSearchNum && !pIdStr.includes(cleanSearchNum)) return false;
        } else {
          // If user typed non-numbers, fallback to raw check
          const searchIdRaw = searchPropertyId.trim().toLowerCase();
          const fullIdStr = `tw-${p.id}`.toLowerCase();
          if (!fullIdStr.includes(searchIdRaw) && !pIdStr.includes(searchIdRaw)) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 1. Compare createdAt / registeredAt / updatedAt dates if available
      const timeA = a.createdAt || a.registeredAt || a.updatedAt ? new Date(a.createdAt || a.registeredAt || a.updatedAt).getTime() : 0;
      const timeB = b.createdAt || b.registeredAt || b.updatedAt ? new Date(b.createdAt || b.registeredAt || b.updatedAt).getTime() : 0;
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB && (timeA > 0 || timeB > 0)) {
        return timeB - timeA;
      }

      // 2. Compare numeric ID descending (e.g. TW-31 > TW-17 > TW-2)
      const numA = parseInt(String(a.id || '').replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(String(b.id || '').replace(/[^0-9]/g, ''), 10) || 0;
      return numB - numA;
    });
  }, [properties, activeStatusFilter, selectedGroupFilter, searchType, searchDong, searchContract, searchName, searchAddr, bunbeon, bubeon, priceMin, priceMax, searchPropertyId]);

  // Counts for status cards
  const totalCount = properties.length;
  const activeCount = properties.filter(p => {
    const noteStr = (p.note || '').toLowerCase();
    return !noteStr.includes('종료') && !noteStr.includes('완료') && !noteStr.includes('퇴거');
  }).length;
  const closedCount = totalCount - activeCount;

  // Watermark Style State
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkPosition>('all');

  // Load More state
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchType, searchDong, searchContract, searchName, searchAddr, bunbeon, bubeon, priceMin, priceMax, searchPropertyId, selectedGroupFilter, activeStatusFilter]);

  const displayedProperties = React.useMemo(() => {
    return filteredUserProperties.slice(0, visibleCount);
  }, [filteredUserProperties, visibleCount]);

  const handleLoadMore = () => {
    const prevCount = visibleCount;
    setVisibleCount(prev => prev + 10);
    
    // Smooth scroll to the newly appended 11th item (index prevCount) without screen flicker or lag
    requestAnimationFrame(() => {
      setTimeout(() => {
        const targetEl = document.getElementById(`property-item-${prevCount}`) || document.getElementById(`property-item-mobile-${prevCount}`);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const headerOffset = window.innerWidth < 1024 ? 80 : 120;
          window.scrollTo({
            top: rect.top + scrollTop - headerOffset,
            behavior: 'smooth'
          });
        }
      }, 50);
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-orange-200 sticky top-0 z-50">
        <div className="w-full max-w-[1536px] mx-auto relative">
          <div className="w-full px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-10 w-full sm:w-auto justify-between sm:justify-start">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 text-[#ff6600] font-black text-xl md:text-2xl tracking-tighter hover:opacity-95 transition-opacity">
                <Vr360LogoIcon className="w-8 h-8 md:w-9 md:h-9 shrink-0" />
                <span>태왕공인중개사사무소</span>
              </Link>
              
              {/* Navigation */}
              <nav className="flex gap-8 text-[15px] font-medium text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors hidden">임장활동</a>

                <a href="#" className="hover:text-gray-900 transition-colors relative hidden">
                  사진관리
                  <span className="absolute -top-3 -right-10 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap">무료 신청</span>
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors hidden">고객관리</a>
                <a href="#" className="hover:text-gray-900 transition-colors hidden">계약관리</a>
                <a href="#" className="flex items-center gap-1 text-teal-500 font-bold hover:text-teal-600 transition-colors hidden">
                  <Shield size={16} className="fill-teal-500 text-white" />
                  안심케어
                </a>
                <a href="#" className="flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 transition-colors hidden">
                  <Building2 size={16} className="fill-blue-600 text-white" />
                  아파트아이
                </a>
              </nav>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-end">
              <a href="#" className="flex items-center gap-1 text-[#ff6600] font-bold text-xs md:text-sm bg-orange-50 px-2 md:px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors whitespace-nowrap">
                360 VR 투어 안내
              </a>
              <a href="tel:054-455-6789" className="flex items-center gap-1 bg-[#ff6600] text-white px-3 md:px-4 py-1.5 rounded-full font-bold text-xs md:text-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap">
                상담문의: 054-455-6789
              </a>
            </div>
          </div>
          {/* Top-right floating banner button */}
          <div className="hidden lg:block absolute right-6 top-16 z-40">
            <button className="bg-white border border-[#ff6600] text-[#ff6600] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-orange-50 transition-colors">
              구미시 원룸 360 VR 전문
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1536px] mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col xl:flex-row gap-6">
        
        {/* Left/Center Main Column */}
        <div className="flex-1 flex flex-col gap-6 md:gap-8 min-w-0">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-gray-700 stroke-[1.5]" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">구미시 360 VR 매물광고</h2>
              </div>
              <span className="text-[12px] md:text-[13px] text-gray-500 md:ml-2 font-medium">
                *구미시 원룸, 투룸 360 VR 투어로 생생하게 확인하세요.
              </span>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto bg-[#ff6600] text-white px-4 py-2 rounded flex justify-center items-center gap-1.5 font-bold text-sm hover:bg-[#e65c00] transition-colors shadow-sm cursor-pointer"
            >
              <Check size={16} strokeWidth={3} />
              매물 등록 (관리자)
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: '전체', value: totalCount.toString(), type: 'active', filterVal: '전체' },
              { label: '광고중', value: activeCount.toString(), type: 'outline', filterVal: '광고중' },
              { label: '광고 검증 중', value: '0', type: 'outline-blue', hidden: true },
              { label: '광고 검증 실패', value: '0', type: 'outline-blue', hidden: true },
              { label: '종료예정', value: '0', type: 'outline', tooltip: true, hidden: true },
              { label: '광고종료', value: closedCount.toString(), type: 'outline-green', filterVal: '광고종료' },
              { label: '동일주소 거래완료', value: '0', type: 'outline-green', hidden: true },
              { label: '신고매물 미처리', value: '0', type: 'outline-red', hidden: true },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if (stat.filterVal) {
                    setActiveStatusFilter(stat.filterVal as any);
                  }
                }}
                className={`
                  rounded flex-col p-3 border transition-colors cursor-pointer select-none
                  ${stat.hidden ? 'hidden' : 'flex'}
                  ${activeStatusFilter === stat.filterVal ? 'bg-[#ff9900] text-white border-[#ff9900] shadow-sm font-bold' : 'bg-white hover:bg-gray-50 border-gray-200'}
                `}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[13px] font-medium ${activeStatusFilter === stat.filterVal ? 'text-white' : 'text-gray-600'}`}>
                    {stat.label}
                  </span>
                  {stat.tooltip && (
                    <Info size={14} className="text-gray-400" />
                  )}
                </div>
                <div className={`
                  text-2xl font-bold mt-1
                  ${activeStatusFilter === stat.filterVal ? 'text-white' : ''}
                  ${activeStatusFilter !== stat.filterVal && stat.label === '광고중' ? 'text-[#ff6600]' : ''}
                  ${activeStatusFilter !== stat.filterVal && stat.label === '광고종료' ? 'text-emerald-500' : ''}
                  ${activeStatusFilter !== stat.filterVal && stat.label === '전체' ? 'text-gray-800' : ''}
                `}>
                  {stat.value}
                </div>
              </div>
            ))}

            {/* 오늘 날짜 카드 */}
            <div className="rounded flex flex-col p-3 border border-gray-200 bg-white select-none shadow-sm">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-medium text-gray-600">오늘 날짜</span>
              </div>
              <div className="text-base sm:text-lg md:text-xl font-bold mt-1 text-gray-800 flex items-center h-full">
                {todayFormatted}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-[15px] text-gray-900">매물 검색</h3>
              {(searchType !== '전체' || searchDong !== '전체' || searchName.trim() !== '' || searchAddr.trim() !== '' || priceMin.trim() !== '' || priceMax.trim() !== '' || searchPropertyId.trim() !== '' || bunbeon.trim() !== '' || bubeon.trim() !== '' || selectedGroupFilter !== null || activeStatusFilter !== '전체') && (
                <button 
                  onClick={handleResetFilters}
                  className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  필터 초기화 ↺
                </button>
              )}
            </div>
            
            <div className="flex flex-col text-[13px]">
              {/* Row 1: 취급 매물 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-2.5 sm:p-3 md:p-4 font-medium text-gray-700 flex items-center md:items-start border-b md:border-b-0 md:border-r border-gray-100 text-xs sm:text-sm">
                  취급 매물
                </div>
                <div className="flex-1 p-1.5 sm:p-3 md:p-4 overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-200 text-[11px] sm:text-xs bg-gray-50/50">
                        <th className="py-2 px-1 font-semibold w-16 sm:w-28 whitespace-nowrap">매물종류</th>
                        <th className="py-2 px-1 font-semibold text-left">단지/지역명</th>
                        <th className="py-2 px-1 font-semibold w-10 sm:w-16 whitespace-nowrap cursor-pointer hover:text-[#ff6600]" onClick={() => setSearchContract('전체')}>전체</th>
                        <th className="py-2 px-1 font-semibold w-10 sm:w-16 whitespace-nowrap cursor-pointer hover:text-[#ff6600]" onClick={() => setSearchContract('매매')}>매매</th>
                        <th className="py-2 px-1 font-semibold w-10 sm:w-16 whitespace-nowrap cursor-pointer hover:text-[#ff6600]" onClick={() => setSearchContract('전세')}>전세</th>
                        <th className="py-2 px-1 font-semibold w-10 sm:w-16 whitespace-nowrap cursor-pointer hover:text-[#ff6600]" onClick={() => setSearchContract('월세')}>월세</th>
                        <th className="py-2 px-1 font-semibold w-10 sm:w-16 whitespace-nowrap cursor-pointer hover:text-[#ff6600]" onClick={() => setSearchContract('단기')}>단기</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm">
                      {groupedStats.length > 0 ? (
                        groupedStats.map((row, idx) => {
                          const isRowActive = searchType === row.type && searchDong === row.dong;
                          
                          const handleCellClick = (e: React.MouseEvent, contractVal: string = '전체') => {
                            e.preventDefault();
                            setSearchType(row.type);
                            setSearchDong(row.dong);
                            setSearchContract(contractVal);
                            setSelectedGroupFilter({ type: row.type, dong: row.dong });

                            const el = document.getElementById('vacancy-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          };

                          return (
                            <tr 
                              key={idx} 
                              className={`border-b border-gray-100 last:border-0 hover:bg-orange-50/60 transition-colors ${
                                isRowActive ? 'bg-orange-50/80 font-bold' : ''
                              }`}
                            >
                              <td 
                                onClick={(e) => handleCellClick(e, '전체')}
                                className="py-2 sm:py-2.5 px-1 text-gray-700 text-[11px] sm:text-sm whitespace-nowrap cursor-pointer hover:text-[#ff6600] hover:underline font-medium"
                              >
                                {row.type}
                              </td>
                              <td 
                                onClick={(e) => handleCellClick(e, '전체')}
                                className="py-2 sm:py-2.5 px-1 text-left text-gray-700 flex items-center gap-1.5 min-w-0 cursor-pointer hover:text-[#ff6600]"
                              >
                                <span className="text-gray-900 font-medium text-[11px] sm:text-sm truncate hover:underline">{row.location}</span>
                                {isRowActive && (
                                  <span className="bg-[#ff6600] text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 shadow-2xs">
                                    선택됨
                                  </span>
                                )}
                              </td>
                              <td onClick={(e) => handleCellClick(e, '전체')} className="py-2 sm:py-2.5 px-1 cursor-pointer">
                                <span className={`underline text-[11px] sm:text-sm ${searchContract === '전체' && isRowActive ? 'text-[#ff6600] font-black' : 'text-blue-600 font-semibold hover:text-[#ff6600]'}`}>{row.total}</span>
                              </td>
                              <td onClick={(e) => handleCellClick(e, '매매')} className="py-2 sm:py-2.5 px-1 cursor-pointer">
                                <span className={`text-[11px] sm:text-sm ${searchContract === '매매' && isRowActive ? 'text-[#ff6600] font-black underline' : row.sell > 0 ? 'text-blue-600 font-semibold underline hover:text-[#ff6600]' : 'text-gray-400'}`}>{row.sell}</span>
                              </td>
                              <td onClick={(e) => handleCellClick(e, '전세')} className="py-2 sm:py-2.5 px-1 cursor-pointer">
                                <span className={`text-[11px] sm:text-sm ${searchContract === '전세' && isRowActive ? 'text-[#ff6600] font-black underline' : row.jeonse > 0 ? 'text-blue-600 font-semibold underline hover:text-[#ff6600]' : 'text-gray-400'}`}>{row.jeonse}</span>
                              </td>
                              <td onClick={(e) => handleCellClick(e, '월세')} className="py-2 sm:py-2.5 px-1 cursor-pointer">
                                <span className={`text-[11px] sm:text-sm ${searchContract === '월세' && isRowActive ? 'text-[#ff6600] font-black underline' : row.monthly > 0 ? 'text-blue-600 font-semibold underline hover:text-[#ff6600]' : 'text-gray-400'}`}>{row.monthly}</span>
                              </td>
                              <td onClick={(e) => handleCellClick(e, '단기')} className="py-2 sm:py-2.5 px-1 cursor-pointer">
                                <span className={`text-[11px] sm:text-sm ${searchContract === '단기' && isRowActive ? 'text-[#ff6600] font-black underline' : row.short > 0 ? 'text-blue-600 font-semibold underline hover:text-[#ff6600]' : 'text-gray-400'}`}>{row.short}</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-gray-400 text-center">등록된 매물이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 2: 지역조회 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center border-b md:border-b-0 md:border-r border-gray-100">
                  지역조회
                </div>
                <div className="flex-1 p-3 md:p-4 flex items-center gap-2 flex-wrap">
                  {/* 매물종류 Select */}
                  <select 
                    value={searchType}
                    onChange={(e) => {
                      setSearchType(e.target.value);
                      setSelectedGroupFilter(null);
                    }}
                    className={`border rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 font-bold transition-all ${
                      searchType !== '전체' 
                        ? 'border-[#ff6600] text-[#ff6600] bg-orange-50 ring-2 ring-orange-200' 
                        : 'border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <option value="전체">종류 (전체)</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-24 bg-gray-50 text-gray-400">
                    <option>경북</option>
                  </select>
                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-24 bg-gray-50 text-gray-400">
                    <option>구미시</option>
                  </select>

                  {/* 동 Select */}
                  <select 
                    value={searchDong}
                    onChange={(e) => {
                      setSearchDong(e.target.value);
                      setSelectedGroupFilter(null);
                    }}
                    className={`border rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 font-bold transition-all ${
                      searchDong !== '전체' 
                        ? 'border-[#ff6600] text-[#ff6600] bg-orange-50 ring-2 ring-orange-200' 
                        : 'border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <option value="전체">동 (전체)</option>
                    {uniqueDongs.map(dong => (
                      <option key={dong} value={dong}>{dong}</option>
                    ))}
                  </select>

                  {/* 계약/거래유형 Select */}
                  <select 
                    value={searchContract}
                    onChange={(e) => {
                      setSearchContract(e.target.value);
                      setSelectedGroupFilter(null);
                    }}
                    className={`border rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-28 font-bold transition-all ${
                      searchContract !== '전체' 
                        ? 'border-[#ff6600] text-[#ff6600] bg-orange-50 ring-2 ring-orange-200' 
                        : 'border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <option value="전체">계약 (전체)</option>
                    <option value="매매">매매</option>
                    <option value="전세">전세</option>
                    <option value="월세">월세</option>
                    <option value="단기">단기</option>
                  </select>

                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-20 bg-gray-50 text-gray-400">
                    <option>리</option>
                  </select>
                  
                  <div className="flex items-center gap-1 ml-1">
                    <button className="border border-[#ff6600] text-[#ff6600] px-3 py-1.5 rounded font-medium bg-white text-xs">일반</button>
                    <button disabled className="border border-gray-200 text-gray-400 px-3 py-1.5 rounded bg-gray-50 cursor-not-allowed text-xs">산</button>
                  </div>
                  
                  <input 
                    type="text" 
                    value={bunbeon}
                    onChange={(e) => setBunbeon(e.target.value)}
                    placeholder="본번" 
                    className="border border-gray-300 rounded px-3 py-1.5 w-20 outline-none focus:border-[#ff6600]" 
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="text" 
                    value={bubeon}
                    onChange={(e) => setBubeon(e.target.value)}
                    placeholder="부번" 
                    className="border border-gray-300 rounded px-3 py-1.5 w-20 outline-none focus:border-[#ff6600]" 
                  />
                </div>
              </div>

              {/* Row 3: 조건조회 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center border-b md:border-b-0 md:border-r border-gray-100">
                  조건조회
                </div>
                <div className="flex-1 p-3 md:p-4 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">건물명 검색</span>
                    <input 
                      type="text" 
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = document.getElementById('vacancy-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      placeholder="예: 크라운빌"
                      className={`border rounded px-3 py-1.5 w-36 sm:w-44 outline-none text-xs sm:text-sm transition-all ${
                        searchName.trim() 
                          ? 'border-[#ff6600] bg-orange-50/70 font-semibold text-gray-900 ring-2 ring-orange-200' 
                          : 'border-gray-300 bg-white focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">상세주소 검색</span>
                    <input 
                      type="text" 
                      value={searchAddr}
                      onChange={(e) => setSearchAddr(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = document.getElementById('vacancy-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      placeholder="예: 형곡동"
                      className={`border rounded px-3 py-1.5 w-40 sm:w-48 outline-none text-xs sm:text-sm transition-all ${
                        searchAddr.trim() 
                          ? 'border-[#ff6600] bg-orange-50/70 font-semibold text-gray-900 ring-2 ring-orange-200' 
                          : 'border-gray-300 bg-white focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">월세범위</span>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <input 
                          type="number" 
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const el = document.getElementById('vacancy-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          placeholder="최소"
                          className={`border rounded pl-2.5 pr-7 py-1.5 w-20 sm:w-24 outline-none text-xs sm:text-sm transition-all ${
                            priceMin.trim() 
                              ? 'border-[#ff6600] bg-orange-50/70 font-semibold text-gray-900 ring-2 ring-orange-200' 
                              : 'border-gray-300 bg-white focus:border-[#ff6600]'
                          }`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
                      </div>
                      <span className="text-gray-400">~</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const el = document.getElementById('vacancy-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          placeholder="최대"
                          className={`border rounded pl-2.5 pr-7 py-1.5 w-20 sm:w-24 outline-none text-xs sm:text-sm transition-all ${
                            priceMax.trim() 
                              ? 'border-[#ff6600] bg-orange-50/70 font-semibold text-gray-900 ring-2 ring-orange-200' 
                              : 'border-gray-300 bg-white focus:border-[#ff6600]'
                          }`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">매물번호</span>
                    <div className={`flex items-center border rounded overflow-hidden transition-all ${
                      searchPropertyId.trim() 
                        ? 'border-[#ff6600] bg-orange-50/70 ring-2 ring-orange-200' 
                        : 'border-gray-300 bg-white focus-within:border-[#ff6600]'
                    }`}>
                      <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1.5 text-xs sm:text-sm border-r border-gray-200 shrink-0 select-none">
                        TW-
                      </span>
                      <input 
                        type="text" 
                        value={searchPropertyId}
                        onChange={(e) => {
                          const val = e.target.value.replace(/^(tw-?|tw_?)/i, '').replace(/[^0-9]/g, '');
                          setSearchPropertyId(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const el = document.getElementById('vacancy-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        placeholder="숫자 입력" 
                        className="px-2.5 py-1.5 w-20 sm:w-24 outline-none text-xs sm:text-sm bg-transparent font-semibold text-gray-900" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: 더블로켓 */}
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center gap-1 border-b md:border-b-0 md:border-r border-gray-100 invisible">
                  더블로켓
                  <Info size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-gray-500 text-xs">※ 실시간 다중 조건 검색이 상시 작동하고 있습니다.</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('vacancy-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-[#0054ff] text-white px-5 py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                      결과 확인
                    </button>
                    <button 
                      onClick={handleResetFilters}
                      className="bg-[#ffcc00] text-gray-900 px-5 py-2 rounded text-sm font-bold hover:bg-yellow-500 transition-colors shadow-sm cursor-pointer"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulletin Board Section */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 md:p-6 mt-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 text-[#ff6600] rounded-lg">
                  <FileText size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base md:text-lg text-gray-900">태왕공인중개사사무소 알림 & 공지사항</h3>
              </div>
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">최신 공지 및 임대인/임차인 유용한 소식을 확인하세요</span>
            </div>

            <div className="divide-y divide-gray-100">
              {boardPosts && boardPosts.filter((p: any) => p.category !== '표시의무사항').length > 0 ? (
                [...boardPosts]
                  .filter((p: any) => p.category !== '표시의무사항')
                  .sort((a, b) => {
                    if (a.important && !b.important) return -1;
                    if (!a.important && b.important) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .slice(0, 5)
                  .map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => setSelectedNotice(post)}
                      className={`py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-orange-50/30 px-2 rounded-lg transition-colors ${
                        post.important ? 'bg-orange-50/10 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${
                          post.category === '중요' || post.important
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : post.category === '이벤트'
                            ? 'bg-blue-50 text-[#ff6600] border border-orange-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {post.category || '공지'}
                        </span>
                        <p className={`text-sm truncate ${
                          post.important ? 'text-[#ff6600] font-bold' : 'text-gray-800'
                        }`}>
                          {post.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{getTodayDateString()}</span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">등록된 알림사항이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Notice Detail Modal */}
          {selectedNotice && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ff6600] text-white">
                      {selectedNotice.category}
                    </span>
                    <span className="font-bold text-sm">태왕 소식통</span>
                  </div>
                  <button 
                    onClick={() => setSelectedNotice(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 leading-snug">
                    {selectedNotice.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">등록일 : {getTodayDateString()}</p>
                  <div className="border-t border-gray-100 pt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                    {selectedNotice.content}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-150 flex justify-end">
                  <button 
                    onClick={() => setSelectedNotice(null)}
                    className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Section: 공실현황 (Vacancy Status) */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 md:p-8 mt-2 md:mt-4">
            <div className="flex items-center gap-3 mb-2">
               <h2 className="text-2xl md:text-3xl font-bold text-[#ff6600] tracking-tight">구미시 공실현황</h2>
               <span className="bg-[#ff6600] text-white text-xs font-bold px-2 py-1 rounded">360 VR 지원</span>
            </div>
            <p className="text-gray-600 text-[15px] mb-8">태왕공인중개사사무소에서 제공하는 구미시 원룸 매물 현황과 생생한 360 VR 투어를 한눈에 확인하실 수 있습니다.</p>
            
            {/* Location Filters */}
            <div className="hidden flex-wrap gap-2 mb-8">
              {['전체', '거의동', '고아읍', '광평동', '구평동', '구포동', '금전동', '남통동', '도량동', '봉곡동', '부곡동', '비산동', '사곡동', '산동면', '상모동', '선기동', '선산읍', '송정동', '수점동', '시미동', '신평동', '양호동', '오태동', '옥계동', '원평동', '인동', '인의동', '임수동', '임은동', '장천면', '지산동', '진평동', '해평면', '형곡동', '황산동'].map((loc, i) => (
                <button key={i} className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${i === 0 ? 'bg-[#ffcc00] text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {loc}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="hidden items-center gap-4 mb-8 bg-white py-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-700 font-medium">건물명</span>
                <input type="text" className="border border-gray-300 rounded px-3 py-1.5 w-32 outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-700 font-medium">지역</span>
                <select className="border border-gray-300 rounded px-3 py-1.5 w-24 outline-none focus:border-blue-500 text-sm bg-white">
                  <option>전체</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-700 font-medium">주소</span>
                <input type="text" className="border border-gray-300 rounded px-3 py-1.5 w-40 outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-700 font-medium">구분</span>
                <select className="border border-gray-300 rounded px-3 py-1.5 w-24 outline-none focus:border-blue-500 text-sm bg-white">
                  <option>전체</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-700 font-medium">관리부동산</span>
                <select className="border border-gray-300 rounded px-3 py-1.5 w-24 outline-none focus:border-blue-500 text-sm bg-white">
                  <option>전체</option>
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {/* buttons moved */}
              </div>
            </div>

            {/* List Header */}
            <div id="vacancy-section" className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
              <div className="text-[14px] text-gray-700 flex items-center gap-1.5 flex-wrap">
                검색결과 <strong className="text-orange-600 font-bold">{filteredUserProperties.length}개</strong>의 매물이 있습니다.
                {activeStatusFilter !== '전체' && <span className="text-xs bg-orange-100 text-[#ff6600] px-2 py-0.5 rounded font-bold">{activeStatusFilter}</span>}
                {searchType !== '전체' && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-bold">{searchType}</span>}
                {searchDong !== '전체' && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-bold">{searchDong}</span>}
                {searchContract !== '전체' && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-bold">{searchContract}</span>}
                {searchName.trim() !== '' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">건물: {searchName}</span>}
                {searchAddr.trim() !== '' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">주소: {searchAddr}</span>}
                {(priceMin.trim() !== '' || priceMax.trim() !== '') && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                    월세: {priceMin || '0'}~{priceMax || '∞'}만
                  </span>
                )}
                {searchPropertyId.trim() !== '' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">매물번호: TW-{searchPropertyId}</span>}
              </div>
              {isLoggedIn && (
                <button 
                  onClick={() => {
                    const dataStr = "data:text/csv;charset=utf-8,\uFEFF" 
                      + "건물명,주소,구분,보증금,월세,비고\n"
                      + filteredUserProperties.map(p => `"${p.name}","${p.addr}","${p.type}","${p.deposit || ''}","${p.rent || ''}","${p.note || ''}"`).join("\n");
                    const encodedUri = encodeURI(dataStr);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "taewang_properties.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-emerald-700 hover:text-emerald-900 transition-colors font-semibold"
                >
                  <span className="bg-[#217346] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">XLS</span>
                  엑셀 다운로드
                </button>
              )}
            </div>

            {/* Desktop Table View (lg:block) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-center text-[13px] border-t-2 border-gray-500 min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50/50">
                    <th className="py-3 font-medium text-gray-600 w-36">대표사진</th>
                    <th className="py-3 font-medium text-gray-600 w-16">번호</th>
                    <th className="py-3 font-medium text-gray-600">건물명</th>
                    <th className="py-3 font-medium text-gray-600">주소</th>
                    <th className="py-3 font-medium text-gray-600 w-24">구분</th>
                    <th className="py-3 font-medium text-gray-600 leading-tight w-28">보증금<br/><span className="text-[11px] text-gray-400 font-normal">(단위:만원)</span></th>
                    <th className="py-3 font-medium text-gray-600 leading-tight w-28">월세<br/><span className="text-[11px] text-gray-400 font-normal">(단위:만원)</span></th>
                    <th className="py-3 font-medium text-gray-600">비고</th>
                    <th className="py-3 font-medium text-[#ff6600] w-24">VR투어</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProperties.length > 0 ? (
                    displayedProperties.map((row, idx) => {
                      const vrImgUrl = row.vrUrl ? (row.vrUrl.split(/(?=https?:\/\/)/)[0]?.trim() || '/sphere.jpg') : '/sphere.jpg';

                      return (
                        <tr 
                          key={row.id || idx}
                          id={`property-item-${idx}`}
                          className="group border-b border-gray-200 hover:bg-orange-50/30 transition-colors cursor-pointer" 
                          onClick={() => {
                            navigate('/property/' + row.id);
                          }}
                        >
                          <td className="py-2 px-2 flex justify-center items-center">
                            <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-xs group-hover:border-orange-400 group-hover:shadow-md transition-all shrink-0 relative">
                              <img 
                                src={vrImgUrl} 
                                alt={`${row.name} 대표사진`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/sphere.jpg';
                                }}
                              />
                              {/* PC 대표사진 워터마크 (50% 투명도 주황 건물 로고 아이콘 + 360 VR 투어) */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="flex flex-col items-center justify-center opacity-50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                                  <TaewangLogoIcon className="w-6 h-6 shrink-0" />
                                  <span className="text-white font-extrabold text-[10px] tracking-tight whitespace-nowrap drop-shadow-sm mt-0.5">
                                    360 VR 투어
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-gray-400">TW-{row.id}</td>
                          <td className="py-4 text-gray-900 font-bold">{row.name}</td>
                          <td className="py-4 text-gray-700 text-left px-2">{formatAddress(row.addr, isLoggedIn)}</td>
                          <td className="py-4 text-gray-700">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">{row.type}</span>
                          </td>
                          <td className="py-4 text-gray-900 font-semibold whitespace-pre-line">{row.deposit}</td>
                          <td className="py-4 text-orange-600 font-bold whitespace-pre-line">{row.rent}</td>
                          <td className="py-4 text-gray-500 text-left text-[12px] max-w-xs truncate" title={row.note}>{row.note}</td>
                          <td className="py-4" onClick={(e) => e.stopPropagation()}>
                            {row.vr ? (
                              <Link 
                                to={`/property/${row.id}`}
                                className="bg-[#ff6600] text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap inline-block animate-pulse"
                              >
                                VR 보기
                              </Link>
                            ) : (
                              <span className="text-gray-400 text-xs">준비중</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-gray-400 text-center text-sm font-medium">
                        조건에 일치하는 매물이 없습니다.<br />검색 조건을 변경하거나 필터를 초기화해 주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Combined Photo + Card Layout (lg:hidden) */}
            <div className="lg:hidden flex flex-col gap-4">
              {displayedProperties.length > 0 ? (
                displayedProperties.map((row, idx) => {
                  const vrImgUrl = row.vrUrl ? (row.vrUrl.split(/(?=https?:\/\/)/)[0]?.trim() || '/sphere.jpg') : '/sphere.jpg';
                  const listingIdText = row.listingNumber || (row.id?.toString().startsWith('TW-') ? row.id : `TW-${row.id}`);

                  return (
                    <div 
                      key={row.id || idx}
                      id={`property-item-mobile-${idx}`}
                      onClick={() => navigate('/property/' + row.id)}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col overflow-hidden"
                    >
                      {/* Top: Generous 360 VR Photo Preview Container (Taller aspect ratio on mobile) */}
                      <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] bg-gray-100 overflow-hidden group">
                        <img 
                          src={vrImgUrl} 
                          alt={`${row.name} 360 VR`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/sphere.jpg';
                          }}
                        />
                        
                        {/* Top Badges over image (Clear badges with shadow) */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                              매물번호 {listingIdText}
                            </span>
                            <span className="bg-[#ff6600] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md">
                              {row.type}
                            </span>
                          </div>
                          {row.vr && (
                            <span className="bg-[#0f223d]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-blue-400/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              360° VR
                            </span>
                          )}
                        </div>

                        {/* Center VR badge/icon overlay (Hidden on screen per user request so thumbnail image is clear) */}
                        <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none z-10">
                          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5 shadow-md">
                            <Vr360LogoIcon className="w-5 h-5 text-white shrink-0" />
                            <span className="text-xs font-bold text-orange-200 tracking-wide">360° VR 터치하여 감상</span>
                          </div>
                        </div>

                        {/* Bottom image overlay caption (Neat text box + drop shadow without obscuring image) */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white pointer-events-none">
                          <div className="inline-block bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-xl">
                            <div className="font-extrabold text-base sm:text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                              {row.name} {isLoggedIn && row.room ? `${row.room}호` : ''}
                            </div>
                            <div className="text-xs text-gray-100 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1 mt-0.5">
                              <span>📍 구미시 {formatAddress(row.addr, isLoggedIn)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Property Specs & Details */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 bg-orange-50/40 p-3 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 shrink-0 font-medium">보증금:</span>
                            <span className="font-bold text-gray-900 text-sm">{row.deposit || '-'} 만원</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 shrink-0 font-medium">월세:</span>
                            <span className="font-bold text-[#ff6600] text-sm">{row.rent || '-'} 만원</span>
                          </div>
                          {row.note && (
                            <div className="col-span-2 flex items-start gap-1.5 text-gray-600 pt-1.5 border-t border-orange-200/60 mt-0.5">
                              <span className="text-gray-400 shrink-0 font-medium">📝 비고:</span>
                              <span className="truncate">{row.note}</span>
                            </div>
                          )}
                        </div>

                        {/* Full Width Action Button */}
                        <Link 
                          to={`/property/${row.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-center bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-0.5"
                        >
                          <span>360° VR 투어 보기</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 bg-white rounded-xl border border-gray-200 text-gray-400 text-center text-sm font-medium">
                  조건에 일치하는 매물이 없습니다.<br />검색 조건을 변경하거나 필터를 초기화해 주세요.
                </div>
              )}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredUserProperties.length && (
              <div className="flex flex-col items-center gap-2 mt-8">
                <button 
                  onClick={handleLoadMore}
                  className="bg-white border-2 border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm md:text-base cursor-pointer group"
                >
                  <span>매물 더보기</span>
                  <span className="text-xs bg-orange-100 group-hover:bg-white group-hover:text-[#ff6600] text-[#ff6600] px-2.5 py-0.5 rounded-full font-bold transition-colors">
                    {Math.min(10, filteredUserProperties.length - visibleCount)}개 더보기
                  </span>
                  <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  전체 {filteredUserProperties.length}개 중 {displayedProperties.length}개 표시 중
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[280px] flex-shrink-0">
          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 sticky top-[100px]">
          
            {/* Banner 1: VR Tour Event */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden relative">
            <div className="p-6 pb-5">
              <div className="flex items-center gap-1 text-[#ff6600] font-black text-xl mb-3 tracking-tighter">
                <Building2 size={20} />
                태왕 360 VR
              </div>
              <h3 className="font-bold text-lg leading-snug text-gray-900 mb-4">
                구미시 원룸, 투룸<br />360 VR 무료 촬영
              </h3>
              <button className="w-full bg-[#ff6600] text-white rounded p-3 text-sm font-bold flex justify-between items-center hover:bg-[#e65c00] transition-colors shadow-sm">
                <div className="text-left font-normal text-[13px] leading-tight opacity-95">
                  임대인 여러분들의 방을<br/>생생하게 촬영해 드립니다!
                </div>
                <ChevronDown size={20} className="-rotate-90" />
              </button>
            </div>
          </div>

          {/* Banner 2: Kakao Talk Consult */}
          <div className="flex-1 bg-[#fae100] rounded-xl shadow-sm border border-[#e5cd00] overflow-hidden relative">
            <div className="p-6 pb-5">
              <div className="flex items-center gap-1 text-[#3c1e1e] font-bold text-xl mb-3">
                카카오톡 상담
              </div>
              <h3 className="font-bold text-lg leading-snug text-[#3c1e1e] mb-4">
                언제든 편하게<br />문의주세요!
              </h3>
              <button className="w-full bg-[#3c1e1e] text-white rounded p-3 text-[13px] flex justify-between items-center hover:bg-[#2b1515] transition-colors shadow-sm">
                <div className="text-left leading-tight">
                  원하는 조건의 방을<br/>빠르게 찾아드립니다.
                </div>
                <ChevronDown size={20} className="-rotate-90" />
              </button>
            </div>
          </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white mt-8 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {/* Top colored line */}
        <div className="w-full h-1 bg-[#ff6600]"></div>
        
        <div className="w-full px-8 py-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center max-w-7xl mx-auto">
          {/* Logo area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Vr360LogoIcon className="w-9 h-9 text-[#ff6600] shrink-0" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">태왕공인중개사사무소</h2>
          </div>
          
          {/* Info area */}
          <div className="flex flex-col text-[13px] text-gray-600 gap-1.5 md:border-l border-gray-300 md:pl-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
              <span>명칭 : 태왕공인중개사사무소</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>대표 : 유정화</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>등록번호 : 47190-2016-00027</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>위치 : 구미시 송정대로 6길18 (송정동 472-10번지)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-gray-700">
              <span>문의처 : <a href="tel:054-455-6789" className="hover:text-[#ff6600] underline">054-455-6789</a>, <a href="tel:010-7590-0111" className="hover:text-[#ff6600] underline">010-7590-0111</a></span>
            </div>
            <div className="mt-2 text-gray-400 font-medium text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 border-t border-gray-100 pt-4">
              <span>Copyright © 태왕공인중개사사무소. 좋습니다.</span>
              <Link to="/admin" className="text-gray-400 hover:text-[#ff6600] underline font-bold transition-colors">회원가입</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PropertyDetail({ properties, boardPosts }: { properties: any[]; boardPosts: any[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const decodedId = id ? decodeURIComponent(id).trim() : '';
  const selectedProperty = properties.find(p => 
    (p.id && String(p.id).trim() === decodedId)
  );
  const [mapUrl, setMapUrl] = useState<string>('');
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [copiedPos, setCopiedPos] = useState<string | null>(null);
  
  // Blog image upload state
  const [isUploadingBlogImg, setIsUploadingBlogImg] = useState(false);
  const [blogUploadProgress, setBlogUploadProgress] = useState(0);
  const blogFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBlogFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProperty) return;

    setIsUploadingBlogImg(true);
    setBlogUploadProgress(0);

    try {
      const { storage, db } = await import('./firebase');
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');

      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `blog_photos/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        const downloadURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setBlogUploadProgress((prev) => {
                const totalProgress = prev + (progress / files.length);
                return totalProgress > 100 ? 100 : totalProgress;
              });
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
        newUrls.push(downloadURL);
      }

      if (selectedProperty.firebaseId) {
        const propertyRef = doc(db, 'properties', selectedProperty.firebaseId);
        await updateDoc(propertyRef, {
          blog_images: arrayUnion(...newUrls)
        });
      } else {
        alert("Firestore ID가 없어 매물을 업데이트할 수 없습니다.");
      }
    } catch (error) {
      console.error('Blog photo upload failed:', error);
      alert('블로그 사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingBlogImg(false);
      setBlogUploadProgress(0);
      if (blogFileInputRef.current) {
        blogFileInputRef.current.value = '';
      }
    }
  };
  
  const initialDetails = selectedProperty?.details || {};
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkPosition>(
    initialDetails.watermark_pos || 'center'
  );
  const [showWatermark, setShowWatermark] = useState<boolean>(
    initialDetails.show_watermark !== undefined ? initialDetails.show_watermark : true
  );

  useEffect(() => {
    if (selectedProperty) {
      const details = selectedProperty.details || {};
      setWatermarkStyle(details.watermark_pos || 'center');
      setShowWatermark(details.show_watermark !== undefined ? details.show_watermark : true);
    }
  }, [selectedProperty]);

  const handleCopyLink = (pos: string) => {
    const currentUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopiedPos(pos);
        setTimeout(() => setCopiedPos(null), 2000);
      }).catch(() => {
        fallbackCopy(currentUrl, pos);
      });
    } else {
      fallbackCopy(currentUrl, pos);
    }
  };

  const fallbackCopy = (url: string, pos: string) => {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = url;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    setCopiedPos(pos);
    setTimeout(() => setCopiedPos(null), 2000);
  };

  const renderCopyButton = (pos: string, extraClasses: string = "") => {
    const isCopied = copiedPos === pos;
    return (
      <button
        onClick={() => handleCopyLink(pos)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
          isCopied 
            ? 'bg-emerald-600 text-white' 
            : 'bg-white border border-[#ff6600] text-[#ff6600] hover:bg-orange-50'
        } ${extraClasses}`}
        title="상세페이지 링크 주소 복사하기"
      >
        {isCopied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span>링크 복사완료! ✓</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>상세페이지 링크 복사</span>
          </>
        )}
      </button>
    );
  };

  const listingNo = selectedProperty?.listingNumber || (selectedProperty?.id?.toString().startsWith('TW-') ? selectedProperty.id : `TW-${selectedProperty?.id}`);
  const dongName = selectedProperty?.dong || (selectedProperty?.addr ? selectedProperty.addr.split(' ')[0] : '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!selectedProperty) return;
    
    setLoadingMap(true);
    // Google Maps Embed is authorized to be embedded in an iframe and has 100% accurate geocoding for Korean addresses
    const query = `경상북도 구미시 ${selectedProperty.addr}`;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
    setMapUrl(url);
    
    const timer = setTimeout(() => {
      setLoadingMap(false);
    }, 400);

    // Update document title and OG meta tags for link previews
    const lNo = selectedProperty.listingNumber || (selectedProperty.id?.toString().startsWith('TW-') ? selectedProperty.id : `TW-${selectedProperty.id}`);
    let bName = selectedProperty.name || '매물';
    bName = bName.replace(/(\s*\d+동)?\s*\d+호?$/, '').trim();

    const priceText = selectedProperty.rent && selectedProperty.rent !== '0' && selectedProperty.rent !== 0
      ? `보증금 ${selectedProperty.deposit}만, 월 ${selectedProperty.rent}만`
      : `보증금 ${selectedProperty.deposit}만`;

    const titleText = `태왕공인중개사사무소 - 매물 ${lNo}`;
    const descText = `[건물명-${bName}] ${selectedProperty.addr || ''} / ${selectedProperty.type || '원룸'} / ${selectedProperty.contract || '월세'} / ${priceText}`;

    document.title = titleText;

    let metaTitle = document.querySelector('meta[property="og:title"]');
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaTitle);
    }
    metaTitle.setAttribute('content', titleText);

    let metaDesc = document.querySelector('meta[property="og:description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('property', 'og:description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descText);

    let standardDesc = document.querySelector('meta[name="description"]');
    if (!standardDesc) {
      standardDesc = document.createElement('meta');
      standardDesc.setAttribute('name', 'description');
      document.head.appendChild(standardDesc);
    }
    standardDesc.setAttribute('content', descText);

    return () => clearTimeout(timer);
  }, [selectedProperty]);

  if (!selectedProperty) return <div className="p-8 text-center">매물을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-orange-200 sticky top-0 z-50">
        <div className="w-full max-w-[1536px] mx-auto relative">
          <div className="w-full px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-10 w-full sm:w-auto justify-between sm:justify-start">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 text-[#ff6600] font-black text-xl md:text-2xl tracking-tighter hover:opacity-95 transition-opacity">
                <Vr360LogoIcon className="w-8 h-8 md:w-9 md:h-9 shrink-0" />
                <span>태왕공인중개사사무소</span>
              </Link>
              
              {/* Navigation */}
              <nav className="flex gap-8 text-[15px] font-medium text-gray-600">
                <div className="relative">
                  <Link to="/" className="text-[#ff6600] font-bold">360 VR 광고 매물공실현황</Link>
                  <div className="absolute -bottom-5 left-0 w-full h-[3px] bg-[#ff6600]"></div>
                </div>
              </nav>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-end">
              <Link to="/" className="flex items-center gap-1 text-[#ff6600] font-bold text-xs md:text-sm bg-orange-50 px-2 md:px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors whitespace-nowrap">
                360 VR 투어 안내
              </Link>
              <a href="tel:054-455-6789" className="flex items-center gap-1 bg-[#ff6600] text-white px-3 md:px-4 py-1.5 rounded-full font-bold text-xs md:text-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap">
                상담문의: 054-455-6789
              </a>
            </div>
          </div>
          {/* Top-right floating banner button */}
          <div className="hidden lg:block absolute right-6 top-16 z-40">
            <button className="bg-white border border-[#ff6600] text-[#ff6600] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-orange-50 transition-colors">
              구미시 원룸 360 VR 전문
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Expanded to full window width (max-w-[1536px]) */}
      <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 py-6 md:py-8 flex-1">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            목록으로 돌아가기
          </button>
          {renderCopyButton('1')}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 1. 건물명 & 기본 위치 */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4 bg-white">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">건물명 :</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center flex-wrap gap-2 sm:gap-3">
                <span>{selectedProperty.name}</span>
                {isLoggedIn && <span className="text-[#ff6600] text-xl md:text-2xl">{selectedProperty.room}호</span>}
                <span className="text-[#ff6600] text-lg sm:text-2xl font-bold ml-1">(매물번호 {listingNo})</span>
              </h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-lg">{formatAddress(selectedProperty.addr, isLoggedIn)}</p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
              <span className="bg-orange-50 text-[#ff6600] border border-orange-200 px-4 py-2 rounded-full text-xs sm:text-sm font-bold">
                {selectedProperty.type}
              </span>
            </div>
          </div>

          {/* 2. 지도 */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
                <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
                <span>2. 위치 및 지도</span>
                <span className="text-gray-500 font-normal text-sm sm:text-base">(매물번호 {listingNo})</span>
              </h3>
              {renderCopyButton('2')}
            </div>
            <div className="w-full aspect-[9/16] lg:aspect-[2/1] min-h-[260px] bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 shadow-sm">
              {loadingMap ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#f8f9fa] z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600] mb-3"></div>
                  <span className="font-medium text-xs sm:text-sm text-gray-500">지도를 불러오는 중입니다...</span>
                </div>
              ) : mapUrl ? (
                <>
                  <iframe 
                    title="Property Location Map"
                    src={mapUrl} 
                    className="absolute inset-0 w-full h-full z-0 bg-white border-none" 
                    allowFullScreen
                  ></iframe>

                  {/* 2.5x Enlarged Red Location Marker Pin Overlay with Exact Point Alignment */}
                  <div className="absolute top-1/2 left-1/2 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-full flex flex-col items-center">
                      {/* Info Bubble right above the pin */}
                      <div className="mb-2 bg-white/95 backdrop-blur-md border-2 border-[#ff6600] shadow-xl px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap text-gray-900">
                        <span className="text-[#ff6600]">건물명:</span>
                        <span className="text-gray-900 font-extrabold">{selectedProperty.name}</span>
                        <span className="text-[#ff6600] font-bold">(매물번호 {listingNo})</span>
                        {dongName && (
                          <span className="text-gray-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-xs font-bold">{dongName}</span>
                        )}
                      </div>

                      {/* Enlarged Red Marker SVG */}
                      <div className="relative">
                        <svg 
                          className="w-14 h-18 sm:w-16 sm:h-20 drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)] filter" 
                          viewBox="0 0 24 32" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Red Marker Body */}
                          <path 
                            d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" 
                            fill="#EA4335"
                          />
                          {/* Dark Red Accent Contour */}
                          <path 
                            d="M12 0.5C5.64873 0.5 0.5 5.64873 0.5 12C0.5 16.2 3.8 21.8 7.8 26.5C9.8 28.8 11.3 30.5 12 31.3C12.7 30.5 14.2 28.8 16.2 26.5C20.2 21.8 23.5 16.2 23.5 12C23.5 5.64873 18.3513 0.5 12 0.5Z" 
                            stroke="#B31412" 
                            strokeWidth="1"
                          />
                          {/* Center White Circle */}
                          <circle cx="12" cy="11" r="4.5" fill="white" />
                          {/* Inner Red Dot */}
                          <circle cx="12" cy="11" r="2.2" fill="#EA4335" />
                        </svg>
                      </div>
                      {/* Marker Shadow */}
                      <div className="w-8 h-2 bg-black/40 rounded-full blur-[2px] -mt-1"></div>
                    </div>
                  </div>

                  {/* Dark gradient at the bottom to make the button text stand out perfectly */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-6 text-center z-10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="font-bold text-gray-800 text-sm mb-1">{formatAddress(selectedProperty.addr, isLoggedIn)}</span>
                  <span className="text-xs text-gray-500 max-w-[280px]">
                    지도를 직접 불러올 수 없습니다.<br/>아래 네이버 지도 버튼을 눌러 위치를 확인해주세요.
                  </span>
                </div>
              )}
              
              {/* Naver Map Button Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-20 sm:max-w-xs sm:left-auto">
                <a 
                  href={`https://map.naver.com/v5/search/${encodeURIComponent('구미시 ' + selectedProperty.addr)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#03C75A] text-white py-3 px-4 rounded-lg font-bold text-sm shadow-md hover:bg-[#02b350] hover:shadow-lg transition-all text-center"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  네이버 지도로 열기 & 길찾기
                </a>
              </div>
            </div>
          </div>

          {/* 3. 매물 상세정보 */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center flex-wrap gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              <span>3. 매물 상세 정보</span>
              <span className="text-gray-500 font-normal text-sm sm:text-base">(매물번호 {listingNo})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm sm:text-base">
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                <span className="text-gray-500 font-medium">관리부동산</span>
                <span className="text-gray-900 font-bold">{selectedProperty.mgt}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                <span className="text-gray-500 font-medium">구분</span>
                <span className="text-gray-900 font-bold">{selectedProperty.type}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                <span className="text-gray-500 font-medium">계약형태</span>
                <span className="text-gray-900 font-bold">{selectedProperty.contract}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                <span className="text-gray-500 font-medium">보증금/월세</span>
                <span className="text-[#ff6600] font-black text-xl sm:text-2xl whitespace-pre-line">
                  {selectedProperty.deposit}만 / {selectedProperty.rent}만
                </span>
              </div>
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center md:col-span-2 flex-wrap gap-2">
                <span className="text-gray-500 font-medium shrink-0">연락처</span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end text-sm sm:text-base">
                  <a 
                    href="tel:054-455-6789"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-[#ff6600] font-bold transition-all text-xs sm:text-sm"
                    title="사무실 전화 걸기"
                  >
                    <span className="text-gray-600 font-medium">사무실 전화:</span>
                    <span className="text-[#ff6600] font-extrabold hover:underline">054-455-6789</span>
                  </a>
                  <a 
                    href="tel:010-7590-0111"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-lg font-bold shadow-sm transition-all text-xs sm:text-sm"
                    title="휴대폰 전화 걸기"
                  >
                    <span className="text-orange-100 font-medium">휴대폰:</span>
                    <span className="font-extrabold hover:underline">010-7590-0111</span>
                  </a>
                  {selectedProperty.phone && 
                   !selectedProperty.phone.includes('010-7590-0111') && 
                   !selectedProperty.phone.includes('054-455-6789') && (
                    <a 
                      href={`tel:${selectedProperty.phone.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-all text-xs sm:text-sm"
                      title="전화 걸기"
                    >
                      <span className="text-gray-500 font-medium">기타:</span>
                      <span className="hover:underline">{selectedProperty.phone}</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col pt-1 sm:pt-2 md:col-span-2">
                <span className="text-gray-900 font-bold mb-3">매물특징 / 비고</span>
                <div className="bg-orange-50/50 p-4 sm:p-5 rounded-lg border border-orange-100 min-h-[80px] sm:min-h-[100px] text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {selectedProperty.note || "등록된 매물 특징이 없습니다."}
                </div>
              </div>
            </div>
          </div>

          {/* 4. 360 VR 투어 시작하기 */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-orange-50/10">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center flex-wrap gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              <span>4. 360 VR 투어</span>
              <span className="text-gray-500 font-normal text-sm sm:text-base">(매물번호 {listingNo})</span>
            </h3>
            {selectedProperty.vr ? (
              <div className="w-full rounded-2xl overflow-hidden border border-orange-200 shadow-sm h-[420px] sm:h-auto sm:aspect-[9/16] lg:h-auto lg:aspect-[2/1]">
                <VrViewer 
                  imageUrl={selectedProperty.vrUrl} 
                  propertyName={`${selectedProperty.name}${isLoggedIn && selectedProperty.room ? ' ' + selectedProperty.room + '호' : ''}`}
                  propertyAddr={`구미시 ${formatAddress(selectedProperty.addr, isLoggedIn)}`}
                />
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 text-center max-w-4xl mx-auto">
                <p className="text-gray-500 text-sm">해당 매물은 촬영 준비 중이거나 현장 확인이 완료된 매물입니다. 중개사무소로 문의주시면 실시간 상담을 지원해 드립니다.</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              {renderCopyButton('4')}
            </div>
          </div>

          {/* 5. 태왕 알림 & 안심 공지사항 */}
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center flex-wrap gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              <span>5. 태왕공인중개사사무소 알림 & 공지사항</span>
              <span className="text-gray-500 font-normal text-sm sm:text-base">(매물번호 {listingNo})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {boardPosts && boardPosts.filter((p: any) => p.category !== '표시의무사항').length > 0 ? (
                [...boardPosts]
                  .filter((p: any) => p.category !== '표시의무사항')
                  .sort((a, b) => {
                    if (a.important && !b.important) return -1;
                    if (!a.important && b.important) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .slice(0, 3)
                  .map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => setSelectedNotice(post)}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#ff6600] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[150px]"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            post.important ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-[#ff6600]'
                          }`}>
                            {post.category || '공지'}
                          </span>
                          <span className="text-[11px] text-gray-400">{getTodayDateString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-relaxed mb-4">
                          {post.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#ff6600] flex items-center gap-1 hover:underline">
                        공지 내용 상세조회 &rarr;
                      </span>
                    </div>
                  ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-400">등록된 공지사항이 없습니다.</div>
              )}
            </div>
          </div>

          {/* 6. 중개대상물표시사항 */}
          {(() => {
            const d = selectedProperty.details || {};
            const addrDisplay = formatAddress(selectedProperty.addr, isLoggedIn);
            const rawAddrDetail = d.addr_detail || `경상북도 구미시 ${selectedProperty.addr} (${selectedProperty.name})`;
            const addrDetail = isLoggedIn ? rawAddrDetail : formatAddress(rawAddrDetail, isLoggedIn);
            const landlordConfirm = d.landlord_confirm || "확인";
            const verifiedStatus = d.verified_status || "확인";
            const roomType = d.room_type || `${selectedProperty.type}·${selectedProperty.room ? selectedProperty.room.substring(0, 1) + '층' : '2층'}`;
            const rentDetail = d.rent_detail || `보증금 ${selectedProperty.deposit}만 원 / 월세 ${selectedProperty.rent}만 원`;
            const features = d.features || `1공단 인접 ${selectedProperty.addr.split(' ')[0] || ''} 최인접 배후지역 및 풀옵션 가성비방`;
            const area = d.area || "공급면적 30㎡ / 전용면적 30㎡ (전용률 100%)";
            const floor = d.floor || `${selectedProperty.room ? selectedProperty.room.substring(0, 1) + '층' : '2층'} / 총 4층`;
            const roomsBaths = d.rooms_baths || "방 1개 / 욕실 1개";
            const maintenanceFee = d.maintenance_fee || "10만 원 (수도, 인터넷, TV 포함)";
            const moveInDate = d.move_in_date || "즉시입주";
            const approvalDate = d.approval_date || "2014.11.21";
            const direction = d.direction || "남동향 (안방 기준)";
            const parking = d.parking || "가능";
            const structure = d.structure || "분리형";
            const duplex = d.duplex || "단층";
            const buildingUse = d.building_use || "단독주택";
            const propertyId = listingNo;
            const totalParking = d.total_parking || "12대";
            const descriptionText = d.description || `구미 1국가산업단지 배후 주거지역에 위치하여 공단 출퇴근 직장인분들께 최적의 접근성과 편리한 기동성을 선사합니다.\n대형 쇼핑몰인 광평동 홈플러스가 인근에 포진해 있어 주말 장보기나 다양한 생필품 조달이 무척 수월한 우수한 생활권을 갖추고 있습니다.\n실내에 들어서서 360도 VR 투어로 내부 공간을 구석구석 살펴보시면 반듯하고 가구 배치가 수월한 안정적인 방 구조가 눈에 들어옵니다.\n360도 VR 공간 체험을 통해 주방 분리형 슬라이딩 중문과 침실의 실제 깊이감 및 가구 간격의 공간감을 현장감 있게 직접 확인하실 수 있습니다.\n싱크대 수도 꼭지를 끝까지 틀어 수압 세기와 통수 상태를 점검해보았는데 세찬 물줄기가 뿜어져 나오며 하수구 역류나 물 고임 없이 시원하게 잘 빠집니다.\n욕실 및 베란다 내부까지 360도 VR 투어로 구석구석 둘러보실 수 있어 직접 현장을 방문한 것과 다름없는 정밀하고 투명한 정보를 선사합니다.\n보증금 ${selectedProperty.deposit}만 원에 월세 ${selectedProperty.rent}만 원이라는 파격적인 최저가 가성비 조건에 총 ${totalParking}의 넓은 자주식 주차장까지 완비되어 매달 주거비 부담을 덜어주는 실속 매물입니다.`;

            return (
              <div className="p-6 md:p-8 bg-gray-50/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center flex-wrap gap-2">
                  <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
                  <span>6. 중개대상물표시사항</span>
                  <span className="text-gray-500 font-normal text-sm sm:text-base">(매물번호 {listingNo})</span>
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 font-medium text-xs sm:text-sm lg:text-base">{addrDetail} {features}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">1. 소재지</span><span className="text-gray-900 break-words flex-1">{addrDetail}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">2. 집주인</span><span className="text-gray-900 break-words flex-1">{landlordConfirm}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">3. 확인매물</span><span className="text-gray-900 break-words flex-1">{verifiedStatus}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">4. 일반원룸</span><span className="text-gray-900 break-words flex-1">{roomType}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">5. 거래 조건</span><span className="text-[#ff6600] font-bold break-words flex-1">{rentDetail}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">6. 매물특징</span><span className="text-gray-900 break-words flex-1">{features}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">7. 공급/전용면적</span><span className="text-gray-900 break-words flex-1">{area}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">8. 해당층/총층</span><span className="text-gray-900 break-words flex-1">{floor}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">9. 방수/욕실수</span><span className="text-gray-900 break-words flex-1">{roomsBaths}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">10. 관리비</span><span className="text-[#ff6600] font-bold break-words flex-1">{maintenanceFee}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">11. 입주가능일</span><span className="text-gray-900 break-words flex-1">{moveInDate}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">12. 사용승인일</span><span className="text-gray-900 break-words flex-1">{approvalDate}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">13. 방향</span><span className="text-gray-900 break-words flex-1">{direction}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">14. 주차가능여부</span><span className="text-gray-900 break-words flex-1">{parking}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">15. 방구조</span><span className="text-gray-900 break-words flex-1">{structure}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">16. 복층여부</span><span className="text-gray-900 break-words flex-1">{duplex}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">17. 건축물용도</span><span className="text-gray-900 break-words flex-1">{buildingUse}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">18. 매물번호</span><span className="text-gray-900 break-words flex-1">{propertyId}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">19. 총주차대수</span><span className="text-gray-900 break-words flex-1">{totalParking}</span></div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <div className="text-gray-500 font-medium mb-2 sm:mb-3 text-sm sm:text-base">20. 상세설명</div>
                  <div className="bg-white p-4 sm:p-5 rounded border border-gray-200 text-gray-700 text-xs sm:text-sm leading-relaxed space-y-3 sm:space-y-4 whitespace-pre-wrap">
                    {(() => {
                      let text = typeof descriptionText === 'string' ? descriptionText.replace(/\\n/g, '\n') : descriptionText;
                      if (typeof text === 'string' && !text.includes('\n') && text.includes('다.')) {
                        text = text.replace(/다\.\s*/g, '다.\n\n');
                      }
                      if (typeof text === 'string') {
                        return text.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            <br/>
                          </React.Fragment>
                        ));
                      }
                      return text;
                    })()}
                  </div>
                </div>


                {/* 매물 일반 사진 (20과 21 사이) */}
                {Array.isArray(d.blog_images) && d.blog_images.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col gap-4 w-full">
                      {/* Watermark Selector ( 관리자 로그인 시에만 노출, 일반 사용자 화면에서는 숨김 ) */}
                      {isLoggedIn && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-orange-50/70 p-3.5 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                              <Shield size={16} className="text-[#ff6600]" />
                              사진 워터마크 위치 설정 (다중 선택 가능):
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(() => {
                              const isCenterActive = watermarkStyle === 'all' || watermarkStyle.split(',').map(s => s.trim()).includes('center');
                              const isBottomRightActive = watermarkStyle === 'all' || watermarkStyle.split(',').map(s => s.trim()).includes('bottom-right');
                              const isTopLeftActive = watermarkStyle === 'all' || watermarkStyle.split(',').map(s => s.trim()).includes('top-left');
                              const isAllActive = isCenterActive && isBottomRightActive && isTopLeftActive;

                              const toggleStyle = (target: 'center' | 'bottom-right' | 'top-left' | 'all') => {
                                if (target === 'all') {
                                  setWatermarkStyle(isAllActive ? '' : 'all');
                                  return;
                                }

                                let activeArr: string[] = [];
                                if (watermarkStyle === 'all') {
                                  activeArr = ['center', 'bottom-right', 'top-left'];
                                } else {
                                  activeArr = watermarkStyle.split(',').map(s => s.trim()).filter(Boolean);
                                }

                                if (activeArr.includes(target)) {
                                  activeArr = activeArr.filter(p => p !== target);
                                } else {
                                  activeArr.push(target);
                                }

                                if (activeArr.length === 3) {
                                  setWatermarkStyle('all');
                                } else {
                                  setWatermarkStyle(activeArr.join(','));
                                }
                              };

                              return (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => toggleStyle('all')}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isAllActive
                                        ? 'bg-[#ff6600] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-100'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                      isAllActive ? 'bg-white text-[#ff6600] border-white' : 'border-gray-300'
                                    }`}>
                                      {isAllActive && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    🌟 전체 (통합 3가지)
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleStyle('center')}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isCenterActive
                                        ? 'bg-[#ff6600] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-100'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                      isCenterActive ? 'bg-white text-[#ff6600] border-white' : 'border-gray-300'
                                    }`}>
                                      {isCenterActive && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    🏢 추천1: 중앙
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleStyle('bottom-right')}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isBottomRightActive
                                        ? 'bg-[#ff6600] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-100'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                      isBottomRightActive ? 'bg-white text-[#ff6600] border-white' : 'border-gray-300'
                                    }`}>
                                      {isBottomRightActive && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    📞 추천2: 우측하단
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleStyle('top-left')}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isTopLeftActive
                                        ? 'bg-[#ff6600] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-100'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                      isTopLeftActive ? 'bg-white text-[#ff6600] border-white' : 'border-gray-300'
                                    }`}>
                                      {isTopLeftActive && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    ⭐ 추천3: 좌측상단
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-6 w-full">
                        {d.blog_images.map((imgUrl, imgIdx) => (
                          <div 
                            key={imgIdx} 
                            className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group bg-gray-100 select-none"
                          >
                            <img 
                              src={imgUrl} 
                              alt={`매물 사진 ${imgIdx + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                            />
                            {showWatermark && <WatermarkOverlay position={watermarkStyle} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 21. 블로그 */}
                {d.blog && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-[#ff6600] font-bold mb-4 text-sm sm:text-base md:text-lg flex items-center gap-2">
                      <span className="w-1.5 h-5 sm:h-6 bg-[#ff6600] rounded-full"></span>
                      21. 블로그 (매물 포스팅)
                    </div>
                    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed space-y-3 whitespace-pre-wrap mb-6 shadow-sm">
                      {d.blog}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            목록으로 돌아가기
          </button>
          {renderCopyButton('3')}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white mt-8 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {/* Top colored line */}
        <div className="w-full h-1 bg-[#ff6600]"></div>
        
        <div className="w-full px-8 py-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center max-w-7xl mx-auto">
          {/* Logo area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Vr360LogoIcon className="w-9 h-9 text-[#ff6600] shrink-0" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">태왕공인중개사사무소</h2>
          </div>
          
          {/* Info area */}
          <div className="flex flex-col text-[13px] text-gray-600 gap-1.5 md:border-l border-gray-300 md:pl-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
              <span>명칭 : 태왕공인중개사사무소</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>대표 : 유정화</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>등록번호 : 47190-2016-00027</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>위치 : 구미시 송정대로 6길18 (송정동 472-10번지)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-gray-700">
              <span>문의처 : <a href="tel:054-455-6789" className="hover:text-[#ff6600] underline">054-455-6789</a>, <a href="tel:010-7590-0111" className="hover:text-[#ff6600] underline">010-7590-0111</a></span>
            </div>
            <div className="mt-2 text-gray-400 font-medium text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 border-t border-gray-100 pt-4">
              <span>Copyright © 태왕공인중개사사무소. 좋습니다.</span>
              <Link to="/admin" className="text-gray-400 hover:text-[#ff6600] underline font-bold transition-colors">회원가입</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* VR Modal */}
      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ff6600] text-white">
                  {selectedNotice.category}
                </span>
                <span className="font-bold text-sm">태왕 소식통</span>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <h4 className="text-lg font-bold text-gray-900 leading-snug">
                {selectedNotice.title}
              </h4>
              <p className="text-xs text-gray-400 font-medium">등록일 : {getTodayDateString()}</p>
              <div className="border-t border-gray-100 pt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {selectedNotice.content}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-150 flex justify-end">
              <button 
                onClick={() => setSelectedNotice(null)}
                className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_POSTS = [
  {
    id: '1',
    category: '중요',
    title: '★ 임대인 주목! 구미 전지역 공실 360 VR 무료 촬영 서비스',
    content: '태왕공인중개사사무소에서는 공실률을 최소화하기 위해 최신 360도 VR 파노라마 무료 촬영 서비스를 지원하고 있습니다. 매물 등록 시 "360 VR 투어 연결하기"를 활성화하시거나 유선(010-7590-0111)으로 문의주시면 중개사가 직접 방문하여 촬영 후 생생한 가상 체험 화면을 등록해 드립니다.',
    important: true,
    createdAt: getTodayDateString()
  },
  {
    id: '2',
    category: '공지',
    title: '신뢰할 수 있는 실매물 100% 안심 보장 안내',
    content: '저희 태왕공인중개사사무소에서 보여드리는 모든 공실현황은 매일 중개사가 직접 현장 검증을 완료한 실시간 실매물입니다. 허위매물 제로(0%)를 지향하며, 가격 및 보증금 조절을 정직하게 협의 및 보장해 드립니다.',
    important: false,
    createdAt: getTodayDateString()
  },
  {
    id: '3',
    category: '이벤트',
    title: '원룸/미투 계약 고객 대상 이사비 지원 및 입주 청소 조율 혜택',
    content: '여름 시즌 맞이 태왕 단독 혜택! 저희 사무소를 통해 계약 완료하시는 모든 고객분들께 제휴 업체를 통한 입주 청소 서비스 특별 혜택 및 주거안심 선물을 무상으로 증정해 드립니다. 자세한 조율 사항은 상담 시 문의주세요.',
    important: false,
    createdAt: getTodayDateString()
  }
];

export default function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [boardPosts, setBoardPosts] = useState<any[]>([]);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  
  const loading = !propertiesLoaded || !postsLoaded;

  useEffect(() => {
    // Safety fallback timer to ensure app loads even if Firebase hangs
    const timer = setTimeout(() => {
      setPropertiesLoaded(prev => {
        if (!prev) setProperties(PROPERTIES);
        return true;
      });
      setPostsLoaded(prev => {
        if (!prev) setBoardPosts(DEFAULT_POSTS);
        return true;
      });
    }, 1500);

    import('./firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
          setProperties(data.length > 0 ? data : PROPERTIES);
          setPropertiesLoaded(true);
        }, (error) => {
          console.error('Error fetching properties:', error);
          setProperties(PROPERTIES);
          setPropertiesLoaded(true);
        });

        const unsubPosts = onSnapshot(collection(db, 'boardPosts'), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
          setBoardPosts(data.length > 0 ? data : DEFAULT_POSTS);
          setPostsLoaded(true);
        }, (error) => {
          console.error('Error fetching posts:', error);
          setBoardPosts(DEFAULT_POSTS);
          setPostsLoaded(true);
        });
      }).catch(err => {
        console.error('Firestore import error:', err);
        setProperties(PROPERTIES);
        setBoardPosts(DEFAULT_POSTS);
        setPropertiesLoaded(true);
        setPostsLoaded(true);
      });
    }).catch(err => {
      console.error('Firebase import error:', err);
      setProperties(PROPERTIES);
      setBoardPosts(DEFAULT_POSTS);
      setPropertiesLoaded(true);
      setPostsLoaded(true);
    });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const preventImageContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'CANVAS' ||
          target.closest('img') ||
          target.closest('canvas') ||
          target.closest('.no-copy'))
      ) {
        e.preventDefault();
      }
    };

    const preventImageDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'CANVAS' ||
          target.closest('img') ||
          target.closest('canvas') ||
          target.closest('.no-copy'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventImageContextMenu);
    document.addEventListener('dragstart', preventImageDrag);

    return () => {
      document.removeEventListener('contextmenu', preventImageContextMenu);
      document.removeEventListener('dragstart', preventImageDrag);
    };
  }, []);

  const handleAddProperty = async (newProperty: any) => {
    try {
      const { db } = await import('./firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const nextId = (Math.max(...properties.map(p => parseInt(p.id) || 0), 0) + 1).toString();
      await addDoc(collection(db, 'properties'), { 
        ...newProperty, 
        id: nextId,
        createdAt: newProperty.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.error('Error adding property:', e);
    }
  };

  const handleUpdateProperty = async (updatedProperty: any) => {
    try {
      if (!updatedProperty.firebaseId) return;
      const { db } = await import('./firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const propertyRef = doc(db, 'properties', updatedProperty.firebaseId);
      const { firebaseId, ...dataToUpdate } = updatedProperty;
      await updateDoc(propertyRef, dataToUpdate);
    } catch (e) {
      console.error('Error updating property:', e);
    }
  };

  const handleDeleteProperty = async (id: string, firebaseId?: string) => {
    try {
      if (firebaseId) {
        const { db } = await import('./firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        const propertyRef = doc(db, 'properties', firebaseId);
        await deleteDoc(propertyRef);
      }
    } catch (e) {
      console.error('Error deleting property:', e);
    }
  };

  const handleAddPost = async (newPost: any) => {
    try {
      const { db } = await import('./firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const nextId = (Math.max(...boardPosts.map(p => parseInt(p.id) || 0), 0) + 1).toString();
      await addDoc(collection(db, 'boardPosts'), { ...newPost, id: nextId });
    } catch (e) {
      console.error('Error adding post:', e);
    }
  };

  const handleUpdatePost = async (updatedPost: any) => {
    try {
      if (!updatedPost.firebaseId) return;
      const { db } = await import('./firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const postRef = doc(db, 'boardPosts', updatedPost.firebaseId);
      const { firebaseId, ...dataToUpdate } = updatedPost;
      await updateDoc(postRef, dataToUpdate);
    } catch (e) {
      console.error('Error updating post:', e);
    }
  };

  const handleDeletePost = async (id: string, firebaseId?: string) => {
    try {
      if (firebaseId) {
        const { db } = await import('./firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        const postRef = doc(db, 'boardPosts', firebaseId);
        await deleteDoc(postRef);
      }
    } catch (e) {
      console.error('Error deleting post:', e);
    }
  };

  // Removed global loading block to allow instant render

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home properties={properties} boardPosts={boardPosts} />} />
        <Route path="/property/:id" element={<PropertyDetail properties={properties} boardPosts={boardPosts} />} />
        <Route 
          path="/admin" 
          element={
            <AdminPage 
              properties={properties} 
              onAddProperty={handleAddProperty}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
              boardPosts={boardPosts}
              onAddPost={handleAddPost}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
            />
          } 
        />
      </Routes>
    </>
  );
}
