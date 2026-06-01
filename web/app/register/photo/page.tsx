"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { registerStore } from "@/lib/registerStore";
import type { PreAnalysisStatus, ReferenceImage } from "@/types/match";
import TopHeader from "@/components/TopHeader";

const API_BASE = "https://api.getitsju.com";

function ReferenceImageOverlay({ image, imageAction, onUse, onRefresh, onSkip }: {
  image: ReferenceImage | null;
  imageAction: "use" | "refresh" | "skip" | null;
  onUse: () => void;
  onRefresh: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-6">
      <div className="bg-white rounded-[20px] p-5 w-full max-w-sm">
        <h2 className="text-base font-bold text-black mb-1">참고 이미지 선택</h2>
        <p className="text-[13px] text-app-gray mb-4">AI가 분실물과 유사한 이미지를 찾았습니다.</p>
        {image ? (
          <>
            {imageAction === "refresh" ? (
              <div className="h-[180px] flex items-center justify-center mb-2.5">
                <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-[180px] rounded-xl overflow-hidden mb-2.5">
                <Image src={image.imageUrl} alt="" width={400} height={180} className="w-full h-full object-contain" unoptimized />
              </div>
            )}
            <p className="text-[13px] font-semibold text-black mb-4 line-clamp-2">{image.title}</p>
          </>
        ) : (
          <div className="h-[60px] flex items-center justify-center mb-4">
            <p className="text-sm text-app-gray">참고 이미지를 찾지 못했습니다.</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {image && (
            <button onClick={onUse} disabled={!!imageAction} className="h-[46px] rounded-[10px] bg-navy text-white text-sm font-semibold cursor-pointer border-none">
              {imageAction === "use" ? "처리 중..." : "이 이미지로 진행"}
            </button>
          )}
          {image && (
            <button onClick={onRefresh} disabled={!!imageAction} className="h-[46px] rounded-[10px] border border-app-border bg-white text-sm font-semibold text-[#434343] cursor-pointer">
              {imageAction === "refresh" ? "가져오는 중..." : "다시 가져오기"}
            </button>
          )}
          <button onClick={onSkip} disabled={!!imageAction} className="h-[46px] text-sm text-app-gray cursor-pointer bg-transparent border-none">
            이미지 없이 진행
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterPhotoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const type = searchParams.get("type") as "found" | "lost";
  const majorCategory = searchParams.get("majorCategory") ?? "";
  const minorCategory = searchParams.get("minorCategory") ?? "";
  const categoryDisplay = majorCategory && minorCategory ? `${majorCategory} > ${minorCategory}` : "";

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [preAnalysisId, setPreAnalysisId] = useState<number | null>(null);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [imageAction, setImageAction] = useState<"use" | "refresh" | "skip" | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateToDetail = (pId: number, refUrl?: string, skip?: boolean) => {
    const params = new URLSearchParams({
      type,
      majorCategory,
      minorCategory,
      text: text.trim(),
      preAnalysisId: String(pId),
    });
    if (refUrl) params.set("referenceImageUrl", encodeURIComponent(refUrl));
    if (skip) params.set("skipImage", "true");
    router.replace(`/register/detail?${params.toString()}`);
  };

  useEffect(() => {
    if (!preAnalysisId || !token) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ai/pre-analysis/${preAnalysisId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const status: PreAnalysisStatus = data.result.status;
        if (status === "PENDING_IMAGE_SELECTION") {
          clearInterval(pollingRef.current!);
          setReferenceImage(data.result.referenceImages?.[0] ?? null);
          setShowImageSelection(true);
        } else if (status === "COMPLETED") {
          clearInterval(pollingRef.current!);
          navigateToDetail(preAnalysisId);
        } else if (status === "FAILED") {
          clearInterval(pollingRef.current!);
          setAnalyzing(false);
          alert("AI 분석에 실패했습니다. 다시 시도해주세요.");
        }
      } catch {}
    };
    poll();
    pollingRef.current = setInterval(poll, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preAnalysisId, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleNext = async () => {
    if (!token) { router.push("/login"); return; }
    if (isFound && !photoFile) { alert("습득물 사진을 등록해주세요."); return; }
    if (!isFound && !text.trim()) { alert("물건 설명을 입력해주세요."); return; }

    registerStore.setPhoto(photoUrl, photoFile);

    if (isFound) {
      const params = new URLSearchParams({ type, majorCategory, minorCategory, text: text.trim() });
      router.replace(`/register/detail?${params.toString()}`);
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("itemType", "LOST");
      if (majorCategory) formData.append("majorCategory", majorCategory);
      if (minorCategory) formData.append("minorCategory", minorCategory);
      if (text.trim()) formData.append("text", text.trim());
      if (photoFile) formData.append("image", photoFile, "image.jpg");

      const res = await fetch(`${API_BASE}/api/ai/pre-analysis`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const id: number = data.result.id;
      const status: PreAnalysisStatus = data.result.status;
      setPreAnalysisId(id);

      if (status === "PENDING_IMAGE_SELECTION") {
        setReferenceImage(data.result.referenceImages?.[0] ?? null);
        setShowImageSelection(true);
      } else if (status === "COMPLETED") {
        navigateToDetail(id);
      } else if (status === "FAILED") {
        setAnalyzing(false);
        alert("AI 분석에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      setAnalyzing(false);
      alert("AI 분석에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleUseImage = () => {
    if (!referenceImage || !preAnalysisId) return;
    navigateToDetail(preAnalysisId, referenceImage.imageUrl);
  };

  const handleRefreshImage = async () => {
    if (!preAnalysisId || !token) return;
    setImageAction("refresh");
    try {
      const res = await fetch(`${API_BASE}/api/ai/pre-analysis/${preAnalysisId}/reference-images/refresh`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReferenceImage(data.result.referenceImages?.[0] ?? null);
    } catch { alert("오류가 발생했습니다."); }
    finally { setImageAction(null); }
  };

  const handleSkipImage = () => {
    if (!preAnalysisId) return;
    navigateToDetail(preAnalysisId, undefined, true);
  };

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
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">물건 등록하기</h1>
        </div>
        <div className="w-[19px]" />
      </div>

      <div className="flex-1 overflow-y-auto md:pt-[88px]">
        <div className="max-w-[720px] mx-auto px-6 pt-2 pb-24 md:pb-12">

          {/* 카테고리 태그 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: themeColor }}>
              {isFound ? "습득물" : "분실물"}
            </span>
            {categoryDisplay && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold text-[#434343] bg-app-gray-light">{categoryDisplay}</span>
            )}
          </div>

          {/* 사진 등록 카드 */}
          <div className="bg-white rounded-[10px] p-3 mb-2.5 shadow-sm">
            <div className="mb-2.5">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-black">사진 등록</span>
                <span className="text-xs text-app-gray">{photoUrl ? "(1/1)" : "(0/1)"}</span>
                {isFound ? <span className="w-[5px] h-[5px] rounded-full bg-red-500 shrink-0" /> : <span className="text-xs font-bold text-app-gray">(선택)</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#919191" strokeWidth="2" /><path d="M12 8V13" stroke="#919191" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="15.5" r="0.8" fill="#919191" /></svg>
                <span className="text-xs text-app-gray">물건의 특징이 잘 보이도록 사진을 등록해주세요.</span>
              </div>
            </div>

            {!photoUrl ? (
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
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => { setPhotoUrl(null); setPhotoFile(null); }} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#919191] rounded-full flex items-center justify-center cursor-pointer border-none">
                    <span className="text-white text-xs leading-none">×</span>
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* 물건 설명 카드 */}
          <div className="bg-white rounded-[10px] p-3 shadow-sm">
            <div className="mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-black">물건 설명</span>
                {isFound ? <span className="text-xs font-bold text-app-gray">(선택)</span> : <span className="w-[5px] h-[5px] rounded-full bg-red-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#919191" strokeWidth="2" /><path d="M12 8V13" stroke="#919191" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="15.5" r="0.8" fill="#919191" /></svg>
                <span className="text-xs text-app-gray">AI가 물건을 더 잘 파악할 수 있도록 자세히 설명해주세요.</span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isFound
                ? "예: 검은색 반지갑이에요. 소가죽 소재이고 표면 모서리가 약간 닳아있어요. 안에 카드가 몇 장 들어있어요."
                : "예: 흰색 무선 이어폰이에요. 케이스 뒷면에 곰 스티커가 붙어있고 오른쪽 이어버드에 작은 흠집이 있어요."}
              className="w-full h-[300px] bg-app-gray-light border border-app-border rounded-[10px] px-3 py-2.5 text-sm text-black resize-none outline-none placeholder:text-app-gray"
            />
          </div>

          {/* 데스크탑 CTA */}
          <div className="hidden md:block mt-8">
            <button
              onClick={handleNext}
              disabled={analyzing}
              className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] border-none cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg px-7 pt-3 pb-6 z-10 md:hidden">
        <button
          onClick={handleNext}
          disabled={analyzing}
          className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] border-none cursor-pointer"
          style={{ backgroundColor: themeColor }}
        >
          다음
        </button>
      </div>

      {/* AI 분석 로딩 */}
      {analyzing && !showImageSelection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl px-8 py-7 flex flex-col items-center w-[280px] shadow-xl">
            <div className="w-10 h-10 border-2 border-orange border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-black text-base font-semibold tracking-[-0.3px]">AI 분석 중...</p>
            <p className="text-app-gray text-xs mt-1.5">잠시만 기다려주세요</p>
            <button
              onClick={() => { if (pollingRef.current) clearInterval(pollingRef.current); setAnalyzing(false); setPreAnalysisId(null); }}
              className="mt-5 text-xs text-app-gray cursor-pointer bg-transparent border-none hover:text-black transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {showImageSelection && (
        <ReferenceImageOverlay image={referenceImage} imageAction={imageAction} onUse={handleUseImage} onRefresh={handleRefreshImage} onSkip={handleSkipImage} />
      )}
    </div>
  );
}

export default function RegisterPhotoPage() {
  return <Suspense><RegisterPhotoContent /></Suspense>;
}
