import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import AdminPage from './components/AdminPage';
import VrViewer from './components/VrViewer';

export const PROPERTIES = [
  { id: '1', mgt: '태왕', name: '크라운빌', addr: '사곡동 422-168', room: '501', type: '미투', contract: '월', deposit: '300', rent: '30', phone: '010-7590-0111', note: '출비 : 1543#', vr: true },
  { id: '2', mgt: '태왕', name: '어린왕자 하나', addr: '옥계동 950', room: '301', type: '미투', contract: '월', deposit: '300', rent: '35', phone: '010-7590-0111', note: '', vr: true },
  { id: '3', mgt: '태왕', name: '고야드', addr: '사곡동 267-54', room: '301', type: '원룸', contract: '월 가능, 풀 옵션', deposit: '200', rent: '30', phone: '010-7590-0111', note: '현)4119', vr: false },
  { id: '4', mgt: '태왕', name: '니캉내캉', addr: '원평동 1034-10', room: '206', type: '미투', contract: '반전. 월 가능', deposit: '300', rent: '40', phone: '010-7590-0111', note: '승강기 있음. 보증금 월세조정가능', vr: true },
  { id: '5', mgt: '태왕', name: '니캉내캉', addr: '원평동 1034-10', room: '205', type: '미투', contract: '전세.반전. 월 가능', deposit: '300\n5,000', rent: '38\n8', phone: '010-7590-0111', note: '승강기있음. 보증금월세조정가능', vr: true },
  { id: '6', mgt: '태왕', name: '힐링타운', addr: '송정동 26-9', room: '305', type: '원룸', contract: '월 가능, 풀 옵션', deposit: '200', rent: '28', phone: '010-7590-0111', note: '즉시 입주가능', vr: false },
  { id: '7', mgt: '태왕', name: '리치하우스', addr: '사곡동 422-56', room: '201', type: '투룸', contract: '월 가능, 풀 옵션', deposit: '300', rent: '55', phone: '010-7590-0111', note: '', vr: true },
  { id: '8', mgt: '태왕', name: '이화빌', addr: '형곡동 192-8', room: '205', type: '미투', contract: '월 가능, 풀 옵션', deposit: '200', rent: '32', phone: '010-7590-0111', note: '', vr: true },
];

import { 
  Building2, 
  Check, 
  ChevronDown, 
  FileText, 
  Info, 
  Leaf,
  Plus, 
  Search, 
  Shield, 
  X 
} from 'lucide-react';

