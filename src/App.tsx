import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
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

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-orange-200 sticky top-0 z-50">
        <div className="w-full max-w-[1536px] mx-auto relative">
          <div className="w-full px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-10 w-full sm:w-auto justify-between sm:justify-start">
              {/* Logo */}
              <div className="flex items-center gap-2 text-[#ff6600] font-black text-xl md:text-2xl tracking-tighter">
                <Building2 size={24} className="text-[#ff6600] md:w-7 md:h-7" />
                <span>태왕공인중개사</span>
              </div>
              
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
            <button className="w-full sm:w-auto bg-[#ff6600] text-white px-4 py-2 rounded flex justify-center items-center gap-1.5 font-bold text-sm hover:bg-[#e65c00] transition-colors shadow-sm">
              <Check size={16} strokeWidth={3} />
              매물 등록
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: '전체', value: '32', type: 'active' },
              { label: '광고중', value: '32', type: 'outline' },
              { label: '광고 검증 중', value: '0', type: 'outline-blue', hidden: true },
              { label: '광고 검증 실패', value: '0', type: 'outline-blue', hidden: true },
              { label: '종료예정', value: '0', type: 'outline', tooltip: true },
              { label: '광고종료', value: '0', type: 'outline-green' },
              { label: '동일주소 거래완료', value: '0', type: 'outline-green', hidden: true },
              { label: '신고매물 미처리', value: '0', type: 'outline-red', hidden: true },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`
                  rounded flex-col p-3 border transition-colors cursor-pointer
                  ${stat.hidden ? 'hidden' : 'flex'}
                  ${stat.type === 'active' ? 'bg-[#ff9900] text-white border-[#ff9900]' : 'bg-white hover:bg-gray-50'}
                  ${stat.type === 'outline' ? 'border-gray-200' : ''}
                  ${stat.type === 'outline-blue' ? 'border-gray-200' : ''}
                  ${stat.type === 'outline-green' ? 'border-gray-200' : ''}
                  ${stat.type === 'outline-red' ? 'border-gray-200' : ''}
                `}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[13px] font-medium ${stat.type === 'active' ? 'text-white' : 'text-gray-600'}`}>
                    {stat.label}
                  </span>
                  {stat.tooltip && (
                    <Info size={14} className="text-gray-400" />
                  )}
                </div>
                <div className={`
                  text-2xl font-bold mt-1
                  ${stat.type === 'active' ? 'text-white' : ''}
                  ${stat.type === 'outline' ? 'text-[#ff6600]' : ''}
                  ${stat.type === 'outline-blue' ? 'text-blue-500' : ''}
                  ${stat.type === 'outline-green' ? 'text-emerald-500' : ''}
                  ${stat.type === 'outline-red' ? 'text-red-500' : ''}
                `}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-[15px] text-gray-900">매물 검색</h3>
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
                      {[
                        { type: '원룸', location: '구미시 송정동', total: '17', sell: '0', jeonse: '0', monthly: '17', short: '0' },
                        { type: '원룸', location: '구미시 형곡동', total: '7', sell: '0', jeonse: '0', monthly: '7', short: '0' },
                        { type: '원룸', location: '구미시 신평동', total: '4', sell: '0', jeonse: '0', monthly: '4', short: '0' },
                        { type: '원룸', location: '구미시 광평동', total: '3', sell: '0', jeonse: '0', monthly: '3', short: '0' },
                        { type: '단독/다가구', location: '구미시 신평동', total: '1', sell: '0', jeonse: '0', monthly: '1', short: '0' },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-gray-600">{row.type}</td>
                          <td className="py-3 text-left text-gray-700">{row.location}</td>
                          <td className="py-3"><a href="#" className="text-blue-500 underline font-medium">{row.total}</a></td>
                          <td className="py-3"><a href="#" className="text-gray-400 underline">{row.sell}</a></td>
                          <td className="py-3"><a href="#" className="text-gray-400 underline">{row.jeonse}</a></td>
                          <td className="py-3"><a href="#" className="text-blue-500 underline font-medium">{row.monthly}</a></td>
                          <td className="py-3"><a href="#" className="text-gray-400 underline">{row.short}</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-4 left-4 bg-[#555] text-white text-[12px] px-3 py-1.5 rounded flex items-center">
                    매물 종류를 선택하시면 단지/동/호, 지번 검색이 가능합니다.
                  </div>
                </div>
              </div>

              {/* Row 2: 지역조회 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center border-b md:border-b-0 md:border-r border-gray-100">
                  지역조회
                </div>
                <div className="flex-1 p-3 md:p-4 flex items-center gap-2 flex-wrap">
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white">
                    <option>원룸</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-28 bg-white">
                    <option>경북</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-28 bg-white">
                    <option>구미시</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-28 bg-white">
                    <option>광평동</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-24 bg-white text-gray-400">
                    <option>리</option>
                  </select>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button className="border border-[#ff6600] text-[#ff6600] px-3 py-1.5 rounded font-medium bg-white">일반</button>
                    <button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded bg-white hover:bg-gray-50">산</button>
                  </div>
                  
                  <input type="text" placeholder="본번" className="border border-gray-300 rounded px-3 py-1.5 w-20 outline-none focus:border-[#ff6600]" />
                  <span className="text-gray-400">-</span>
                  <input type="text" placeholder="부번" className="border border-gray-300 rounded px-3 py-1.5 w-20 outline-none focus:border-[#ff6600]" />
                </div>
              </div>

              {/* Row 3: 조건조회 */}
              <div className="flex flex-col md:flex-row border-b border-gray-100">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center border-b md:border-b-0 md:border-r border-gray-100">
                  조건조회
                </div>
                <div className="flex-1 p-3 md:p-4 flex items-center gap-4 flex-wrap">
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white text-gray-600">
                    <option>거래유형</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white text-gray-600">
                    <option>검증방식</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white text-gray-600 hidden">
                    <option>노출채널</option>
                  </select>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-gray-600">매물가격</span>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <input type="text" className="border border-gray-300 rounded pl-3 pr-8 py-1.5 w-28 outline-none focus:border-[#ff6600]" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">만원</span>
                      </div>
                      <span className="text-gray-400">~</span>
                      <div className="relative">
                        <input type="text" className="border border-gray-300 rounded pl-3 pr-8 py-1.5 w-28 outline-none focus:border-[#ff6600]" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">만원</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-gray-600">매물번호</span>
                    <input type="text" placeholder="매물번호를 입력해 주세요." className="border border-gray-300 rounded px-3 py-1.5 w-48 outline-none focus:border-[#ff6600] text-sm" />
                  </div>
                </div>
              </div>

              {/* Row 4: 더블로켓 */}
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 bg-gray-50 p-3 md:p-4 font-medium text-gray-700 flex items-center gap-1 border-b md:border-b-0 md:border-r border-gray-100">
                  더블로켓
                  <Info size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <select className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#ff6600] w-32 bg-white">
                    <option>전체</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <button className="bg-[#0054ff] text-white px-5 py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">검색</button>
                    <button className="bg-[#ffcc00] text-gray-900 px-5 py-2 rounded text-sm font-bold hover:bg-yellow-500 transition-colors shadow-sm">초기화</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
            <div className="flex justify-between items-center mb-4">
              <div className="text-[14px] text-gray-700">전체 <strong className="text-gray-900">340개</strong> 있습니다.</div>
              <button className="flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900 transition-colors font-medium">
                <span className="bg-[#217346] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">XLS</span>
                엑셀변환저장
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[13px] border-t-2 border-gray-500 min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50/50">
                    {/* <th className="py-3 font-medium text-gray-600">주택관리</th> */}
                    <th className="py-3 font-medium text-gray-600">건물명</th>
                    <th className="py-3 font-medium text-gray-600">주소</th>
                    {/* <th className="py-3 font-medium text-gray-600">호실</th> */}
                    <th className="py-3 font-medium text-gray-600">구분</th>
                    {/* <th className="py-3 font-medium text-gray-600">계약형태</th> */}
                    <th className="py-3 font-medium text-gray-600 leading-tight">보증금<br/><span className="text-[11px] text-gray-400 font-normal">(단위:만원)</span></th>
                    <th className="py-3 font-medium text-gray-600 leading-tight">월세<br/><span className="text-[11px] text-gray-400 font-normal">(단위:만원)</span></th>
                    {/* <th className="py-3 font-medium text-gray-600">연락처</th> */}
                    <th className="py-3 font-medium text-gray-600">비고</th>
                    <th className="py-3 font-medium text-[#ff6600]">VR투어</th>
                  </tr>
                </thead>
                <tbody>
                    {PROPERTIES.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.open('/property/' + row.id, '_blank')}>
                      {/* <td className="py-4 text-gray-700">{row.mgt}</td> */}
                      <td className="py-4 text-gray-700">{row.name}</td>
                      <td className="py-4 text-gray-700">{row.addr}</td>
                      {/* <td className="py-4 text-gray-700">{row.room}</td> */}
                      <td className="py-4 text-gray-700">{row.type}</td>
                      {/* <td className="py-4 text-gray-700">{row.contract}</td> */}
                      <td className="py-4 text-gray-900 font-medium whitespace-pre-line">{row.deposit}</td>
                      <td className="py-4 text-gray-900 font-medium whitespace-pre-line">{row.rent}</td>
                      {/* <td className="py-4 text-gray-700 whitespace-pre-line">{row.phone}</td> */}
                      <td className="py-4 text-gray-500 text-left text-[12px]">{row.note}</td>
                      <td className="py-4">
                        {row.vr ? (
                          <button className="bg-[#ff6600] text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm hover:bg-[#e65c00] transition-colors whitespace-nowrap">
                            VR 보기
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">준비중</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-1.5 mt-8">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">{'<<'}</button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">{'<'}</button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                <button key={p} className={`w-8 h-8 flex items-center justify-center rounded text-[14px] transition-colors ${p === 1 ? 'text-red-500 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>{p}</button>
              ))}
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">{'>'}</button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">{'>>'}</button>
            </div>
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
            <div className="mt-2 text-gray-400 font-medium text-xs">
              Copyright © 태왕공인중개사사무소. All right reserved.
            </div>
          </div>
        </div>
      </footer>

            </div>
    );
}

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedProperty = PROPERTIES.find(p => p.id === id);
  const [showVrModal, setShowVrModal] = useState(false);

  if (!selectedProperty) return <div className="p-8 text-center">매물을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col pt-8 pb-16">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 flex-1">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          목록으로 돌아가기
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                {selectedProperty.name} <span className="text-[#ff6600] text-xl md:text-2xl">{selectedProperty.room}호</span>
              </h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-lg">{selectedProperty.addr}</p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">{selectedProperty.type}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Media Section */}
            <div className="w-full lg:w-1/2 flex flex-col shrink-0">
              {/* Naver Map Placeholder */}
              <div className="w-full aspect-square md:aspect-video lg:aspect-square lg:max-h-[500px] bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#f8f9fa] z-0">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                   <span className="font-medium text-sm sm:text-base text-gray-500">네이버 지도 로딩중...</span>
                </div>
                {/* Actual iframe overlay */}
                <iframe 
                  title="Naver Map"
                  src={`https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent('구미시 ' + selectedProperty.addr)}&sm=hty&style=v5`} 
                  className="absolute inset-0 w-full h-full z-10 bg-white" 
                ></iframe>
              </div>
            </div>

            {/* Details Section */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-900">매물 상세 정보</h3>
              <div className="grid grid-cols-1 gap-y-3 sm:gap-y-5 text-sm sm:text-base">
                
                <div className="flex border-b border-gray-100 pb-3 sm:pb-4">
                  <span className="w-24 sm:w-28 text-gray-500 font-medium shrink-0">주택관리</span>
                  <span className="text-gray-900 font-medium">{selectedProperty.mgt}</span>
                </div>
                <div className="flex border-b border-gray-100 pb-3 sm:pb-4">
                  <span className="w-24 sm:w-28 text-gray-500 font-medium shrink-0">구분</span>
                  <span className="text-gray-900 font-medium">{selectedProperty.type}</span>
                </div>
                <div className="flex border-b border-gray-100 pb-3 sm:pb-4">
                  <span className="w-24 sm:w-28 text-gray-500 font-medium shrink-0">계약형태</span>
                  <span className="text-gray-900 font-medium">{selectedProperty.contract}</span>
                </div>
                <div className="flex border-b border-gray-100 pb-3 sm:pb-4 items-center">
                  <span className="w-24 sm:w-28 text-gray-500 font-medium shrink-0">보증금/월세</span>
                  <span className="text-[#ff6600] font-black text-xl sm:text-2xl whitespace-pre-line">
                    {selectedProperty.deposit}만 / {selectedProperty.rent}만
                  </span>
                </div>
                <div className="flex border-b border-gray-100 pb-3 sm:pb-4">
                  <span className="w-24 sm:w-28 text-gray-500 font-medium shrink-0">연락처</span>
                  <span className="text-gray-900 font-medium whitespace-pre-line">{selectedProperty.phone}</span>
                </div>
                <div className="flex flex-col pt-1 sm:pt-2">
                  <span className="text-gray-900 font-bold mb-2 sm:mb-3">매물특징 / 비고</span>
                  <div className="bg-orange-50/50 p-4 sm:p-5 rounded-lg border border-orange-100 min-h-[80px] sm:min-h-[100px] text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {selectedProperty.note || "등록된 매물 특징이 없습니다."}
                  </div>
                </div>

              </div>

              {selectedProperty.vr && (
                <button 
                  onClick={() => setShowVrModal(true)}
                  className="mt-6 lg:mt-auto w-full bg-[#ff6600] text-white py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[#e65c00] transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><path d="M2 12A10 10 0 0 0 22 12"/><path d="M2 12A10 10 0 0 1 22 12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  360 VR 투어 시작하기
                </button>
              )}
            </div>
          </div>

          {/* Brokerage Object Indication Matters */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-100 bg-gray-50/50">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">중개대상물표시사항</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 font-medium text-xs sm:text-sm lg:text-base">경상북도 구미시 광평동 792-121 1공단 홈플러스 인접 풀옵션 가성비 원룸</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">1. 소재지</span><span className="text-gray-900 break-words flex-1">경상북도 구미시 광평동 792-121 (클래식3)</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">2. 집주인</span><span className="text-gray-900 break-words flex-1">확인</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">3. 확인매물</span><span className="text-gray-900 break-words flex-1">확인</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">4. 일반원룸</span><span className="text-gray-900 break-words flex-1">일반원룸·2층</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">5. 월세</span><span className="text-gray-900 break-words flex-1">보증금 200만 원 / 월세 13만 원</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">6. 매물특징</span><span className="text-gray-900 break-words flex-1">1공단 인접 광평동 홈플러스 인접 및 공단 최인접 배후지역</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">7. 공급/전용면적</span><span className="text-gray-900 break-words flex-1">공급면적 30㎡ / 전용면적 30㎡ (전용률 100%)</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">8. 해당층/총층</span><span className="text-gray-900 break-words flex-1">2층 / 총 4층</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">9. 방수/욕실수</span><span className="text-gray-900 break-words flex-1">방 1개 / 욕실 1개</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">10. 관리비</span><span className="text-gray-900 break-words flex-1">10만 원 (면적/세대별 공용관리비와 사용량에 따른 사용료를 합산하여 부과. 포함항목(사용료) : 공용관리비, 수도, 인터넷, TV. 관리비 기준 : 최근 3개월 관리비 평균)</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">11. 입주가능일</span><span className="text-gray-900 break-words flex-1">즉시입주</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">12. 사용승인일</span><span className="text-gray-900 break-words flex-1">2014.11.21</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">13. 방향</span><span className="text-gray-900 break-words flex-1">남동향 (안방 기준)</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">14. 주차가능여부</span><span className="text-gray-900 break-words flex-1">가능</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">15. 방구조</span><span className="text-gray-900 break-words flex-1">분리형</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">16. 복층여부</span><span className="text-gray-900 break-words flex-1">단층</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">17. 건축물용도</span><span className="text-gray-900 break-words flex-1">단독주택</span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">18. 매물번호</span><span className="text-gray-900 break-words flex-1"></span></div>
              <div className="flex border-b border-gray-200 pb-2"><span className="w-24 sm:w-32 text-gray-500 shrink-0">19. 총주차대수</span><span className="text-gray-900 break-words flex-1">12대</span></div>
            </div>

            <div className="mt-4 sm:mt-6">
              <div className="text-gray-500 font-medium mb-2 sm:mb-3 text-sm sm:text-base">20. 상세설명</div>
              <div className="bg-white p-4 sm:p-5 rounded border border-gray-200 text-gray-700 text-xs sm:text-sm leading-relaxed space-y-3 sm:space-y-4">
                <p>구미 1국가산업단지 배후 주거지역에 위치하여 공단 출퇴근 직장인분들께 최적의 접근성과 편리한 기동성을 선사합니다.</p>
                <p>대형 쇼핑몰인 광평동 홈플러스가 인근에 포진해 있어 주말 장보기나 다양한 생필품 조달이 무척 수월한 우수한 생활권을 갖추고 있습니다.</p>
                <p>실내에 들어서서 360도 VR 투어로 내부 공간을 구석구석 살펴보시면 반듯하고 가구 배치가 수월한 안정적인 방 구조가 눈에 들어옵니다.</p>
                <p>360도 VR 공간 체험을 통해 주방 분리형 슬라이딩 중문과 침실의 실제 깊이감 및 가구 간격의 공간감을 현장감 있게 직접 확인하실 수 있습니다.</p>
                <p>싱크대 수도 꼭지를 끝까지 틀어 수압 세기와 통수 상태를 점검해보았는데 세찬 물줄기가 뿜어져 나오며 하수구 역류나 물 고임 없이 시원하게 잘 빠집니다.</p>
                <p>욕실 및 베란다 내부까지 360도 VR 투어로 구석구석 둘러보실 수 있어 직접 현장을 방문한 것과 다름없는 정밀하고 투명한 정보를 선사합니다.</p>
                <p>보증금 200만 원에 월세 13만 원이라는 파격적인 최저가 가성비 조건에 총 12대의 넓은 자주식 주차장까지 완비되어 매달 주거비 부담을 덜어주는 실속 매물입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VR Modal */}
      {showVrModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 sm:bg-black/80 sm:p-6 backdrop-blur-sm">
          <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-6xl h-full sm:h-auto max-h-[100dvh] flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-white relative z-10 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">{selectedProperty.name} 360 VR 투어</h3>
              <button 
                onClick={() => setShowVrModal(false)}
                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors flex items-center justify-center shrink-0"
                title="닫기"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="w-full bg-black flex items-center justify-center flex-1 overflow-hidden relative">
              {/* 2:1 Aspect Ratio Box */}
              <div className="w-full relative max-h-full aspect-[2/1] sm:max-h-[calc(100dvh-70px)] flex flex-col justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 px-4 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 sm:mb-4 sm:w-16 sm:h-16"><path d="M2 12A10 10 0 0 0 22 12"/><path d="M2 12A10 10 0 0 1 22 12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span className="text-sm sm:text-xl font-medium tracking-wide break-keep">360 VR 이미지가 들어갈 자리입니다 (2:1 비율)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
    </Routes>
  );
}

