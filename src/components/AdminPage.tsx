import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Lock, 
  User, 
  Search, 
  Check, 
  X, 
  Info,
  Layers,
  ArrowLeft,
  Settings,
  Tv,
  FileText,
  UploadCloud,
  Loader2
} from 'lucide-react';

interface Property {
  id: string;
  mgt: string;
  name: string;
  addr: string;
  room: string;
  type: string;
  contract: string;
  deposit: string;
  rent: string;
  phone: string;
  note: string;
  vr: boolean;
  vrUrl?: string;
  details?: {
    addr_detail?: string;
    landlord_confirm?: string;
    verified_status?: string;
    room_type?: string;
    rent_detail?: string;
    features?: string;
    area?: string;
    floor?: string;
    rooms_baths?: string;
    maintenance_fee?: string;
    move_in_date?: string;
    approval_date?: string;
    direction?: string;
    parking?: string;
    structure?: string;
    duplex?: string;
    building_use?: string;
    total_parking?: string;
    description?: string;
  };
}

interface BoardPost {
  id: string;
  category: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  linkedPropertyId?: string;
}

interface AdminPageProps {
  properties: Property[];
  onAddProperty: (p: Omit<Property, 'id'> & { id?: string }) => void;
  onUpdateProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  boardPosts: BoardPost[];
  onAddPost: (post: Omit<BoardPost, 'id'> & { id?: string }) => void;
  onUpdatePost: (post: BoardPost) => void;
  onDeletePost: (id: string, firebaseId?: string) => void;
}

