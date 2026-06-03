"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { RegistrationDetail } from "@/types/registration";
import { CategoryFilterModal, type CategoryFilterValue } from "@/components/CategoryFilterModal";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import TopHeader from "@/components/TopHeader";

const API_BASE = "https://api.getitsju.com";

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const id = searchParams.get("id");

  const [loadingData, setLoadingData] = useState(true);
  const [itemType, setItemType] = useState<"LOST" | "FOUND">("FOUND");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryFilterValue>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [location, setLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isFound = itemType === "FOUND";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  useEffect(() => {
    if (!id || !token) return;
    api.get<RegistrationDetail>(`/api/registration/${id}`, token)
      .then((data) => {
        setItemType(data.itemType);
        setTitle(data.title);
        setExistingImageUrl(data.imageUrl);
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        if (data.majorCategory && data.minorCategory) setCategory({ major: data.majorCategory, minor: data.minorCategory });
        if (data.occurredDate) setDate(data.occurredDate);
      })
      .catch(() => alert("게시물을 불러올 수 없습니다."))
      .finally(() => setLoadingData(false));
  }, [id, token]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!token || !id) return;
    if (!title.trim()) { alert("제목을 입력해주세요."); return; }
    if (!category) { alert("카테고리를 선택해주세요."); return; }
    if (!location.trim()) { alert("위치를 입력해주세요."); return; }

    const params = new URLSearchParams({ title: title.trim() });
    if (category) { params.append("majorCategory", category.major); if (category.minor) params.append("minorCategory", category.minor); }
    if (location.trim()) params.append("location", location.trim());
    if (selectedLat) params.append("latitude", String(selectedLat));
    if (selectedLng) params.append("longitude", String(selectedLng));
    if (date) params.append("occurredDate", date);
    if (description.trim()) params.append("description", description.trim());

    const formData = new FormData();
    if (photoFile) formData.append("image", photoFile, "image.jpg");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/registration/${id}?${params}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`오류: ${res.status}`);
      router.back();
    } catch (e: any) {
      alert(e.message ?? "수정 실패. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const displayImage = photoPreview ?? existingImageUrl;

  if (loadingData) {
    return (
      <div className="min-h-dvh bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      <TopHeader />

      {/* 모바일 헤더 */}
      <div className="flex items-center h-[51px] px-6 mt-4 md:hidden">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1 mr-2">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">물건 수정하기</h1>
        </div>
        <div className="w-[19px]" />
      </div>

      <div className="flex-1 overflow-y-auto md:pt-[88px]">
      <div className="max-w-[720px] mx-auto px-6 pt-2 pb-24">
        {/* 사진 */}
        <div className="bg-white rounded-[10px] p-3 mb-2.5 shadow-sm">
          <div className="mb-2.5">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold text-black">사진 등록</span>
              <span className="text-xs text-app-gray">{displayImage ? "(1/1)" : "(0/1)"}</span>
              <span className="text-xs font-bold text-app-gray">(선택)</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#919191" strokeWidth="2" /><path d="M12 8V13" stroke="#919191" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="15.5" r="0.8" fill="#919191" /></svg>
              <span className="text-xs text-app-gray">물건의 특징이 잘 보이도록 사진을 등록해주세요.</span>
            </div>
          </div>
          {!displayImage ? (
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-[130px] border border-dashed border-app-border rounded-[10px] flex flex-col items-center justify-center gap-2 cursor-pointer bg-white">
              <svg width="41" height="35" viewBox="0 0 24 20" fill="none">
                <path d="M23 17C23 18.1 22.1 19 21 19H3C1.9 19 1 18.1 1 17V7C1 5.9 1.9 5 3 5H7L9 2H15L17 5H21C22.1 5 23 5.9 23 7V17Z" stroke="#919191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="11" r="4" stroke="#919191" strokeWidth="1.5" />
              </svg>
              <span className="text-[13px] font-extrabold text-app-gray">사진 추가</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 h-[130px] border border-dashed border-app-border rounded-[10px] flex flex-col items-center justify-center gap-2 cursor-pointer bg-white">
                <svg width="41" height="35" viewBox="0 0 24 20" fill="none">
                  <path d="M23 17C23 18.1 22.1 19 21 19H3C1.9 19 1 18.1 1 17V7C1 5.9 1.9 5 3 5H7L9 2H15L17 5H21C22.1 5 23 5.9 23 7V17Z" stroke="#919191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="4" stroke="#919191" strokeWidth="1.5" />
                </svg>
                <span className="text-[13px] font-extrabold text-app-gray">사진 변경</span>
              </button>
              <div className="relative w-[131px] shrink-0">
                <div className="w-[131px] h-[131px] rounded-[15px] overflow-hidden">
                  <img src={displayImage} alt="" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); setExistingImageUrl(null); }} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#919191] rounded-full flex items-center justify-center cursor-pointer border-none">
                  <span className="text-white text-xs leading-none">×</span>
                </button>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-[10px] p-3 shadow-sm">
          {/* 제목 */}
          <div className="mb-3.5">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold text-black">제목</span>
              <span className="w-[5px] h-[5px] rounded-full bg-red-500" />
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 검은색 Kodak 모자"
              className="w-full h-[34px] bg-app-gray-light border border-app-border rounded-[10px] px-3 text-xs text-black outline-none placeholder:text-app-gray" />
          </div>

          {/* 카테고리 */}
          <div className="mb-3.5">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold text-black">카테고리</span>
              <span className="w-[5px] h-[5px] rounded-full bg-red-500" />
            </div>
            <button onClick={() => setShowCategoryModal(true)}
              className="w-full h-[34px] bg-app-gray-light border border-app-border rounded-[10px] flex items-center justify-between px-3 cursor-pointer">
              <span className="text-xs" style={{ color: category ? "#000" : "#919191" }}>
                {category ? `${category.major} > ${category.minor}` : "카테고리를 선택해주세요"}
              </span>
              <svg width="5" height="9" viewBox="0 0 5 9" fill="none" className="shrink-0">
                <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 위치 */}
          <div className="mb-3.5">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold text-black">{isFound ? "습득 위치" : "분실 위치"}</span>
              <span className="w-[5px] h-[5px] rounded-full bg-red-500" />
            </div>
            <button onClick={() => setShowLocationModal(true)}
              className="w-full h-[34px] bg-app-gray-light border border-app-border rounded-[10px] flex items-center px-2.5 gap-1.5 cursor-pointer text-left">
              <svg width="9" height="11" viewBox="0 0 9 12" fill="none" overflow="visible" className="shrink-0">
                <path d="M8.5 4.5C8.5 6.9965 5.7305 9.5965 4.8005 10.3995C4.71386 10.4646 4.6084 10.4999 4.5 10.4999C4.3916 10.4999 4.28614 10.4646 4.1995 10.3995C3.2695 9.5965 0.5 6.9965 0.5 4.5C0.5 3.43913 0.921427 2.42172 1.67157 1.67157C2.42172 0.921427 3.43913 0.5 4.5 0.5C5.56087 0.5 6.57828 0.921427 7.32843 1.67157C8.07857 2.42172 8.5 3.43913 8.5 4.5Z" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.5 6.00024C5.32843 6.00024 6 5.32867 6 4.50024C6 3.67182 5.32843 3.00024 4.5 3.00024C3.67157 3.00024 3 3.67182 3 4.50024C3 5.32867 3.67157 6.00024 4.5 6.00024Z" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex-1 text-xs" style={{ color: location ? "#000" : "#919191" }}>
                {location || "위치를 검색해주세요"}
              </span>
              <svg width="5" height="9" viewBox="0 0 5 9" fill="none" className="shrink-0">
                <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 날짜 */}
          <div className="mb-3.5">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold text-black">{isFound ? "습득 날짜" : "분실 날짜"}</span>
              <span className="w-[5px] h-[5px] rounded-full bg-red-500" />
            </div>
            <div onClick={() => dateInputRef.current?.showPicker()} className="h-[34px] bg-app-gray-light border border-app-border rounded-[10px] flex items-center px-2.5 gap-1.5 cursor-pointer">
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none" className="shrink-0">
                <path d="M3 0.5V2.5M7 0.5V2.5M8.5 1.5H1.5C0.948 1.5 0.5 1.948 0.5 2.5V9.5C0.5 10.052 0.948 10.5 1.5 10.5H8.5C9.052 10.5 9.5 10.052 9.5 9.5V2.5C9.5 1.948 9.052 1.5 8.5 1.5ZM0.5 4.5H9.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 text-xs text-black bg-transparent outline-none cursor-pointer" />
              <svg width="5" height="9" viewBox="0 0 5 9" fill="none" className="shrink-0">
                <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold text-black">상세 설명</span>
              <span className="text-[10px] font-bold text-app-gray">(선택)</span>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="물건의 특징을 자세히 입력해주세요"
              className="w-full h-[67px] bg-app-gray-light border border-app-border rounded-[10px] px-3 py-2 text-xs text-black resize-none outline-none placeholder:text-app-gray" />
          </div>
        </div>
      </div>
      </div>

      {/* CTA - 모바일/데스크탑 모두 fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg pt-3 pb-6 z-10 px-7 md:px-0">
        <div className="md:max-w-[720px] md:mx-auto md:px-6">
          <button onClick={handleSubmit} disabled={loading}
            className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] border-none cursor-pointer"
            style={{ backgroundColor: themeColor }}>
            {loading ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </div>

      <CategoryFilterModal visible={showCategoryModal} value={category} activeColor={themeColor} onSelect={setCategory} onClose={() => setShowCategoryModal(false)} />
      <LocationSearchModal visible={showLocationModal} token={token} onSelect={(place) => { setLocation(place.name); setSelectedLat(place.lat); setSelectedLng(place.lng); }} onClose={() => setShowLocationModal(false)} />
    </div>
  );
}

export default function EditPage() {
  return <Suspense><EditContent /></Suspense>;
}