function Home({ properties, boardPosts }: { properties: any[]; boardPosts: any[] }) {
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  // Search & Filter States
  const [searchType, setSearchType] = useState('전체');
  const [searchDong, setSearchDong] = useState('전체');
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

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchType('전체');
    setSearchDong('전체');
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

      // 5. Name Filter
      if (searchName.trim() !== '') {
        if (!(p.name || '').toLowerCase().includes(searchName.toLowerCase())) return false;
      }

      // 6. Address Filter
      if (searchAddr.trim() !== '') {
        if (!(p.addr || '').toLowerCase().includes(searchAddr.toLowerCase())) return false;
      }

      // 7. Bunbeon & Bubeon Filter
      if (bunbeon.trim() !== '') {
        if (!(p.addr || '').includes(bunbeon)) return false;
      }
      if (bubeon.trim() !== '') {
        if (!(p.addr || '').includes(bubeon)) return false;
      }

      // 8. Price Range Filter (monthly rent)
      if (priceMin.trim() !== '') {
        const minVal = parseInt(priceMin) || 0;
        const rentVal = parseInt(p.rent) || 0;
        if (rentVal < minVal) return false;
      }
      if (priceMax.trim() !== '') {
        const maxVal = parseInt(priceMax) || 999999;
        const rentVal = parseInt(p.rent) || 0;
        if (rentVal > maxVal) return false;
      }

      // 9. Property ID Filter
      if (searchPropertyId.trim() !== '') {
        const cleanSearchId = searchPropertyId.replace('TW-', '').trim();
        if (String(p.id) !== cleanSearchId) return false;
      }

      return true;
    });
  }, [properties, activeStatusFilter, selectedGroupFilter, searchType, searchDong, searchName, searchAddr, bunbeon, bubeon, priceMin, priceMax, searchPropertyId]);

  // Counts for status cards
  const totalCount = properties.length;
  const activeCount = properties.filter(p => {
    const noteStr = (p.note || '').toLowerCase();
    return !noteStr.includes('종료') && !noteStr.includes('완료') && !noteStr.includes('퇴거');
  }).length;
  const closedCount = totalCount - activeCount;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchType, searchDong, searchName, searchAddr, bunbeon, bubeon, priceMin, priceMax, searchPropertyId, selectedGroupFilter, activeStatusFilter]);

  const totalPages = Math.ceil(filteredUserProperties.length / itemsPerPage) || 1;
  const pagedProperties = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUserProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUserProperties, currentPage]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-orange-200 sticky top-0 z-50">
        <div className="w-full max-w-[1536px] mx-auto relative">
          <div className="w-full px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-10 w-full sm:w-auto justify-between sm:justify-start">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 text-[#ff6600] font-black text-xl md:text-2xl tracking-tighter hover:opacity-95 transition-opacity">
                <Building2 size={24} className="text-[#ff6600] md:w-7 md:h-7" />
                <span>태왕공인중개사</span>
              </Link>
              
              {/* Navigation */}
              <nav className="flex gap-8 text-[15px] font-medium text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors hidden">임장활동</a>
                <div className="relative">
                  <a href="#" className="text-[#ff6600] font-bold">360 VR 광고 매물공실현황</a>
                  <div className="absolute -bottom-5 left-0 w-full h-[3px] bg-[#ff6600]"></div>
                </div>
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
              <a href="#" className="flex items-center gap-1 bg-[#ff6600] text-white px-3 md:px-4 py-1.5 rounded-full font-bold text-xs md:text-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap">
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
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center md:items-start border-b md:border-b-0 md:border-r border-gray-100">
                  취급 매물
                </div>
                <div className="flex-1 p-3 md:p-4 relative pb-12 overflow-x-auto">
                  <table className="w-full min-w-[500px] text-center border-collapse">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-200">
                        <th className="py-2 font-medium w-32">매물종류</th>
                        <th className="py-2 font-medium text-left">단지/지역명</th>
                        <th className="py-2 font-medium w-16">전체</th>
                        <th className="py-2 font-medium w-16">매매</th>
                        <th className="py-2 font-medium w-16">전세</th>
                        <th className="py-2 font-medium w-16">월세</th>
                        <th className="py-2 font-medium w-16">단기</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {groupedStats.length > 0 ? (
                        groupedStats.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={`border-b border-gray-100 last:border-0 hover:bg-orange-50/50 transition-colors cursor-pointer ${
                              selectedGroupFilter?.type === row.type && selectedGroupFilter?.dong === row.dong ? 'bg-orange-50 font-bold' : ''
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (selectedGroupFilter?.type === row.type && selectedGroupFilter?.dong === row.dong) {
                                setSelectedGroupFilter(null);
                              } else {
                                setSelectedGroupFilter({ type: row.type, dong: row.dong });
                              }
                            }}
                          >
                            <td className="py-3 text-gray-600">{row.type}</td>
                            <td className="py-3 text-left text-gray-700 flex items-center gap-1.5">
                              <span className="text-gray-900 font-medium">{row.location}</span>
                              {selectedGroupFilter?.type === row.type && selectedGroupFilter?.dong === row.dong && (
                                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">필터적용</span>
                              )}
                            </td>
                            <td className="py-3"><span className="text-blue-500 underline font-medium">{row.total}</span></td>
                            <td className="py-3"><span className="text-gray-400">{row.sell}</span></td>
                            <td className="py-3"><span className="text-gray-500 font-medium">{row.jeonse}</span></td>
                            <td className="py-3"><span className="text-blue-500 underline font-medium">{row.monthly}</span></td>
                            <td className="py-3"><span className="text-gray-400">{row.short}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-gray-400 text-center">등록된 매물이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-4 left-4 bg-[#555] text-white text-[12px] px-3 py-1.5 rounded flex items-center">
                    매물 행을 선택하시면 해당 지역/종류의 매물만 하단 표에 필터링됩니다.
                  </div>
                </div>
              </div>

              {/* Row 2: 지역조회 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center border-b md:border-b-0 md:border-r border-gray-100">
                  지역조회
                </div>
                <div className="flex-1 p-3 md:p-4 flex items-center gap-2 flex-wrap">
                  <select 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white"
                  >
                    <option value="전체">종류 (전체)</option>
                    <option value="원룸">원룸</option>
                    <option value="미투">미투</option>
                    <option value="투룸">투룸</option>
                  </select>
                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-28 bg-gray-50 text-gray-400">
                    <option>경북</option>
                  </select>
                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-28 bg-gray-50 text-gray-400">
                    <option>구미시</option>
                  </select>
                  <select 
                    value={searchDong}
                    onChange={(e) => setSearchDong(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-28 bg-white"
                  >
                    <option value="전체">동 (전체)</option>
                    {uniqueDongs.map(dong => (
                      <option key={dong} value={dong}>{dong}</option>
                    ))}
                  </select>
                  <select disabled className="border border-gray-200 rounded px-3 py-1.5 outline-none w-24 bg-gray-50 text-gray-400">
                    <option>리</option>
                  </select>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button className="border border-[#ff6600] text-[#ff6600] px-3 py-1.5 rounded font-medium bg-white">일반</button>
                    <button disabled className="border border-gray-200 text-gray-400 px-3 py-1.5 rounded bg-gray-50 cursor-not-allowed">산</button>
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
                    <span className="text-gray-600">건물명 검색</span>
                    <input 
                      type="text" 
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="예: 크라운빌"
                      className="border border-gray-300 rounded px-3 py-1.5 w-40 outline-none focus:border-[#ff6600]" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">상세주소 검색</span>
                    <input 
                      type="text" 
                      value={searchAddr}
                      onChange={(e) => setSearchAddr(e.target.value)}
                      placeholder="예: 형곡동"
                      className="border border-gray-300 rounded px-3 py-1.5 w-48 outline-none focus:border-[#ff6600]" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">월세범위</span>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <input 
                          type="number" 
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="border border-gray-300 rounded pl-3 pr-8 py-1.5 w-24 outline-none focus:border-[#ff6600]" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
                      </div>
                      <span className="text-gray-400">~</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="border border-gray-300 rounded pl-3 pr-8 py-1.5 w-24 outline-none focus:border-[#ff6600]" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">매물번호</span>
                    <input 
                      type="text" 
                      value={searchPropertyId}
                      onChange={(e) => setSearchPropertyId(e.target.value)}
                      placeholder="예: TW-1" 
                      className="border border-gray-300 rounded px-3 py-1.5 w-32 outline-none focus:border-[#ff6600] text-sm" 
                    />
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
                <h3 className="font-bold text-base md:text-lg text-gray-900">태왕 알림판 & 공지사항</h3>
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
                      <span className="text-xs text-gray-400 shrink-0">{post.createdAt}</span>
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
                  <p className="text-xs text-gray-400 font-medium">등록일 : {selectedNotice.createdAt}</p>
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
                <span className="text-[14px] text-gray-700 font-medium">주택관리</span>
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
              <div className="text-[14px] text-gray-700">
                검색결과 <strong className="text-orange-600 font-bold">{filteredUserProperties.length}개</strong>의 매물이 있습니다.
                {activeStatusFilter !== '전체' && <span className="ml-2 text-xs bg-orange-100 text-[#ff6600] px-2 py-0.5 rounded font-bold">{activeStatusFilter}</span>}
              </div>
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[13px] border-t-2 border-gray-500 min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50/50">
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
                  {pagedProperties.length > 0 ? (
                    pagedProperties.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-gray-200 hover:bg-orange-50/30 transition-colors cursor-pointer" 
                        onClick={() => {
                          navigate('/property/' + row.id);
                        }}
                      >
                        <td className="py-4 text-gray-400">TW-{row.id}</td>
                        <td className="py-4 text-gray-900 font-bold">{row.name}</td>
                        <td className="py-4 text-gray-700 text-left px-2">{row.addr}</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-gray-400 text-center text-sm font-medium">
                        조건에 일치하는 매물이 없습니다.<br />검색 조건을 변경하거나 필터를 초기화해 주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8">
                <button 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                >
                  {'<<'}
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                >
                  {'<'}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-[14px] transition-colors cursor-pointer ${
                      p === currentPage 
                        ? 'bg-[#ff6600] text-white font-bold shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                >
                  {'>'}
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                >
                  {'>>'}
                </button>
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
            <Building2 size={36} className="text-[#ff6600]" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">태왕공인중개사사무소</h2>
          </div>
          
          {/* Info area */}
          <div className="flex flex-col text-[13px] text-gray-600 gap-1.5 md:border-l border-gray-300 md:pl-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
              <span>명칭 : 태왕공인중개사사무소</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>성명 : 유정화</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>등록번호 : 47190-2016-00027</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>소재지 : 구미시 송정대로 6길18 (송정동 472-10번지)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-gray-700">
              <span>연락처 : 054-455-6789, 010-7590-0111</span>
            </div>
            <div className="mt-2 text-gray-400 font-medium text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 border-t border-gray-100 pt-4">
              <span>Copyright © 태왕공인중개사사무소. All right reserved.</span>
              <Link to="/admin" className="text-gray-400 hover:text-[#ff6600] underline font-bold transition-colors">관리자 로그인</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

function PropertyDetail({ properties, boardPosts }: { properties: any[]; boardPosts: any[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id).trim() : '';
  const selectedProperty = properties.find(p => 
    (p.id && String(p.id).trim() === decodedId) ||
    (p.name && p.room && `${p.name}_${p.room}` === decodedId) ||
    (p.name && p.name === decodedId) ||
    (p.addr && p.addr.includes(decodedId))
  );
  const [mapUrl, setMapUrl] = useState<string>('');
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

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
                <Building2 size={24} className="text-[#ff6600] md:w-7 md:h-7" />
                <span>태왕공인중개사</span>
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
              <a href="#" className="flex items-center gap-1 bg-[#ff6600] text-white px-3 md:px-4 py-1.5 rounded-full font-bold text-xs md:text-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap">
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
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          목록으로 돌아가기
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 1. 건물명 & 기본 위치 */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4 bg-white">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                {selectedProperty.name} <span className="text-[#ff6600] text-xl md:text-2xl">{selectedProperty.room}호</span>
              </h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-lg">{selectedProperty.addr}</p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="bg-orange-50 text-[#ff6600] border border-orange-200 px-4 py-2 rounded-full text-xs sm:text-sm font-bold">
                {selectedProperty.type}
              </span>
            </div>
          </div>

          {/* 2. 지도 */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              2. 위치 및 지도
            </h3>
            <div className="w-full aspect-[16/9] md:aspect-[2/1] min-h-[260px] bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 shadow-sm">
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
                  {/* Dark gradient at the bottom to make the button text stand out perfectly */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-6 text-center z-10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="font-bold text-gray-800 text-sm mb-1">{selectedProperty.addr}</span>
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
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              3. 매물 상세 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm sm:text-base">
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                <span className="text-gray-500 font-medium">주택관리</span>
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
              <div className="flex border-b border-gray-100 pb-3 justify-between items-center md:col-span-2">
                <span className="text-gray-500 font-medium">연락처</span>
                <span className="text-gray-900 font-bold whitespace-pre-line">{selectedProperty.phone}</span>
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
          <div className="p-6 md:p-8 border-b border-gray-100 bg-orange-50/10">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              4. 360 VR 투어
            </h3>
            {selectedProperty.vr ? (
              <div className="w-full rounded-2xl overflow-hidden border border-orange-200 shadow-sm max-w-5xl mx-auto">
                <VrViewer 
                  imageUrl={selectedProperty.vrUrl} 
                  propertyName={`${selectedProperty.name} ${selectedProperty.room}호`}
                  propertyAddr={`구미시 ${selectedProperty.addr}`}
                />
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 text-center max-w-4xl mx-auto">
                <p className="text-gray-500 text-sm">해당 매물은 촬영 준비 중이거나 현장 확인이 완료된 매물입니다. 중개사무소로 문의주시면 실시간 상담을 지원해 드립니다.</p>
              </div>
            )}
          </div>

          {/* 5. 태왕 알림 & 안심 공지사항 */}
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
              5. 태왕 알림 & 안심 공지사항
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
                          <span className="text-[11px] text-gray-400">{post.createdAt}</span>
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
            const addrDetail = d.addr_detail || `경상북도 구미시 ${selectedProperty.addr} (${selectedProperty.name})`;
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
            const propertyId = `TW-${selectedProperty.id}`;
            const totalParking = d.total_parking || "12대";
            const descriptionText = d.description || `구미 1국가산업단지 배후 주거지역에 위치하여 공단 출퇴근 직장인분들께 최적의 접근성과 편리한 기동성을 선사합니다.\n대형 쇼핑몰인 광평동 홈플러스가 인근에 포진해 있어 주말 장보기나 다양한 생필품 조달이 무척 수월한 우수한 생활권을 갖추고 있습니다.\n실내에 들어서서 360도 VR 투어로 내부 공간을 구석구석 살펴보시면 반듯하고 가구 배치가 수월한 안정적인 방 구조가 눈에 들어옵니다.\n360도 VR 공간 체험을 통해 주방 분리형 슬라이딩 중문과 침실의 실제 깊이감 및 가구 간격의 공간감을 현장감 있게 직접 확인하실 수 있습니다.\n싱크대 수도 꼭지를 끝까지 틀어 수압 세기와 통수 상태를 점검해보았는데 세찬 물줄기가 뿜어져 나오며 하수구 역류나 물 고임 없이 시원하게 잘 빠집니다.\n욕실 및 베란다 내부까지 360도 VR 투어로 구석구석 둘러보실 수 있어 직접 현장을 방문한 것과 다름없는 정밀하고 투명한 정보를 선사합니다.\n보증금 ${selectedProperty.deposit}만 원에 월세 ${selectedProperty.rent}만 원이라는 파격적인 최저가 가성비 조건에 총 ${totalParking}의 넓은 자주식 주차장까지 완비되어 매달 주거비 부담을 덜어주는 실속 매물입니다.`;

            return (
              <div className="p-6 md:p-8 bg-gray-50/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#ff6600] rounded-full"></span>
                  6. 중개대상물표시사항
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 font-medium text-xs sm:text-sm lg:text-base">{addrDetail} {features}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">1. 소재지</span><span className="text-gray-900 break-words flex-1">{addrDetail}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">2. 집주인</span><span className="text-gray-900 break-words flex-1">{landlordConfirm}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">3. 확인매물</span><span className="text-gray-900 break-words flex-1">{verifiedStatus}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">4. 일반원룸</span><span className="text-gray-900 break-words flex-1">{roomType}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">5. 거래 조건</span><span className="text-gray-900 break-words flex-1">{rentDetail}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">6. 매물특징</span><span className="text-gray-900 break-words flex-1">{features}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">7. 공급/전용면적</span><span className="text-gray-900 break-words flex-1">{area}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">8. 해당층/총층</span><span className="text-gray-900 break-words flex-1">{floor}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">9. 방수/욕실수</span><span className="text-gray-900 break-words flex-1">{roomsBaths}</span></div>
                  <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">10. 관리비</span><span className="text-gray-900 break-words flex-1">{maintenanceFee}</span></div>
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
                  <div className="bg-white p-4 sm:p-5 rounded border border-gray-200 text-gray-700 text-xs sm:text-sm leading-relaxed space-y-3 sm:space-y-4 whitespace-pre-line">
                    {descriptionText}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white mt-8 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {/* Top colored line */}
        <div className="w-full h-1 bg-[#ff6600]"></div>
        
        <div className="w-full px-8 py-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center max-w-7xl mx-auto">
          {/* Logo area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Building2 size={36} className="text-[#ff6600]" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">태왕공인중개사사무소</h2>
          </div>
          
          {/* Info area */}
          <div className="flex flex-col text-[13px] text-gray-600 gap-1.5 md:border-l border-gray-300 md:pl-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
              <span>명칭 : 태왕공인중개사사무소</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>성명 : 유정화</span>
              <span className="hidden md:block w-px h-3 bg-gray-300"></span>
              <span>등록번호 : 47190-2016-00027</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>소재지 : 구미시 송정대로 6길18 (송정동 472-10번지)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-gray-700">
              <span>연락처 : 054-455-6789, 010-7590-0111</span>
            </div>
            <div className="mt-2 text-gray-400 font-medium text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 border-t border-gray-100 pt-4">
              <span>Copyright © 태왕공인중개사사무소. All right reserved.</span>
              <Link to="/admin" className="text-gray-400 hover:text-[#ff6600] underline font-bold transition-colors">관리자 로그인</Link>
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
              <p className="text-xs text-gray-400 font-medium">등록일 : {selectedNotice.createdAt}</p>
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
    createdAt: '2026-07-29'
  },
  {
    id: '2',
    category: '공지',
    title: '신뢰할 수 있는 실매물 100% 안심 보장 안내',
    content: '저희 태왕공인중개사사무소에서 보여드리는 모든 공실현황은 매일 중개사가 직접 현장 검증을 완료한 실시간 실매물입니다. 허위매물 제로(0%)를 지향하며, 가격 및 보증금 조절을 정직하게 협의 및 보장해 드립니다.',
    important: false,
    createdAt: '2026-07-28'
  },
  {
    id: '3',
    category: '이벤트',
    title: '원룸/미투 계약 고객 대상 이사비 지원 및 입주 청소 조율 혜택',
    content: '여름 시즌 맞이 태왕 단독 혜택! 저희 사무소를 통해 계약 완료하시는 모든 고객분들께 제휴 업체를 통한 입주 청소 서비스 특별 혜택 및 주거안심 선물을 무상으로 증정해 드립니다. 자세한 조율 사항은 상담 시 문의주세요.',
    important: false,
    createdAt: '2026-07-25'
  }
];

export default function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [boardPosts, setBoardPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('./firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
          setProperties(data.length > 0 ? data : PROPERTIES);
        }, (error) => {
          console.error('Error fetching properties:', error);
          setProperties(PROPERTIES);
        });

        const unsubPosts = onSnapshot(collection(db, 'boardPosts'), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
          setBoardPosts(data.length > 0 ? data : DEFAULT_POSTS);
        }, (error) => {
          console.error('Error fetching posts:', error);
          setBoardPosts(DEFAULT_POSTS);
        });

        setLoading(false);
      });
    });
  }, []);

  const handleAddProperty = async (newProperty: any) => {
    try {
      const { db } = await import('./firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const nextId = (Math.max(...properties.map(p => parseInt(p.id) || 0), 0) + 1).toString();
      await addDoc(collection(db, 'properties'), { ...newProperty, id: nextId });
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div></div>;
  }

  return (
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
  );
}