export default function AdminPage({ 
  properties, 
  onAddProperty, 
  onUpdateProperty, 
  onDeleteProperty,
  boardPosts,
  onAddPost,
  onUpdatePost,
  onDeletePost
}: AdminPageProps) {
  const navigate = useNavigate();
  
  // Auth state from sessionStorage to persist during tab session
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('taewang_admin_logged') === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search & Filters inside Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');

  // Form / Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form Fields
  const [formMgt, setFormMgt] = useState('태왕');
  const [formName, setFormName] = useState('');
  const [formAddr, setFormAddr] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formType, setFormType] = useState('원룸');
  const [formContract, setFormContract] = useState('월세');
  const [formDeposit, setFormDeposit] = useState('');
  const [formRent, setFormRent] = useState('');
  const [formPhone, setFormPhone] = useState('010-7590-0111');
  const [formNote, setFormNote] = useState('');
  const [formVr, setFormVr] = useState(true);
  const [formVrUrl, setFormVrUrl] = useState('');
  const [isUploadingVr, setIsUploadingVr] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detailed fields (중개대상물표시사항)
  const [detailAddrDetail, setDetailAddrDetail] = useState('');
  const [detailLandlordConfirm, setDetailLandlordConfirm] = useState('확인');
  const [detailVerifiedStatus, setDetailVerifiedStatus] = useState('확인');
  const [detailRoomType, setDetailRoomType] = useState('');
  const [detailRentDetail, setDetailRentDetail] = useState('');
  const [detailFeatures, setDetailFeatures] = useState('');
  const [detailArea, setDetailArea] = useState('공급면적 30㎡ / 전용면적 30㎡');
  const [detailFloor, setDetailFloor] = useState('2층 / 총 4층');
  const [detailRoomsBaths, setDetailRoomsBaths] = useState('방 1개 / 욕실 1개');
  const [detailMaintenanceFee, setDetailMaintenanceFee] = useState('10만 원 (수도, 인터넷, TV 포함)');
  const [detailMoveInDate, setDetailMoveInDate] = useState('즉시입주');
  const [detailApprovalDate, setDetailApprovalDate] = useState('2014.11.21');
  const [detailDirection, setDetailDirection] = useState('남동향 (안방 기준)');
  const [detailParking, setDetailParking] = useState('가능');
  const [detailStructure, setDetailStructure] = useState('분리형');
  const [detailDuplex, setDetailDuplex] = useState('단층');
  const [detailBuildingUse, setDetailBuildingUse] = useState('단독주택');
  const [detailTotalParking, setDetailTotalParking] = useState('12대');
  const [detailDescription, setDetailDescription] = useState('');

  // Active Tab: properties vs board
  const [activeTab, setActiveTab] = useState<'properties' | 'board'>('properties');

  // Board Form / Modal state
  const [isBoardFormOpen, setIsBoardFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [boardSearch, setBoardSearch] = useState('');

  // Board Form Fields
  const [postCategory, setPostCategory] = useState('공지');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImportant, setPostImportant] = useState(false);
  const [linkedPropertyId, setLinkedPropertyId] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingVr(true);
    setUploadProgress(0);

    const uploadPromises = Array.from(files).map((file, index) => {
      return new Promise<string>((resolve, reject) => {
        const storageRef = ref(storage, `vr_tours/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Roughly track progress across multiple files by dividing total progress
            setUploadProgress((prev) => Math.min(prev + (progress / files.length), 100));
          },
          (error) => {
            console.error('File upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        const currentUrls = formVrUrl ? formVrUrl.trim() + '\n' : '';
        setFormVrUrl(currentUrls + urls.join('\n'));
        setIsUploadingVr(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      })
      .catch((err) => {
        alert('파일 업로드 중 오류가 발생했습니다.');
        setIsUploadingVr(false);
        setUploadProgress(0);
      });
  };

  // Helper functions to parse board content into property details
  const cleanValue = (val: string, index: number): string => {
    let cleaned = val.trim();
    cleaned = cleaned.replace(/^[:\-\s]+/, '');

    const labelsToStrip: Record<number, string[]> = {
      1: ['상세 소재지', '상세소재지', '소재지', '남아지'],
      2: ['집주인'],
      3: ['확인매물', '확인'],
      4: ['방구분 상세', '방구분상세', '방구분', '일반원룸'],
      5: ['거래 월세 상세', '거래월세상세', '거래조건', '거래 조건', '거래 조건 상세'],
      6: ['매물 특징 요약', '매물특징요약', '매물 특징', '매물특징'],
      7: ['공급/전용면적', '공급 전용면적', '공급/전용 면적', '면적'],
      8: ['해당층 / 총층', '해당층/총층', '담당층/총층', '해당층', '총층', '층수'],
      9: ['방수 / 욕실수', '방수/욕실수', '알류/욕실수', '방수 욕실수'],
      10: ['관리비 조건', '관리비조건', '관리비', '관리하다'],
      11: ['입주 가능일', '입주가능일', '분할가능일', '입주일'],
      12: ['사용 승인일', '사용승인일', '사용허가일', '사용승인', '승인일'],
      13: ['방향 (안방 기준)', '방향(안방 기준)', '방향'],
      14: ['주차 가능 여부', '주차가능여부', '주차 가능여부', '주차가능 여부', '주차'],
      15: ['방 구조', '방구조'],
      16: ['복층 여부', '복층여부', '복불여부', '복층'],
      17: ['건축물 용도', '건축물용도', '결합용도', '용도'],
      18: ['매물 번호', '매물번호', '매물 번호', 'ID'],
      19: ['총 주차 대수', '총주차대수', '총 주차대수', '총주차 대수', '주차대수'],
      20: ['상세 설명 및 홍보 문구', '상세설명 및 홍보문구', '상세 설명', '상세설명']
    };

    const list = labelsToStrip[index] || [];
    for (const label of list) {
      if (cleaned.startsWith(label)) {
        cleaned = cleaned.substring(label.length).trim();
        break;
      }
    }

    cleaned = cleaned.replace(/^[:\-\s]+/, '');
    return cleaned;
  };

  const parseDisclosureText = (text: string) => {
    const result: Record<string, string> = {};
    const keyMap: Record<number, string> = {
      1: 'addr_detail',
      2: 'landlord_confirm',
      3: 'verified_status',
      4: 'room_type',
      5: 'rent_detail',
      6: 'features',
      7: 'area',
      8: 'floor',
      9: 'rooms_baths',
      10: 'maintenance_fee',
      11: 'move_in_date',
      12: 'approval_date',
      13: 'direction',
      14: 'parking',
      15: 'structure',
      16: 'duplex',
      17: 'building_use',
      18: 'property_id',
      19: 'total_parking',
      20: 'description'
    };

    for (let i = 1; i <= 20; i++) {
      const nextNum = i + 1;
      let patternStr = '';
      if (i < 20) {
        patternStr = `(?:^|\\n)\\s*${i}\\.\\s*(?:[^:\\n]+:)?\\s*([\\s\\S]*?)(?=\\n\\s*${nextNum}\\.\\s*|$)`;
      } else {
        patternStr = `(?:^|\\n)\\s*20\\.\\s*(?:[^:\\n]+:)?\\s*([\\s\\S]*)$`;
      }
      
      const regex = new RegExp(patternStr, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        result[keyMap[i]] = cleanValue(match[1], i);
      }
    }
    return result;
  };

  // Open form for creating a post
  const openCreatePostForm = () => {
    setEditingPost(null);
    setPostCategory('공지');
    setPostTitle('');
    setPostContent('');
    setPostImportant(false);
    setLinkedPropertyId('');
    setIsBoardFormOpen(true);
  };

  // Open form for editing a post
  const openEditPostForm = (post: BoardPost) => {
    setEditingPost(post);
    setPostCategory(post.category);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostImportant(post.important);
    setLinkedPropertyId(post.linkedPropertyId || '');
    setIsBoardFormOpen(true);
  };

  // Save board post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      alert('제목과 내용은 필수 입력 사항입니다.');
      return;
    }

    if (postCategory === '표시의무사항' && !linkedPropertyId) {
      alert('표시의무사항 카테고리는 연결할 매물을 반드시 선택해야 합니다.');
      return;
    }

    const postPayload: any = {
      category: postCategory,
      title: postTitle,
      content: postContent,
      important: postImportant,
      createdAt: editingPost ? editingPost.createdAt : new Date().toISOString().split('T')[0],
      linkedPropertyId: postCategory === '표시의무사항' ? linkedPropertyId : undefined
    };

    // If it's a '표시의무사항' and a property is selected, parse and update that property's details!
    if (postCategory === '표시의무사항' && linkedPropertyId) {
      const selectedProp = properties.find(p => 
        String(p.id) === String(linkedPropertyId) ||
        (p.name && p.room && `${p.name}_${p.room}` === String(linkedPropertyId)) ||
        (p.name && p.name === String(linkedPropertyId))
      );
      if (selectedProp) {
        const parsedDetails = parseDisclosureText(postContent);
        
        // Preserve other fields from existing details if not parsed, and merge
        const existingDetails = selectedProp.details || {};
        const updatedDetails = {
          ...existingDetails,
          ...parsedDetails,
          // Fallback to post content for description
          description: parsedDetails.description || postContent
        };

        const updatedProperty = {
          ...selectedProp,
          details: updatedDetails
        };
        
        onUpdateProperty(updatedProperty);
      }
    }

    if (editingPost) {
      onUpdatePost({
        ...editingPost,
        ...postPayload
      });
    } else {
      onAddPost(postPayload);
    }
    setIsBoardFormOpen(false);
  };

  // Delete board post
  const handleDeletePostClick = (post: any) => {
    if (confirm(`정말로 "${post.title}" 게시글을 삭제하시겠습니까?`)) {
      onDeletePost(post.id, post.firebaseId);
    }
  };

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1') {
      sessionStorage.setItem('taewang_admin_logged', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('아이디 또는 비밀번호가 잘못되었습니다. (안내된 데모 계정을 확인해주세요)');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('taewang_admin_logged');
    setIsLoggedIn(false);
  };

  // Open form for creating
  const openCreateForm = () => {
    setEditingProperty(null);
    setFormMgt('태왕');
    setFormName('');
    setFormAddr('');
    setFormRoom('');
    setFormType('원룸');
    setFormContract('월세');
    setFormDeposit('');
    setFormRent('');
    setFormPhone('010-7590-0111');
    setFormNote('');
    setFormVr(true);
    setFormVrUrl('https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg');

    // Reset details to smart fallbacks
    setDetailAddrDetail('');
    setDetailLandlordConfirm('확인');
    setDetailVerifiedStatus('확인');
    setDetailRoomType('');
    setDetailRentDetail('');
    setDetailFeatures('');
    setDetailArea('공급면적 30㎡ / 전용면적 30㎡');
    setDetailFloor('2층 / 총 4층');
    setDetailRoomsBaths('방 1개 / 욕실 1개');
    setDetailMaintenanceFee('10만 원 (수도, 인터넷, TV 포함)');
    setDetailMoveInDate('즉시입주');
    setDetailApprovalDate('2014.11.21');
    setDetailDirection('남동향 (안방 기준)');
    setDetailParking('가능');
    setDetailStructure('분리형');
    setDetailDuplex('단층');
    setDetailBuildingUse('단독주택');
    setDetailTotalParking('12대');
    setDetailDescription('');

    setIsFormOpen(true);
  };

  // Open form for editing
  const openEditForm = (property: Property) => {
    setEditingProperty(property);
    setFormMgt(property.mgt || '태왕');
    setFormName(property.name);
    setFormAddr(property.addr);
    setFormRoom(property.room);
    setFormType(property.type);
    setFormContract(property.contract);
    setFormDeposit(property.deposit);
    setFormRent(property.rent);
    setFormPhone(property.phone);
    setFormNote(property.note || '');
    setFormVr(property.vr);
    setFormVrUrl(property.vrUrl || 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg');

    // Fill in detailed fields
    const details = property.details || {};
    setDetailAddrDetail(details.addr_detail || '');
    setDetailLandlordConfirm(details.landlord_confirm || '확인');
    setDetailVerifiedStatus(details.verified_status || '확인');
    setDetailRoomType(details.room_type || '');
    setDetailRentDetail(details.rent_detail || '');
    setDetailFeatures(details.features || '');
    setDetailArea(details.area || '공급면적 30㎡ / 전용면적 30㎡');
    setDetailFloor(details.floor || '2층 / 총 4층');
    setDetailRoomsBaths(details.rooms_baths || '방 1개 / 욕실 1개');
    setDetailMaintenanceFee(details.maintenance_fee || '10만 원 (수도, 인터넷, TV 포함)');
    setDetailMoveInDate(details.move_in_date || '즉시입주');
    setDetailApprovalDate(details.approval_date || '2014.11.21');
    setDetailDirection(details.direction || '남동향 (안방 기준)');
    setDetailParking(details.parking || '가능');
    setDetailStructure(details.structure || '분리형');
    setDetailDuplex(details.duplex || '단층');
    setDetailBuildingUse(details.building_use || '단독주택');
    setDetailTotalParking(details.total_parking || '12대');
    setDetailDescription(details.description || '');

    setIsFormOpen(true);
  };

  // Save changes
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formAddr.trim()) {
      alert('건물명과 주소는 필수 입력 사항입니다.');
      return;
    }

    // Build the details object
    let detailsObj = {
      addr_detail: detailAddrDetail || `경상북도 구미시 ${formAddr} (${formName})`,
      landlord_confirm: detailLandlordConfirm,
      verified_status: detailVerifiedStatus,
      room_type: detailRoomType || `${formType}·${formRoom ? formRoom.substring(0, 1) + '층' : '2층'}`,
      rent_detail: detailRentDetail || `보증금 ${formDeposit}만 원 / 월세 ${formRent}만 원`,
      features: detailFeatures || `${formType} 풀옵션 가성비 좋은 깨끗한 방`,
      area: detailArea,
      floor: detailFloor,
      rooms_baths: detailRoomsBaths,
      maintenance_fee: detailMaintenanceFee,
      move_in_date: detailMoveInDate,
      approval_date: detailApprovalDate,
      direction: detailDirection,
      parking: detailParking,
      structure: detailStructure,
      duplex: detailDuplex,
      building_use: detailBuildingUse,
      total_parking: detailTotalParking,
      description: detailDescription || `구미시 ${formAddr}에 위치한 아름답고 수려한 ${formName} ${formRoom}호 공실입니다. 최상의 조건으로 모십니다.`
    };

    // Automatic parse: If the bulk paste text area contains text, automatically parse and merge it on save!
    const bulkPasteEl = document.getElementById('bulk_paste_area') as HTMLTextAreaElement;
    if (bulkPasteEl && bulkPasteEl.value.trim()) {
      const parsed = parseDisclosureText(bulkPasteEl.value);
      if (Object.keys(parsed).length > 0) {
        detailsObj = {
          addr_detail: parsed.addr_detail || detailsObj.addr_detail,
          landlord_confirm: parsed.landlord_confirm || detailsObj.landlord_confirm,
          verified_status: parsed.verified_status || detailsObj.verified_status,
          room_type: parsed.room_type || detailsObj.room_type,
          rent_detail: parsed.rent_detail || detailsObj.rent_detail,
          features: parsed.features || detailsObj.features,
          area: parsed.area || detailsObj.area,
          floor: parsed.floor || detailsObj.floor,
          rooms_baths: parsed.rooms_baths || detailsObj.rooms_baths,
          maintenance_fee: parsed.maintenance_fee || detailsObj.maintenance_fee,
          move_in_date: parsed.move_in_date || detailsObj.move_in_date,
          approval_date: parsed.approval_date || detailsObj.approval_date,
          direction: parsed.direction || detailsObj.direction,
          parking: parsed.parking || detailsObj.parking,
          structure: parsed.structure || detailsObj.structure,
          duplex: parsed.duplex || detailsObj.duplex,
          building_use: parsed.building_use || detailsObj.building_use,
          total_parking: parsed.total_parking || detailsObj.total_parking,
          description: parsed.description || detailsObj.description
        };
      }
    }

    const propertyPayload: any = {
      mgt: formMgt,
      name: formName,
      addr: formAddr,
      room: formRoom,
      type: formType,
      contract: formContract,
      deposit: formDeposit,
      rent: formRent,
      phone: formPhone,
      note: formNote,
      vr: formVr,
      vrUrl: formVrUrl,
      details: detailsObj
    };

    if (editingProperty) {
      // Edit
      onUpdateProperty({
        ...editingProperty,
        ...propertyPayload
      });
    } else {
      // Add new
      onAddProperty(propertyPayload);
    }

    setIsFormOpen(false);
  };

  // Handle Delete with Confirmation
  const handleDelete = (property: any) => {
    if (confirm(`정말로 "${property.name}" 매물을 공실현황 목록에서 삭제하시겠습니까?`)) {
      onDeleteProperty(property.id, property.firebaseId);
    }
  };

  // Filter properties based on search and type filter
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          p.addr.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          p.room.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          p.note.toLowerCase().includes(adminSearch.toLowerCase());
    
    const matchesType = typeFilter === '전체' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate high-level stats
  const totalCount = properties.length;
  const vrCount = properties.filter(p => p.vr).length;
  const monthlyCount = properties.filter(p => p.contract.includes('월')).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#ff6600] p-8 text-center text-white relative">
            <div className="inline-flex p-3 bg-white/10 rounded-xl mb-3">
              <Building2 size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">태왕공인중개사</h2>
            <p className="text-orange-100 text-sm mt-1">공실현황 및 VR 매물 관리 시스템</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-lg border border-red-100">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">관리자 ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ID를 입력하세요" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff6600] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">비밀번호</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff6600] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white py-3.5 rounded-xl font-bold transition-colors shadow-md shadow-orange-600/10"
            >
              로그인하기
            </button>

            {/* Dev Demo Notice Box */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-[#ff6600] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-gray-600">
                <span className="font-bold text-gray-800">데모 시스템 테스트용 계정:</span>
                <div className="mt-1 flex gap-4">
                  <span>ID: <strong className="text-gray-900">admin</strong></span>
                  <span>PW: <strong className="text-gray-900">1</strong></span>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="mt-6 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          홈페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      {/* Admin Header */}
      <header className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-[#ff6600]" />
            <h1 className="text-lg md:text-xl font-black tracking-tight">태왕공인중개사 <span className="text-[#ff6600] text-sm font-semibold ml-2">관리자 시스템</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-xs md:text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              사용자 화면 보기
            </button>
            <div className="w-px h-4 bg-gray-700 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 w-full max-w-[1536px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-[#ff6600] rounded-xl shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400">등록된 총 매물</span>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalCount}개</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0">
              <Tv size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400">360 VR 투어 지원</span>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{vrCount}개</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400">월세 계약 형태</span>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{monthlyCount}개</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${activeTab === 'properties' ? 'border-[#ff6600] text-[#ff6600]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Building2 size={16} />
            공실 매물 관리
          </button>
          <button 
            onClick={() => setActiveTab('board')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${activeTab === 'board' ? 'border-[#ff6600] text-[#ff6600]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <FileText size={16} />
            게시판 / 공지사항 관리
          </button>
        </div>

        {activeTab === 'properties' && (
          <>
            {/* Action Controls & Search Filters */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </span>
                  <input 
                    type="text"
                    placeholder="건물명, 주소, 비고 검색..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#ff6600] outline-none transition-all"
                  />
                </div>

            {/* Type Filter */}
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#ff6600]"
            >
              <option value="전체">모든 종류</option>
              <option value="원룸">원룸</option>
              <option value="미투">미투</option>
              <option value="투룸">투룸</option>
            </select>
          </div>

          <button 
            onClick={openCreateForm}
            className="w-full md:w-auto bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            새 공실 매물 등록
          </button>
        </div>

        {/* Properties Management List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">주택관리</th>
                  <th className="py-4 px-6">건물명 / 호실</th>
                  <th className="py-4 px-6">주소</th>
                  <th className="py-4 px-6">구분</th>
                  <th className="py-4 px-6 text-right">보증금 / 월세</th>
                  <th className="py-4 px-6 text-center">VR 지원</th>
                  <th className="py-4 px-6 text-center">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-600">{p.mgt}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {p.name} <span className="text-orange-500 font-semibold text-xs ml-1 bg-orange-50 px-1.5 py-0.5 rounded">{p.room}호</span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{p.addr}</td>
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-700 font-bold text-xs px-2.5 py-1 rounded-full">{p.type}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        {p.deposit} / {p.rent} 만원
                      </td>
                      <td className="py-4 px-6 text-center">
                        {p.vr ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                            <Check size={12} strokeWidth={3} /> VR 활성
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-gray-50 text-gray-400 text-xs font-semibold rounded-full border border-gray-100">
                            미사용
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate('/property/' + p.id)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="사용자 화면 보기"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button 
                            onClick={() => openEditForm(p)}
                            className="p-1.5 hover:bg-orange-50 text-orange-600 hover:text-[#ff6600] rounded-lg transition-colors border border-transparent hover:border-orange-100"
                            title="수정"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p)}
                            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      검색 조건과 일치하는 매물이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {activeTab === 'board' && (
          <div className="space-y-6">
            {/* Board Action Controls */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </span>
                <input 
                  type="text"
                  placeholder="게시글 제목, 내용 검색..."
                  value={boardSearch}
                  onChange={(e) => setBoardSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#ff6600] outline-none transition-all"
                />
              </div>

              <button 
                onClick={openCreatePostForm}
                className="w-full md:w-auto bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                새 게시글 등록
              </button>
            </div>

            {/* Board Posts Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-4 px-6 w-24">구분</th>
                      <th className="py-4 px-6">제목 / 내용</th>
                      <th className="py-4 px-6 w-36">작성일</th>
                      <th className="py-4 px-6 w-28 text-center">중요공지</th>
                      <th className="py-4 px-6 w-28 text-center">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {boardPosts && boardPosts.filter(post => 
                      post.title.toLowerCase().includes(boardSearch.toLowerCase()) || 
                      post.content.toLowerCase().includes(boardSearch.toLowerCase())
                    ).length > 0 ? (
                      boardPosts.filter(post => 
                        post.title.toLowerCase().includes(boardSearch.toLowerCase()) || 
                        post.content.toLowerCase().includes(boardSearch.toLowerCase())
                      ).map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              post.category === '공지' ? 'bg-orange-50 text-orange-600' :
                              post.category === '중요' ? 'bg-red-50 text-red-600 font-black' :
                              post.category === '이벤트' ? 'bg-blue-50 text-blue-600' :
                              post.category === '표시의무사항' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {post.category}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className={`text-sm ${post.important ? 'font-bold text-[#ff6600]' : 'font-medium text-gray-900'}`}>
                                {post.title}
                              </span>
                              <span className="text-gray-400 text-xs mt-1 truncate max-w-lg">
                                {post.content}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500 whitespace-nowrap text-xs sm:text-sm">{post.createdAt}</td>
                          <td className="py-4 px-6 text-center">
                            {post.important ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                                중요
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditPostForm(post)}
                                className="p-1.5 hover:bg-orange-50 text-orange-600 hover:text-[#ff6600] rounded-lg transition-colors border border-transparent hover:border-orange-100"
                                title="수정"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeletePostClick(post)}
                                className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">
                          등록된 게시글이 없거나 검색 결과와 일치하는 항목이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL FORM (Full-screen for PC, Mobile, and Tablet) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in duration-200">
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white shrink-0 shadow-md">
              <div className="w-full px-6 py-4 sm:py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-[#ff6600]" />
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {editingProperty ? `매물 수정: ${editingProperty.name} ${editingProperty.room}호` : '새로운 공실 매물 등록'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-gray-800 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                  title="닫기 (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveProperty} className="flex-1 overflow-y-auto bg-white py-6 sm:py-10">
              <div className="w-full px-6 md:px-12 pb-12 space-y-12">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-6">
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#ff6600] border-b-2 border-orange-100 pb-3 uppercase tracking-wider">1. 기본 광고 정보</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">주택관리 업체</label>
                    <input 
                      type="text"
                      value={formMgt}
                      onChange={(e) => setFormMgt(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formMgt && formMgt.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">건물명 <strong className="text-red-500">*</strong></label>
                    <input 
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="예) 크라운빌, 고야드"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formName && formName.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">주소 <strong className="text-red-500">*</strong></label>
                    <input 
                      type="text"
                      value={formAddr}
                      onChange={(e) => setFormAddr(e.target.value)}
                      placeholder="예) 사곡동 422-168"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formAddr && formAddr.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">호실 <strong className="text-red-500">*</strong></label>
                    <input 
                      type="text"
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                      placeholder="예) 301, 501"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formRoom && formRoom.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">매물 종류</label>
                    <select 
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg bg-white outline-none transition-all cursor-pointer ${
                        formType 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    >
                      <option value="원룸">원룸</option>
                      <option value="미투">미투 (미니투룸)</option>
                      <option value="투룸">투룸</option>
                      <option value="쓰리룸">쓰리룸</option>
                      <option value="오피스텔">오피스텔</option>
                      <option value="아파트">아파트</option>
                      <option value="상가">상가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">계약 형태</label>
                    <input 
                      type="text"
                      value={formContract}
                      onChange={(e) => setFormContract(e.target.value)}
                      placeholder="예) 월세, 전세, 전세·반전세"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formContract && formContract.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">보증금 (만원)</label>
                    <input 
                      type="text"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(e.target.value)}
                      placeholder="예) 200 (여러개인 경우 줄바꿈)"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all whitespace-pre-wrap ${
                        formDeposit && formDeposit.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">월세 (만원)</label>
                    <input 
                      type="text"
                      value={formRent}
                      onChange={(e) => setFormRent(e.target.value)}
                      placeholder="예) 28 (여러개인 경우 줄바꿈)"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all whitespace-pre-wrap ${
                        formRent && formRent.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">연락처</label>
                    <input 
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formPhone && formPhone.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">비고 / 즉시 확인 사항</label>
                    <input 
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="예) 즉시 입주가능, 출비 : 1543#"
                      className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none transition-all ${
                        formNote && formNote.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="bg-orange-50/60 p-5 sm:p-6 rounded-xl border border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="vrCheck"
                      checked={formVr}
                      onChange={(e) => setFormVr(e.target.checked)}
                      className="w-5 h-5 text-[#ff6600] border-gray-300 rounded focus:ring-[#ff6600] accent-[#ff6600] cursor-pointer"
                    />
                    <label htmlFor="vrCheck" className="text-base sm:text-lg font-bold text-gray-800 select-none cursor-pointer">
                      360 VR 투어 연결하기
                    </label>
                  </div>
                  <span className="text-xs sm:text-sm text-[#ff6600] font-bold">*체크 시 가상 현실 360 투어가 지원됩니다.</span>
                </div>

                {formVr && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-2">
                      <label className="text-base sm:text-lg font-bold text-gray-800">360 VR 파노라마 이미지</label>
                      <textarea 
                        value={formVrUrl}
                        onChange={(e) => setFormVrUrl(e.target.value)}
                        placeholder="여러 장일 경우 엔터(줄바꿈)로 구분하여 입력하세요&#13;&#10;예:&#13;&#10;https://example.com/vr1.jpg&#13;&#10;https://example.com/vr2.jpg"
                        rows={3}
                        className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg font-mono outline-none transition-all ${
                          formVrUrl && formVrUrl.trim() !== '' 
                            ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                            : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                        }`}
                      />
                      <div className="text-xs sm:text-sm text-gray-500 leading-tight pb-2">
                        *기본 360 이미지 예시: <span className="font-mono bg-gray-100 p-1 rounded select-all">https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg</span>
                      </div>
                      
                      {/* Image Upload Big Area */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`mt-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
                          ${isUploadingVr ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-[#ff6600] hover:bg-orange-50/50 bg-gray-50'}
                        `}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          accept="image/*"
                          className="hidden"
                        />
                        {isUploadingVr ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 size={40} className="animate-spin text-[#ff6600]" />
                            <span className="text-[#ff6600] font-bold">이미지 업로드 중... {Math.round(uploadProgress)}%</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-gray-500">
                            <UploadCloud size={40} className="text-gray-400" />
                            <div className="text-center">
                              <p className="font-bold text-gray-700">이곳을 클릭하거나 이미지를 드래그하여 업로드하세요</p>
                              <p className="text-sm mt-1">여러 장 선택 가능 (JPG, PNG)</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Grid */}
                      {formVrUrl && formVrUrl.trim() !== '' && (
                        <div className="mt-4">
                          <h5 className="font-bold text-gray-800 mb-3">등록된 VR 이미지 미리보기</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {formVrUrl.split('\n').filter(url => url.trim() !== '').map((url, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video flex items-center justify-center">
                                <img src={url.trim()} alt={`VR Photo ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image'; }} />
                                {idx === 0 && (
                                  <div className="absolute top-2 left-2 bg-[#ff6600] text-white text-xs font-bold px-2 py-1 rounded shadow">
                                    대표 VR 사진
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                      urls.splice(idx, 1);
                                      setFormVrUrl(urls.join('\n'));
                                    }}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow"
                                    title="이미지 삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Indicated matters (중개대상물표시사항) */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b-2 border-orange-100 pb-3">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#ff6600] uppercase tracking-wider">2. 중개대상물 상세 정보 (표시의무사항)</h4>
                  <span className="text-sm sm:text-base text-gray-500 font-bold">(공실 상세페이지 노출용)</span>
                </div>

                {/* Bulk Paste and Parse Widget */}
                <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-extrabold text-gray-800 flex items-center gap-1">
                      <span>💡 텍스트 일괄 등록 & 자동 파싱</span>
                      <span className="text-xs sm:text-sm text-[#ff6600] font-bold">(게시판 글이나 복사한 텍스트를 바로 파싱)</span>
                    </span>
                  </div>
                  <textarea
                    id="bulk_paste_area"
                    placeholder="여기에 '1. 남아지 ... 20. 상세설명 ...' 형태의 게시글 본문을 복사하여 붙여넣으세요."
                    className="w-full h-32 border-2 border-gray-200 rounded-xl p-3 text-base font-mono bg-white focus:border-[#ff6600] outline-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('bulk_paste_area') as HTMLTextAreaElement;
                      if (el && el.value.trim()) {
                        const parsed = parseDisclosureText(el.value);
                        if (Object.keys(parsed).length > 0) {
                          if (parsed.addr_detail) setDetailAddrDetail(parsed.addr_detail);
                          if (parsed.landlord_confirm) setDetailLandlordConfirm(parsed.landlord_confirm);
                          if (parsed.verified_status) setDetailVerifiedStatus(parsed.verified_status);
                          if (parsed.room_type) setDetailRoomType(parsed.room_type);
                          if (parsed.rent_detail) setDetailRentDetail(parsed.rent_detail);
                          if (parsed.features) setDetailFeatures(parsed.features);
                          if (parsed.area) setDetailArea(parsed.area);
                          if (parsed.floor) setDetailFloor(parsed.floor);
                          if (parsed.rooms_baths) setDetailRoomsBaths(parsed.rooms_baths);
                          if (parsed.maintenance_fee) setDetailMaintenanceFee(parsed.maintenance_fee);
                          if (parsed.move_in_date) setDetailMoveInDate(parsed.move_in_date);
                          if (parsed.approval_date) setDetailApprovalDate(parsed.approval_date);
                          if (parsed.direction) setDetailDirection(parsed.direction);
                          if (parsed.parking) setDetailParking(parsed.parking);
                          if (parsed.structure) setDetailStructure(parsed.structure);
                          if (parsed.duplex) setDetailDuplex(parsed.duplex);
                          if (parsed.building_use) setDetailBuildingUse(parsed.building_use);
                          if (parsed.total_parking) setDetailTotalParking(parsed.total_parking);
                          if (parsed.description) setDetailDescription(parsed.description);
                          
                          alert('텍스트가 정상적으로 파싱되어 아래의 상세 정보에 자동 입력되었습니다! 확인 후 저장해 주세요.');
                        } else {
                          alert('파싱 가능한 번호 패턴(예: 1. 또는 1. 소재지:)을 찾지 못했습니다.');
                        }
                      } else {
                        alert('붙여넣을 텍스트를 먼저 입력해 주세요.');
                      }
                    }}
                    className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm cursor-pointer"
                  >
                    ⚡ 분석 및 각 입력 필드 자동 채우기
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">1. 상세 소재지</label>
                    <input 
                      type="text"
                      value={detailAddrDetail}
                      onChange={(e) => setDetailAddrDetail(e.target.value)}
                      placeholder={formAddr ? `경상북도 구미시 ${formAddr} (${formName})` : '소재지 세부사항'}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailAddrDetail && detailAddrDetail.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">4. 방구분 상세</label>
                    <input 
                      type="text"
                      value={detailRoomType}
                      onChange={(e) => setDetailRoomType(e.target.value)}
                      placeholder={`${formType}·${formRoom ? formRoom.substring(0, 1) : '2'}층`}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailRoomType && detailRoomType.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">5. 거래 월세 상세</label>
                    <input 
                      type="text"
                      value={detailRentDetail}
                      onChange={(e) => setDetailRentDetail(e.target.value)}
                      placeholder={`보증금 ${formDeposit || '200'}만 원 / 월세 ${formRent || '13'}만 원`}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailRentDetail && detailRentDetail.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">6. 매물 특징 요약</label>
                    <input 
                      type="text"
                      value={detailFeatures}
                      onChange={(e) => setDetailFeatures(e.target.value)}
                      placeholder="예) 1공단 최인접, 홈플러스 도보 5분"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailFeatures && detailFeatures.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">7. 공급/전용면적</label>
                    <input 
                      type="text"
                      value={detailArea}
                      onChange={(e) => setDetailArea(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailArea && detailArea.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">8. 해당층 / 총층</label>
                    <input 
                      type="text"
                      value={detailFloor}
                      onChange={(e) => setDetailFloor(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailFloor && detailFloor.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">9. 방수 / 욕실수</label>
                    <input 
                      type="text"
                      value={detailRoomsBaths}
                      onChange={(e) => setDetailRoomsBaths(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailRoomsBaths && detailRoomsBaths.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">10. 관리비 조건</label>
                    <input 
                      type="text"
                      value={detailMaintenanceFee}
                      onChange={(e) => setDetailMaintenanceFee(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailMaintenanceFee && detailMaintenanceFee.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">11. 입주 가능일</label>
                    <input 
                      type="text"
                      value={detailMoveInDate}
                      onChange={(e) => setDetailMoveInDate(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailMoveInDate && detailMoveInDate.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">12. 사용 승인일</label>
                    <input 
                      type="text"
                      value={detailApprovalDate}
                      onChange={(e) => setDetailApprovalDate(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailApprovalDate && detailApprovalDate.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">13. 방향 (안방 기준)</label>
                    <input 
                      type="text"
                      value={detailDirection}
                      onChange={(e) => setDetailDirection(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailDirection && detailDirection.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">14. 주차 가능 여부</label>
                    <input 
                      type="text"
                      value={detailParking}
                      onChange={(e) => setDetailParking(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailParking && detailParking.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">15. 방 구조</label>
                    <input 
                      type="text"
                      value={detailStructure}
                      onChange={(e) => setDetailStructure(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailStructure && detailStructure.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">17. 건축물 용도</label>
                    <input 
                      type="text"
                      value={detailBuildingUse}
                      onChange={(e) => setDetailBuildingUse(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailBuildingUse && detailBuildingUse.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">19. 총 주차 대수</label>
                    <input 
                      type="text"
                      value={detailTotalParking}
                      onChange={(e) => setDetailTotalParking(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailTotalParking && detailTotalParking.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800">16. 복층 여부</label>
                    <input 
                      type="text"
                      value={detailDuplex}
                      onChange={(e) => setDetailDuplex(e.target.value)}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base sm:text-lg outline-none transition-all ${
                        detailDuplex && detailDuplex.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-base sm:text-lg font-bold text-gray-800">20. 상세 설명 및 홍보 문구</label>
                  <textarea 
                    value={detailDescription}
                    onChange={(e) => setDetailDescription(e.target.value)}
                    placeholder="공실의 특징과 강점을 살릴 수 있는 풍부한 설명을 적어주세요. (여러 줄 지원)"
                    className={`w-full border-2 rounded-xl p-4 text-base sm:text-lg outline-none min-h-[160px] resize-y transition-all ${
                      detailDescription && detailDescription.trim() !== '' 
                        ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                        : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                    }`}
                  />
                </div>
              </div>
            </div>
          </form>

            {/* Modal Footer */}
            <div className="bg-gray-100 border-t border-gray-200 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] bg-opacity-95 backdrop-blur-sm">
              <div className="w-full px-6 md:px-12 py-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl border border-gray-200 text-base font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button 
                  type="button"
                  onClick={handleSaveProperty}
                  className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-8 py-3 rounded-xl text-base font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {editingProperty ? '수정 내용 저장' : '공실 매물로 추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Board Post Modal Form */}
      {isBoardFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#ff6600]" />
                <h3 className="text-lg font-bold">
                  {editingPost ? '게시글 수정' : '새로운 게시글 등록'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBoardFormOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">카테고리 구분</label>
                <div className="flex flex-wrap gap-1.5">
                  {['공지', '안내', '이벤트', '중요', '표시의무사항'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setPostCategory(cat);
                        if (cat === '표시의무사항' && !postTitle) {
                          setPostTitle('[표시의무사항] ');
                        }
                      }}
                      className={`py-2 px-3 rounded-lg text-xs md:text-sm font-semibold border transition-all ${
                        postCategory === cat 
                          ? 'border-[#ff6600] bg-orange-50 text-[#ff6600] ring-2 ring-[#ff6600]/20' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked Property (Only for '표시의무사항') */}
              {postCategory === '표시의무사항' && (
                <div className="space-y-2 bg-orange-50/50 p-4 rounded-lg border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <span>연결할 매물 선택</span>
                      <strong className="text-red-500">*</strong>
                    </label>
                    <select
                      value={linkedPropertyId}
                      onChange={(e) => setLinkedPropertyId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-[#ff6600] outline-none"
                      required={postCategory === '표시의무사항'}
                    >
                      <option value="">-- 매물을 선택하세요 --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>
                          [{p.type}] {p.name} {p.room}호 ({p.addr})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {linkedPropertyId && (
                    <button
                      type="button"
                      onClick={() => {
                        const selectedProp = properties.find(p => 
                          String(p.id) === String(linkedPropertyId) ||
                          (p.name && p.room && `${p.name}_${p.room}` === String(linkedPropertyId)) ||
                          (p.name && p.name === String(linkedPropertyId))
                        );
                        if (selectedProp) {
                          setPostTitle(`★ [중개대상물 표시사항] ${selectedProp.name} ${selectedProp.room}호`);
                          setPostContent(
                            `1. 상세 소재지: 경상북도 구미시 ${selectedProp.addr} (${selectedProp.name}) ${selectedProp.room}호\n` +
                            `2. 집주인: 확인\n` +
                            `3. 확인매물: 확인\n` +
                            `4. 방구분 상세: ${selectedProp.type}·${selectedProp.room ? selectedProp.room.substring(0, 1) + '층' : '2층'}\n` +
                            `5. 거래 월세 상세: 보증금 ${selectedProp.deposit || '200'}만 원 / 월세 ${selectedProp.rent || '30'}만 원\n` +
                            `6. 매물 특징 요약: ${selectedProp.type} 풀옵션 가성비 좋은 깨끗한 방\n` +
                            `7. 공급/전용면적: 공급면적 30㎡ / 전용면적 30㎡ (전용률 100%)\n` +
                            `8. 해당층 / 총층: ${selectedProp.room ? selectedProp.room.substring(0, 1) + '층' : '2층'} / 총 4층\n` +
                            `9. 방수 / 욕실수: 방 1개 / 욕실 1개\n` +
                            `10. 관리비 조건: 10만 원 (수도, 인터넷, TV 포함)\n` +
                            `11. 입주 가능일: 즉시입주\n` +
                            `12. 사용 승인일: 2014.11.21\n` +
                            `13. 방향 (안방 기준): 남동향 (안방 기준)\n` +
                            `14. 주차 가능 여부: 가능\n` +
                            `15. 방 구조: 분리형\n` +
                            `16. 복층 여부: 단층\n` +
                            `17. 건축물 용도: 단독주택\n` +
                            `18. 매물 번호: TW-${selectedProp.id}\n` +
                            `19. 총 주차 대수: 12대\n` +
                            `20. 상세 설명 및 홍보 문구:\n` +
                            `구미시 ${selectedProp.addr}에 위치한 아름다운 ${selectedProp.name} ${selectedProp.room}호 공실입니다. 최상의 조건으로 모십니다. 문의사항은 유선으로 연락주세요.`
                          );
                        }
                      }}
                      className="w-full bg-[#ff6600]/10 text-[#ff6600] hover:bg-[#ff6600]/20 py-2 rounded-lg text-xs font-bold border border-dashed border-[#ff6600]/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      💡 해당 매물의 기본 공실 정보로 표시사항 본문 템플릿 자동 작성하기
                    </button>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">게시글 제목</label>
                <input 
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="예시) 공실 현황 360 VR 무료 촬영 서비스 지원 안내"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff6600] outline-none"
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">상세 내용</label>
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="사용자 페이지와 매물 상세 페이지에 표시될 내용을 상세하게 입력해 주세요."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff6600] outline-none min-h-[220px] resize-y font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="postImportant"
                  checked={postImportant}
                  onChange={(e) => setPostImportant(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ff6600] focus:ring-[#ff6600] border-gray-300"
                />
                <label htmlFor="postImportant" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  중요 공지사항으로 등록 (알림판 최상단 노출 및 강조 표시)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsBoardFormOpen(false)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
