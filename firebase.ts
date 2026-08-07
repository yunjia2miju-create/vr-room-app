import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import WatermarkOverlay, { WatermarkPosition } from './WatermarkOverlay';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Lock,
  User,
  UserPlus,
  LogIn,
  Search,
  Check, 
  X, 
  Info,
  Layers,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Settings,
  Tv,
  FileText,
  UploadCloud,
  Loader2,
  Star,
  GripVertical,
  Move,
  HardDrive,
  Shield
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
    blog?: string;
    blog_images?: string[];
    show_watermark?: boolean;
    watermark_pos?: string;
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
  onDeleteProperty: (id: string, firebaseId?: string) => void;
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
    try {
      return sessionStorage.getItem('taewang_admin_logged') === 'true';
    } catch {
      return false;
    }
  });

  const [loginError, setLoginError] = useState('');

  // Search & Filters inside Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');

  // Form / Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form Fields
  const [formMgt, setFormMgt] = useState('TW');
  const [formName, setFormName] = useState('');
  const [formAddr, setFormAddr] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formType, setFormType] = useState('원룸');
  const [formContract, setFormContract] = useState('월세');
  const [formDeposit, setFormDeposit] = useState('');
  const [formRent, setFormRent] = useState('');
  const [formPhone, setFormPhone] = useState('사무실 054-455-6789, 휴대폰 010-7590-0111');
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
  const [detailBlog, setDetailBlog] = useState('');
  const [detailBlogImages, setDetailBlogImages] = useState<string[]>([]);
  const [isUploadingBlogImg, setIsUploadingBlogImg] = useState(false);
  const [blogUploadProgress, setBlogUploadProgress] = useState(0);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state for 360 VR photos reordering
  const [draggedVrIndex, setDraggedVrIndex] = useState<number | null>(null);
  const [dragOverVrIndex, setDragOverVrIndex] = useState<number | null>(null);

  const handleVrDrop = (targetIdx: number) => {
    if (draggedVrIndex === null || draggedVrIndex === targetIdx) {
      setDraggedVrIndex(null);
      setDragOverVrIndex(null);
      return;
    }
    const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
    if (draggedVrIndex < 0 || draggedVrIndex >= urls.length || targetIdx < 0 || targetIdx >= urls.length) {
      setDraggedVrIndex(null);
      setDragOverVrIndex(null);
      return;
    }
    const [movedItem] = urls.splice(draggedVrIndex, 1);
    urls.splice(targetIdx, 0, movedItem);
    setFormVrUrl(urls.join('\n'));
    setDraggedVrIndex(null);
    setDragOverVrIndex(null);
  };

  // Drag and drop state for blog general photos reordering
  const [draggedBlogIndex, setDraggedBlogIndex] = useState<number | null>(null);
  const [dragOverBlogIndex, setDragOverBlogIndex] = useState<number | null>(null);

  const handleBlogDrop = (targetIdx: number) => {
    if (draggedBlogIndex === null || draggedBlogIndex === targetIdx) {
      setDraggedBlogIndex(null);
      setDragOverBlogIndex(null);
      return;
    }
    if (draggedBlogIndex < 0 || draggedBlogIndex >= detailBlogImages.length || targetIdx < 0 || targetIdx >= detailBlogImages.length) {
      setDraggedBlogIndex(null);
      setDragOverBlogIndex(null);
      return;
    }
    setDetailBlogImages(prev => {
      const next = [...prev];
      const [movedItem] = next.splice(draggedBlogIndex, 1);
      next.splice(targetIdx, 0, movedItem);
      return next;
    });
    setDraggedBlogIndex(null);
    setDragOverBlogIndex(null);
  };

  // Watermark Settings State
  const [adminWatermarkPos, setAdminWatermarkPos] = useState<WatermarkPosition>('center');
  const [showAdminWatermark, setShowAdminWatermark] = useState<boolean>(true);

  // Image File Sizes tracking state
  const [imageSizes, setImageSizes] = useState<Record<string, number>>({});

  // Helper function to format bytes into readable sizes (KB, MB, etc.)
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Automatically fetch/calculate sizes for VR and Blog images
  React.useEffect(() => {
    const vrUrls = formVrUrl.split('\n').map(u => u.trim()).filter(Boolean);
    const allUrls = Array.from(new Set([...vrUrls, ...detailBlogImages]));

    const missing = allUrls.filter(url => imageSizes[url] === undefined);
    if (missing.length === 0) return;

    let isMounted = true;

    missing.forEach(async (url) => {
      try {
        if (url.startsWith('data:')) {
          const base64Str = url.split(',')[1] || '';
          const sizeInBytes = Math.floor((base64Str.length * 3) / 4);
          if (isMounted) setImageSizes(prev => ({ ...prev, [url]: sizeInBytes }));
          return;
        }

        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          const contentLength = res.headers.get('content-length');
          if (contentLength) {
            const bytes = parseInt(contentLength, 10);
            if (!isNaN(bytes) && bytes > 0 && isMounted) {
              setImageSizes(prev => ({ ...prev, [url]: bytes }));
              return;
            }
          }
        }

        const getRes = await fetch(url);
        if (getRes.ok) {
          const blob = await getRes.blob();
          if (isMounted) {
            setImageSizes(prev => ({ ...prev, [url]: blob.size }));
          }
        }
      } catch (e) {
        if (isMounted) {
          setImageSizes(prev => ({ ...prev, [url]: 0 }));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [formVrUrl, detailBlogImages]);

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

    const uploadPromises = Array.from(files).map((file: any) => {
      return new Promise<string>((resolve, reject) => {
        const storageRef = ref(storage, `vr_tours/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => Math.min(prev + (progress / files.length), 100));
          },
          (error) => {
            console.error('File upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImageSizes((prev) => ({ ...prev, [downloadURL]: file.size }));
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

  const handleBlogFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBlogImg(true);
    setBlogUploadProgress(0);

    const uploadPromises = Array.from(files).map((file: any) => {
      return new Promise<string>((resolve, reject) => {
        const storageRef = ref(storage, `blog_photos/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setBlogUploadProgress((prev) => Math.min(prev + (progress / files.length), 100));
          },
          (error) => {
            console.error('Blog photo upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImageSizes((prev) => ({ ...prev, [downloadURL]: file.size }));
            resolve(downloadURL);
          }
        );
      });
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        setDetailBlogImages((prev) => [...prev, ...urls]);
        setIsUploadingBlogImg(false);
        setBlogUploadProgress(0);
        if (blogFileInputRef.current) blogFileInputRef.current.value = '';
      })
      .catch((err) => {
        alert('블로그 사진 업로드 중 오류가 발생했습니다.');
        setIsUploadingBlogImg(false);
        setBlogUploadProgress(0);
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
      20: ['상세 설명 및 홍보 문구', '상세설명 및 홍보문구', '상세 설명', '상세설명'],
      21: ['블로그', '게시판', '블로그 포스팅', '블로그포스팅']
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
      20: 'description',
      21: 'blog'
    };

    for (let i = 1; i <= 21; i++) {
      const nextNum = i + 1;
      let patternStr = '';
      if (i < 21) {
        patternStr = `(?:^|\\n)\\s*${i}\\.\\s*(?:[^:\\n]+:)?\\s*([\\s\\S]*?)(?=\\n\\s*${nextNum}\\.\\s*|$)`;
      } else {
        patternStr = `(?:^|\\n)\\s*21\\.\\s*(?:[^:\\n]+:)?\\s*([\\s\\S]*)$`;
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
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        sessionStorage.setItem('taewang_admin_logged', 'true');
        setIsLoggedIn(true);
        setLoginError('');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setLoginError('구글 로그인에 실패했습니다. ' + (error.message || ''));
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    sessionStorage.removeItem('taewang_admin_logged');
    localStorage.removeItem('taewang_admin_logged');
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsLoggedIn(false);
    navigate('/');
  };

  // Open form for creating
  const openCreateForm = () => {
    setEditingProperty(null);
    setFormMgt('TW');
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
    setDetailBlog('');
    setDetailBlogImages([]);
    setShowAdminWatermark(true);
    setAdminWatermarkPos('center');

    setIsFormOpen(true);
  };

  // Open form for editing
  const openEditForm = (property: Property) => {
    setEditingProperty(property);
    setFormMgt('TW');
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
    setDetailBlog(details.blog || '');
    setDetailBlogImages(Array.isArray(details.blog_images) ? details.blog_images : []);
    setShowAdminWatermark(details.show_watermark !== undefined ? details.show_watermark : true);
    setAdminWatermarkPos(details.watermark_pos || 'center');

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
      description: detailDescription || `구미시 ${formAddr}에 위치한 아름답고 수려한 ${formName} ${formRoom}호 공실입니다. 최상의 조건으로 모십니다.`,
      blog: detailBlog,
      blog_images: detailBlogImages,
      show_watermark: showAdminWatermark,
      watermark_pos: adminWatermarkPos
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
          description: parsed.description || detailsObj.description,
          blog: parsed.blog || detailsObj.blog,
          blog_images: detailsObj.blog_images,
          show_watermark: detailsObj.show_watermark,
          watermark_pos: detailsObj.watermark_pos
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
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden relative">
          
          {/* 회원가입 탭 바로 위 우상단 X (홈으로 가기) 버튼 */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-3.5 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-sm border border-gray-200"
            title="홈페이지로 돌아가기"
            aria-label="닫기"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 pr-12">
            <button className="flex-1 py-4 text-center font-bold text-[#009e73] border-b-2 border-[#009e73] flex items-center justify-center gap-2">
              <Lock size={18} />
              로그인
            </button>
            <button className="flex-1 py-4 text-center font-bold text-gray-400 flex items-center justify-center gap-2">
              <UserPlus size={18} />
              회원가입
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-gray-600 font-medium text-[14px] leading-relaxed mb-6 text-center">
              매물 등록 및 관리자 기능을 이용하시려면 구모 소셜 계정으로 로그인해주세요.
            </p>

            {loginError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 mb-4 rounded-xl border border-red-100">
                {loginError}
              </div>
            )}

            <div className="space-y-3">
              <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                </div>
                Google 계정으로 원클릭 로그인
              </button>
              <button type="button" onClick={handleGoogleLogin} className="w-full bg-[#fee500] hover:bg-[#e6ce00] text-gray-900 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1 3.7c-.1.3 0 .7.3.8.3.2.7.2 1-.1l4.4-2.9c.2 0 .5.1.8.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/></svg>
                </div>
                카카오톡 3초 간편로그인
              </button>
              <button type="button" onClick={handleGoogleLogin} className="w-full bg-[#03c75a] hover:bg-[#02b350] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 font-black italic text-[20px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                  N
                </div>
                네이버 아이디로 로그인
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-[#f4f6f8] hover:bg-[#e9ecef] text-gray-700 py-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
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
            <h1 className="text-lg md:text-xl font-black tracking-tight">태왕공인중개사사무소 <span className="text-[#ff6600] text-sm font-semibold ml-2">관리자 시스템</span></h1>
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
            {isFormOpen ? (
              /* Inline Property Registration / Editing Form Card */
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-200">
                {/* Form Header */}
                <div className="bg-gray-900 text-white px-5 sm:px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                      <span className="hidden sm:inline">매물 목록으로 돌아가기</span>
                    </button>
                    <div className="h-5 w-px bg-gray-700 hidden sm:block"></div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        <Settings size={18} className="text-[#ff6600]" />
                        {editingProperty ? `매물 수정: ${editingProperty.name} ${editingProperty.room}호` : '새로운 공실 매물 등록'}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">관리자 전용 매물 정보 및 VR/상세항목 작성</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="닫기 (Esc)"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveProperty} className="bg-gray-50/30 py-6 sm:py-8">
                  <div className="w-full px-4 sm:px-8 md:px-12 space-y-10">
                    {/* Section 1: Basic Information */}
              
              {/* Section 1: Basic Information */}
              <div className="space-y-6">
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#ff6600] border-b-2 border-orange-100 pb-3 uppercase tracking-wider">1. 기본 광고 정보</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1">관리부동산 업체</label>
                    <input 
                      type="text"
                      value="TW"
                      readOnly={true}
                      className="w-full border-2 border-gray-200 bg-gray-100 text-gray-900 font-bold rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none cursor-not-allowed select-none"
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
                    <div className="space-y-2">
                      <select 
                        value={['월세', '전세', '매매'].includes(formContract) ? formContract : '직접입력'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '직접입력') {
                            if (['월세', '전세', '매매'].includes(formContract)) {
                              setFormContract('');
                            }
                          } else {
                            setFormContract(val);
                          }
                        }}
                        className={`w-full border-2 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg bg-white outline-none transition-all cursor-pointer ${
                          formContract 
                            ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                            : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]'
                        }`}
                      >
                        <option value="월세">월세</option>
                        <option value="전세">전세</option>
                        <option value="매매">매매</option>
                        <option value="직접입력">직접입력</option>
                      </select>

                      {!['월세', '전세', '매매'].includes(formContract) && (
                        <input 
                          type="text"
                          value={formContract}
                          onChange={(e) => setFormContract(e.target.value)}
                          placeholder="계약 형태 직접 입력 (예: 반전세, 전세·반전세)"
                          className="w-full border-2 border-emerald-500 bg-emerald-50/10 text-gray-900 rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition-all"
                          autoFocus
                        />
                      )}
                    </div>
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
                        <div className="mt-6 space-y-6">
                          <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="w-full aspect-[2/1] sm:aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                              <img src={formVrUrl.split('\n').filter(url => url.trim() !== '')[0]?.trim()} alt="대표 VR 이미지" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image'; }} />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                              <h5 className="font-extrabold text-gray-800 text-base sm:text-lg flex items-center gap-2">
                                <span>파노라마 리스트</span>
                                <span className="text-xs sm:text-sm font-semibold text-[#ff6600]">
                                  (가로 5장 배치 · 🖱️ 마우스 드래그&드롭 또는 화살표 버튼으로 순서 이동)
                                </span>
                              </h5>
                              <span className="text-xs font-extrabold bg-orange-100 text-[#ff6600] px-2.5 py-1 rounded-lg">
                                총 {formVrUrl.split('\n').filter(u => u.trim() !== '').length}장 ({formatBytes(formVrUrl.split('\n').map(u => u.trim()).filter(Boolean).reduce((acc, u) => acc + (imageSizes[u] || 0), 0))})
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                              {formVrUrl.split('\n').filter(url => url.trim() !== '').map((url, idx, arr) => {
                                const isDragging = draggedVrIndex === idx;
                                const isDragOver = dragOverVrIndex === idx && !isDragging;

                                return (
                                  <div 
                                    key={idx}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      setDraggedVrIndex(idx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', String(idx));
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (dragOverVrIndex !== idx) setDragOverVrIndex(idx);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      if (dragOverVrIndex === idx) setDragOverVrIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      handleVrDrop(idx);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedVrIndex(null);
                                      setDragOverVrIndex(null);
                                    }}
                                    className={`relative group aspect-video rounded-xl overflow-hidden border-2 transition-all bg-gray-100 shadow-sm cursor-grab active:cursor-grabbing select-none ${
                                      isDragging 
                                        ? 'opacity-40 scale-95 border-dashed border-[#ff6600]' 
                                        : isDragOver
                                          ? 'border-[#ff6600] ring-4 ring-[#ff6600]/40 scale-105 z-20 shadow-xl'
                                          : idx === 0 
                                            ? 'border-[#ff6600] ring-2 ring-[#ff6600]/30' 
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                  >
                                    <img src={url.trim()} alt={`VR Photo ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image'; }} />
                                    
                                    {/* Drag Grip Center Overlay on Hover (Without dark full overlay) */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                      <div className="bg-black/75 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                                        <GripVertical size={14} />
                                        드래그하여 이동
                                      </div>
                                    </div>

                                    {/* Badge & Star Button */}
                                    {idx === 0 ? (
                                      <div className="absolute top-1.5 left-1.5 bg-[#ff6600] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-md flex items-center gap-1 pointer-events-none z-10">
                                        <Star size={12} fill="currentColor" />
                                        대표 360사진 {imageSizes[url.trim()] ? `(${formatBytes(imageSizes[url.trim()])})` : ''}
                                      </div>
                                    ) : (
                                      <div className="absolute top-1.5 left-1.5 bg-emerald-600/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none z-10">
                                        VR {idx + 1} {imageSizes[url.trim()] ? `(${formatBytes(imageSizes[url.trim()])})` : ''}
                                      </div>
                                    )}

                                    {/* Top Right Action: Set Main or Delete */}
                                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                                      {idx !== 0 && (
                                        <button 
                                          type="button" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                            const selected = urls.splice(idx, 1)[0];
                                            urls.unshift(selected);
                                            setFormVrUrl(urls.join('\n'));
                                          }}
                                          className="bg-black/60 hover:bg-yellow-500 text-white p-1 rounded transition-colors shadow-md cursor-pointer"
                                          title="대표 사진으로 설정"
                                        >
                                          <Star size={14} />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                          urls.splice(idx, 1);
                                          setFormVrUrl(urls.join('\n'));
                                        }}
                                        className="bg-red-600/90 hover:bg-red-600 text-white p-1 rounded transition-colors shadow-md cursor-pointer"
                                        title="이미지 삭제"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    {/* Bottom Navigation Overlay (Clean & Clear, without heavy dark gradient) */}
                                    <div className="absolute bottom-1 inset-x-1.5 flex items-center justify-between text-white z-10 pointer-events-none">
                                      <div className="flex items-center gap-1 pointer-events-auto">
                                        {/* Move Left */}
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                            if (idx > 0) {
                                              const temp = urls[idx];
                                              urls[idx] = urls[idx - 1];
                                              urls[idx - 1] = temp;
                                              setFormVrUrl(urls.join('\n'));
                                            }
                                          }}
                                          className="bg-black/60 hover:bg-black/80 disabled:opacity-20 disabled:hover:bg-black/60 text-white p-1 rounded shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                                          title="왼쪽(이전)으로 이동"
                                        >
                                          <ChevronLeft size={16} />
                                        </button>

                                        {/* Move Right */}
                                        <button
                                          type="button"
                                          disabled={idx === arr.length - 1}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                            if (idx < urls.length - 1) {
                                              const temp = urls[idx];
                                              urls[idx] = urls[idx + 1];
                                              urls[idx + 1] = temp;
                                              setFormVrUrl(urls.join('\n'));
                                            }
                                          }}
                                          className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                          title="오른쪽(다음)으로 이동"
                                        >
                                          <ChevronRight size={16} />
                                        </button>
                                      </div>

                                      <div className="text-[11px] font-mono text-gray-200 pointer-events-none">
                                        {idx + 1} / {arr.length}
                                      </div>

                                      <div className="flex items-center gap-1">
                                        {/* Move Up (5 steps backward) */}
                                        <button
                                          type="button"
                                          disabled={idx < 5}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                            if (idx >= 5) {
                                              const temp = urls[idx];
                                              urls[idx] = urls[idx - 5];
                                              urls[idx - 5] = temp;
                                              setFormVrUrl(urls.join('\n'));
                                            }
                                          }}
                                          className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                          title="위로 이동 (1줄 위)"
                                        >
                                          <ChevronUp size={16} />
                                        </button>

                                        {/* Move Down (5 steps forward) */}
                                        <button
                                          type="button"
                                          disabled={idx + 5 >= arr.length}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const urls = formVrUrl.split('\n').filter(u => u.trim() !== '');
                                            if (idx + 5 < urls.length) {
                                              const temp = urls[idx];
                                              urls[idx] = urls[idx + 5];
                                              urls[idx + 5] = temp;
                                              setFormVrUrl(urls.join('\n'));
                                            }
                                          }}
                                          className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                          title="아래로 이동 (1줄 아래)"
                                        >
                                          <ChevronDown size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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

                {/* Blog Image Section Container */}
                <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                  {/* Blog Image Upload Control */}
                  <div className="space-y-3 bg-orange-50/50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                          <UploadCloud size={18} className="text-[#ff6600]" />
                          블로그 사진/이미지 첨부 ({detailBlogImages.length}장 · {formatBytes(detailBlogImages.reduce((acc, u) => acc + (imageSizes[u] || 0), 0))})
                        </span>
                        <span className="text-xs font-semibold text-[#ff6600]">
                          (가로 5장 배치 · 🖱️ 드래그&드롭 및 순서 이동 가능)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => blogFileInputRef.current?.click()}
                        disabled={isUploadingBlogImg}
                        className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingBlogImg ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            업로드 중... ({Math.round(blogUploadProgress)}%)
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            블로그 사진 선택 (다중 가능)
                          </>
                        )}
                      </button>
                      <input 
                        type="file" 
                        ref={blogFileInputRef} 
                        onChange={handleBlogFileUpload} 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                      />
                    </div>

                    {/* Watermark Control Card */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Shield size={18} className="text-[#ff6600]" />
                          <span className="text-sm font-extrabold text-gray-800">
                            블로그 사진 워터마크 자동 삽입 & 추천 위치 설정
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-semibold">워터마크 표시:</span>
                          <button
                            type="button"
                            onClick={() => setShowAdminWatermark(!showAdminWatermark)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              showAdminWatermark ? 'bg-emerald-500 text-white shadow-2xs' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {showAdminWatermark ? '✓ ON (적용중)' : '✕ OFF (숨김)'}
                          </button>
                        </div>
                      </div>

                      {showAdminWatermark && (
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                          <div className="text-xs font-extrabold text-gray-700 flex items-center gap-1">
                            💡 전문가 추천 워터마크 위치 (다중 선택 가능 - 1개, 2개, 3개 자유 조합):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {(() => {
                              const isCenterActive = adminWatermarkPos === 'all' || adminWatermarkPos.split(',').map(s => s.trim()).includes('center');
                              const isBottomRightActive = adminWatermarkPos === 'all' || adminWatermarkPos.split(',').map(s => s.trim()).includes('bottom-right');
                              const isTopLeftActive = adminWatermarkPos === 'all' || adminWatermarkPos.split(',').map(s => s.trim()).includes('top-left');
                              const isAllActive = isCenterActive && isBottomRightActive && isTopLeftActive;

                              const togglePos = (target: 'center' | 'bottom-right' | 'top-left' | 'all') => {
                                if (target === 'all') {
                                  setAdminWatermarkPos(isAllActive ? '' : 'all');
                                  return;
                                }

                                let activeArr: string[] = [];
                                if (adminWatermarkPos === 'all') {
                                  activeArr = ['center', 'bottom-right', 'top-left'];
                                } else {
                                  activeArr = adminWatermarkPos.split(',').map(s => s.trim()).filter(Boolean);
                                }

                                if (activeArr.includes(target)) {
                                  activeArr = activeArr.filter(p => p !== target);
                                } else {
                                  activeArr.push(target);
                                }

                                if (activeArr.length === 3) {
                                  setAdminWatermarkPos('all');
                                } else {
                                  setAdminWatermarkPos(activeArr.join(','));
                                }
                              };

                              return (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => togglePos('all')}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                                      isAllActive
                                        ? 'border-[#ff6600] bg-orange-50/80 ring-2 ring-[#ff6600]/30 font-bold text-gray-900'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                                    }`}
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isAllActive ? 'bg-[#ff6600] border-[#ff6600] text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                      {isAllActive && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                      <div className="text-xs font-black text-[#ff6600] mb-0.5">🌟 전체 조합 (추천 1+2+3)</div>
                                      <div className="text-[11px] text-gray-600 font-medium">3개 위치 정밀 배치하여 완벽 도용방지</div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => togglePos('center')}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                                      isCenterActive
                                        ? 'border-[#ff6600] bg-orange-50/80 ring-2 ring-[#ff6600]/30 font-bold text-gray-900'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                                    }`}
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isCenterActive ? 'bg-[#ff6600] border-[#ff6600] text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                      {isCenterActive && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                      <div className="text-xs font-black text-[#ff6600] mb-0.5">🏢 추천 1: 중앙 워터마크 아이콘</div>
                                      <div className="text-[11px] text-gray-600 font-medium">태왕공인중개사사무소 로고 아이콘 마크</div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => togglePos('bottom-right')}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                                      isBottomRightActive
                                        ? 'border-[#ff6600] bg-orange-50/80 ring-2 ring-[#ff6600]/30 font-bold text-gray-900'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                                    }`}
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isBottomRightActive ? 'bg-[#ff6600] border-[#ff6600] text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                      {isBottomRightActive && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                      <div className="text-xs font-black text-[#ff6600] mb-0.5">📞 추천 2: 우측하단 전화문의</div>
                                      <div className="text-[11px] text-gray-600 font-medium">📞 상담문의: 054-455-6789 (태왕공인)</div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => togglePos('top-left')}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                                      isTopLeftActive
                                        ? 'border-[#ff6600] bg-orange-50/80 ring-2 ring-[#ff6600]/30 font-bold text-gray-900'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                                    }`}
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isTopLeftActive ? 'bg-[#ff6600] border-[#ff6600] text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                      {isTopLeftActive && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                      <div className="text-xs font-black text-[#ff6600] mb-0.5">⭐ 추천 3: 좌측상단 실매물 보증</div>
                                      <div className="text-[11px] text-gray-600 font-medium">⭐ [태왕 360 VR] 100% 현장 검증</div>
                                    </div>
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blog Images Preview - 5 Per Row Grid with Drag&Drop */}
                    {detailBlogImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
                        {detailBlogImages.map((imgUrl, imgIdx, arr) => {
                          const isDragging = draggedBlogIndex === imgIdx;
                          const isDragOver = dragOverBlogIndex === imgIdx && !isDragging;

                          return (
                            <div 
                              key={imgIdx}
                              draggable={true}
                              onDragStart={(e) => {
                                setDraggedBlogIndex(imgIdx);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(imgIdx));
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverBlogIndex !== imgIdx) setDragOverBlogIndex(imgIdx);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                if (dragOverBlogIndex === imgIdx) setDragOverBlogIndex(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleBlogDrop(imgIdx);
                              }}
                              onDragEnd={() => {
                                setDraggedBlogIndex(null);
                                setDragOverBlogIndex(null);
                              }}
                              className={`relative group aspect-video rounded-xl overflow-hidden border-2 transition-all bg-black/5 shadow-sm cursor-grab active:cursor-grabbing select-none ${
                                isDragging 
                                  ? 'opacity-40 scale-95 border-dashed border-[#ff6600]' 
                                  : isDragOver
                                    ? 'border-[#ff6600] ring-4 ring-[#ff6600]/40 scale-105 z-20 shadow-xl'
                                    : imgIdx === 0 
                                      ? 'border-[#ff6600] ring-2 ring-[#ff6600]/30' 
                                      : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <img src={imgUrl} alt={`블로그 이미지 ${imgIdx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                              {showAdminWatermark && <WatermarkOverlay position={adminWatermarkPos} compact={true} />}

                              {/* Hover Overlay indicating drag */}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="bg-black/70 text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shadow-md">
                                  <GripVertical size={13} />
                                  드래그 이동
                                </div>
                              </div>

                              {/* Badges */}
                              {imgIdx === 0 ? (
                                <div className="absolute top-1.5 left-1.5 bg-[#ff6600] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 pointer-events-none">
                                  <Star size={12} fill="currentColor" />
                                  대표 사진 {imageSizes[imgUrl] ? `(${formatBytes(imageSizes[imgUrl])})` : ''}
                                </div>
                              ) : (
                                <div className="absolute top-1.5 left-1.5 bg-gray-800/80 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
                                  사진 {imgIdx + 1} {imageSizes[imgUrl] ? `(${formatBytes(imageSizes[imgUrl])})` : ''}
                                </div>
                              )}

                              {/* Top Right Action Buttons: Set as Representative / Delete */}
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                                {imgIdx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailBlogImages(prev => {
                                        const next = [...prev];
                                        const selected = next.splice(imgIdx, 1)[0];
                                        next.unshift(selected);
                                        return next;
                                      });
                                    }}
                                    className="bg-black/60 hover:bg-yellow-500 text-white p-1 rounded transition-colors shadow cursor-pointer"
                                    title="대표 사진으로 설정"
                                  >
                                    <Star size={14} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailBlogImages(prev => prev.filter((_, idx) => idx !== imgIdx));
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors shadow cursor-pointer"
                                  title="사진 삭제"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* Bottom Control Overlay (Left, Right, Up, Down Navigation) */}
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-1.5 flex items-center justify-between text-white z-10">
                                <div className="flex items-center gap-1">
                                  {/* Move Left */}
                                  <button
                                    type="button"
                                    disabled={imgIdx === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailBlogImages(prev => {
                                        if (imgIdx === 0) return prev;
                                        const next = [...prev];
                                        const temp = next[imgIdx];
                                        next[imgIdx] = next[imgIdx - 1];
                                        next[imgIdx - 1] = temp;
                                        return next;
                                      });
                                    }}
                                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                    title="왼쪽(이전)으로 이동"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>

                                  {/* Move Right */}
                                  <button
                                    type="button"
                                    disabled={imgIdx === arr.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailBlogImages(prev => {
                                        if (imgIdx === arr.length - 1) return prev;
                                        const next = [...prev];
                                        const temp = next[imgIdx];
                                        next[imgIdx] = next[imgIdx + 1];
                                        next[imgIdx + 1] = temp;
                                        return next;
                                      });
                                    }}
                                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                    title="오른쪽(다음)으로 이동"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </div>

                                <div className="text-[11px] font-mono text-gray-200 pointer-events-none">
                                  {imgIdx + 1} / {arr.length}
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Move Up (1 row up = -5) */}
                                  <button
                                    type="button"
                                    disabled={imgIdx < 5}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailBlogImages(prev => {
                                        if (imgIdx < 5) return prev;
                                        const next = [...prev];
                                        const temp = next[imgIdx];
                                        next[imgIdx] = next[imgIdx - 5];
                                        next[imgIdx - 5] = temp;
                                        return next;
                                      });
                                    }}
                                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                    title="위로 이동 (1줄 위)"
                                  >
                                    <ChevronUp size={16} />
                                  </button>

                                  {/* Move Down (1 row down = +5) */}
                                  <button
                                    type="button"
                                    disabled={imgIdx + 5 >= arr.length}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailBlogImages(prev => {
                                        if (imgIdx + 5 >= arr.length) return prev;
                                        const next = [...prev];
                                        const temp = next[imgIdx];
                                        next[imgIdx] = next[imgIdx + 5];
                                        next[imgIdx + 5] = temp;
                                        return next;
                                      });
                                    }}
                                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 text-white p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                                    title="아래로 이동 (1줄 아래)"
                                  >
                                    <ChevronDown size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 21. 블로그 (게시판 포스팅 및 사진 첨부) */}
                  <div className="space-y-3 pt-4 border-t border-gray-200/80">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-base sm:text-lg font-bold text-[#ff6600] flex items-center gap-2">
                        <FileText size={22} />
                        21. 블로그 (게시판 포스팅 및 사진 첨부)
                      </label>
                      <span className="text-xs sm:text-sm text-gray-500 font-semibold">매물과 연동되는 블로그 설명글 및 사진 게시판</span>
                    </div>

                    <textarea 
                      value={detailBlog}
                      onChange={(e) => setDetailBlog(e.target.value)}
                      placeholder="21. 블로그에 게시할 상세 포스팅 내용을 작성하세요. (사진 첨부 기능 지원)"
                      className={`w-full border-2 rounded-xl p-4 text-base sm:text-lg outline-none min-h-[140px] resize-y transition-all ${
                        detailBlog && detailBlog.trim() !== '' 
                          ? 'border-emerald-500 bg-emerald-50/10 text-gray-900 focus:border-emerald-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-[#ff6600]'
                      }`}
                    />
                  </div>

                  {/* Overall Image Capacity Dashboard Card */}
                  {(() => {
                    const vrUrlsList = formVrUrl.split('\n').map(u => u.trim()).filter(Boolean);
                    const totalVrBytes = vrUrlsList.reduce((acc, url) => acc + (imageSizes[url] || 0), 0);
                    const totalBlogBytes = detailBlogImages.reduce((acc, url) => acc + (imageSizes[url] || 0), 0);
                    const grandTotalBytes = totalVrBytes + totalBlogBytes;

                    return (
                      <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-orange-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-orange-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <HardDrive size={22} className="text-[#ff6600]" />
                            <div>
                              <h6 className="font-extrabold text-gray-800 text-sm sm:text-base">
                                매물 사진 및 VR 데이터 용량 리포트
                              </h6>
                              <p className="text-xs text-gray-500 font-semibold">
                                360 파노라마 리스트 및 블로그 사진 전체 용량을 정밀 분석하여 실시간으로 표기합니다.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-[#ff6600] text-white font-extrabold px-3 py-1 rounded-full shadow-xs">
                            총 {vrUrlsList.length + detailBlogImages.length}장 등록됨
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {/* 360 Panorama Total Size */}
                          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-2xs flex flex-col justify-between">
                            <div className="text-xs font-extrabold text-gray-600 mb-2 flex items-center justify-between">
                              <span>360 파노라마 이미지 총 용량</span>
                              <span className="text-[11px] bg-orange-100 text-[#ff6600] font-bold px-2 py-0.5 rounded-md">
                                {vrUrlsList.length}장
                              </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight flex items-baseline gap-1">
                              {formatBytes(totalVrBytes)}
                            </div>
                          </div>

                          {/* Blog Photo Total Size */}
                          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
                            <div className="text-xs font-extrabold text-gray-600 mb-2 flex items-center justify-between">
                              <span>블로그 사진 총 용량</span>
                              <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                                {detailBlogImages.length}장
                              </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight flex items-baseline gap-1">
                              {formatBytes(totalBlogBytes)}
                            </div>
                          </div>

                          {/* Combined Grand Total Size */}
                          <div className="bg-gradient-to-br from-[#ff6600] to-[#e65c00] text-white p-4 rounded-xl shadow-md flex flex-col justify-between">
                            <div className="text-xs font-bold text-orange-100 mb-2 flex items-center justify-between">
                              <span>전체 매물 사진 통합 총 용량</span>
                              <span className="text-[11px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-md">
                                합계 {vrUrlsList.length + detailBlogImages.length}장
                              </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                              {formatBytes(grandTotalBytes)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

              {/* Form Footer */}
              <div className="bg-white border-t border-gray-200 shrink-0 shadow-xs">
                <div className="w-full px-5 sm:px-8 md:px-12 py-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium hidden sm:block">
                    * 필수 항목(<span className="text-red-500 font-bold">*</span>)을 입력하신 후 저장 버튼을 누르세요.
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl border border-gray-300 text-sm sm:text-base font-bold transition-colors cursor-pointer"
                    >
                      취소 (목록으로)
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-8 py-2.5 rounded-xl text-sm sm:text-base font-bold shadow-md transition-all cursor-pointer hover:shadow-lg flex items-center gap-2"
                    >
                      <span>{editingProperty ? '수정 내용 저장' : '공실 매물로 추가하기'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Default Properties List Table View */
          <div className="space-y-6">
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
                type="button"
                onClick={openCreateForm}
                className="w-full md:w-auto bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                + 새 공실 매물 등록
              </button>
            </div>

            {/* Properties Management List Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-4 px-6">관리부동산</th>
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
                                type="button"
                                onClick={() => navigate('/property/' + p.id)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                                title="사용자 화면 보기"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button 
                                type="button"
                                onClick={() => openEditForm(p)}
                                className="p-1.5 hover:bg-orange-50 text-orange-600 hover:text-[#ff6600] rounded-lg transition-colors border border-transparent hover:border-orange-100 cursor-pointer"
                                title="수정"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDelete(p)}
                                className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
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
          </div>
        )}
      </>
    )}
      </main>
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
