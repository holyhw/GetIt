"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { registerStore } from "@/lib/registerStore";
import { matchStore } from "@/lib/matchStore";
import type { PreAnalysisStatus, MatchResultResponse } from "@/types/match";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import TopHeader from "@/components/TopHeader";

const API_BASE = "https://api.getitsju.com";
const MATCHING_MESSAGES = ["등록된 습득물 탐색 중...", "유사도 분석 중...", "결과 정리 중..."];

function RegisterDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();

  const type = searchParams.get("type") as "found" | "lost";
  const majorCategory = searchParams.get("majorCategory") ?? "";
  const minorCategory = searchParams.get("minorCategory") ?? "";
  const initialText = searchParams.get("text") ?? "";
  const preAnalysisIdParam = searchParams.get("preAnalysisId");
  const referenceImageUrl = searchParams.get("referenceImageUrl");
  const skipImage = searchParams.get("skipImage");
  const textWeightParam = searchParams.get("textWeight");
  const imageWeightParam = searchParams.get("imageWeight");

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchingMsgIdx, setMatchingMsgIdx] = useState(0);
  const [description, setDescription] = useState(initialText);
  const [editedCaption, setEditedCaption] = useState("");
  const [aiCaptionLoaded, setAiCaptionLoaded] = useState(false);
  const [aiCaption, setAiCaption] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<"PROCESSING" | "COMPLETED" | "FAILED">("PROCESSING");

  const dateInputRef = useRef<HTMLInputElement>(null);
  const preAnalysisIdRef = useRef<number | null>(null);
  const analysisStatusRef = useRef<PreAnalysisStatus>("PROCESSING");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (preAnalysisIdParam && (referenceImageUrl || skipImage)) {
      const id = parseInt(preAnalysisIdParam);
      preAnalysisIdRef.current = id;
      registerStore.clear();
      const url = referenceImageUrl
        ? `${API_BASE}/api/ai/pre-analysis/${id}/reference-image`
        : `${API_BASE}/api/ai/pre-analysis/${id}/reference-image/skip`;
      const opts: RequestInit = referenceImageUrl
        ? { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: decodeURIComponent(referenceImageUrl) }) }
        : { method: "POST", headers: { Authorization: `Bearer ${token}` } };
      fetch(url, opts).catch(() => {});
      analysisStatusRef.current = "PROCESSING";
      startPolling(id);
      return;
    }

    if (preAnalysisIdParam) {
      const id = parseInt(preAnalysisIdParam);
      preAnalysisIdRef.current = id;
      analysisStatusRef.current = "COMPLETED";
      registerStore.clear();
      fetch(`${API_BASE}/api/ai/pre-analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const caption = data.result?.vlmResult?.caption;
          if (caption) setAiCaption(caption);
        })
        .catch(() => {});
      return;
    }

    const startAnalysis = async () => {
      try {
        const formData = new FormData();
        formData.append("itemType", "FOUND");
        if (majorCategory) formData.append("majorCategory", majorCategory);
        if (minorCategory) formData.append("minorCategory", minorCategory);
        if (initialText) formData.append("text", initialText);
        const file = registerStore.getFile();
        if (file) formData.append("image", file, "image.jpg");
        registerStore.clear();

        const res = await fetch(`${API_BASE}/api/ai/pre-analysis`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const id: number = data.result.id;
        const status: PreAnalysisStatus = data.result.status;
        preAnalysisIdRef.current = id;
        if (status !== "PROCESSING") {
          analysisStatusRef.current = status;
        } else {
          startPolling(id);
        }
      } catch {
        analysisStatusRef.current = "FAILED";
      }
    };
    startAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startPolling = (id: number) => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ai/pre-analysis/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const status: PreAnalysisStatus = data.result.status;
        if (status !== "PROCESSING") {
          analysisStatusRef.current = status;
          clearInterval(pollingRef.current!);
          if (status === "COMPLETED") {
            const caption = data.result?.vlmResult?.caption;
            if (caption) setAiCaption(caption);
          }
        }
      } catch {}
    };
    poll();
    pollingRef.current = setInterval(poll, 2000);
  };

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  useEffect(() => {
    if (aiCaption) {
      setEditedCaption(aiCaption);
      setAiCaptionLoaded(true);
      setAnalysisStatus("COMPLETED");
    }
  }, [aiCaption]);

  const waitForAnalysis = (): Promise<PreAnalysisStatus> =>
    new Promise((resolve) => {
      if (analysisStatusRef.current !== "PROCESSING") { resolve(analysisStatusRef.current); return; }
      const interval = setInterval(() => {
        if (analysisStatusRef.current !== "PROCESSING") { clearInterval(interval); resolve(analysisStatusRef.current); }
      }, 500);
    });

  const handleSubmit = async () => {
    if (!token) return;
    if (!title.trim()) { alert("제목을 입력해주세요."); return; }

    setLoading(true);
    let idx = 0;
    const msgInterval = setInterval(() => { idx = (idx + 1) % MATCHING_MESSAGES.length; setMatchingMsgIdx(idx); }, 2100);

    try {
      const pId = preAnalysisIdRef.current;
      if (pId === null) { alert("AI 분석 중입니다. 잠시 후 다시 시도해주세요."); return; }

      const status = await waitForAnalysis();
      if (status === "FAILED") { alert("AI 분석 실패. 처음으로 돌아가 다시 시도해주세요."); return; }

      const body: Record<string, string | number> = {
        title: title.trim(),
        majorCategory,
        minorCategory,
        ...(location.trim() && { location: location.trim() }),
        ...(selectedLat && { latitude: selectedLat }),
        ...(selectedLng && { longitude: selectedLng }),
        ...(description.trim() && { description: description.trim() }),
        ...(editedCaption.trim() && { caption: editedCaption.trim() }),
        ...(date && { occurredDate: date }),
        ...(!isFound && {
          textWeight: textWeightParam ? parseFloat(textWeightParam) : 0.3,
          imageWeight: imageWeightParam ? parseFloat(imageWeightParam) : 0.7,
        }),
      };

      const path = isFound
        ? `/api/ai/pre-analysis/${pId}/registration/found`
        : `/api/ai/pre-analysis/${pId}/registration/lost`;

      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`오류: ${res.status}`);
      const data = await res.json();
      console.log("[registration] 응답:", JSON.stringify(data.result, null, 2));

      if (cancelledRef.current) return;
      if (isFound) {
        router.replace(`/detail/${data.result.id}?type=found&fromRegistration=true`);
      } else {
        matchStore.set({ matchResults: data.result.matchResults as MatchResultResponse[] });
        router.replace("/top5?fromRegistration=true");
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "등록 실패. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
    }
  };

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      <TopHeader />

      {/* 모바일 헤더 */}
      <div className="flex items-center h-[51px] px-6 mt-4 md:hidden">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">물건 정보 입력</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:pt-[88px]">
        <div className="max-w-[720px] mx-auto px-6 pt-2 pb-24 md:pb-12">

          {/* 등록 유형 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: themeColor }}>
              {isFound ? "습득물 등록" : "분실물 등록"}
            </span>
          </div>

          {/* 안내 배너 */}
          <div className="rounded-2xl py-3.5 px-4 flex items-center gap-3.5 mb-5 border" style={{ backgroundColor: themeColor + "12", borderColor: themeColor + "25" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor + "20" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={themeColor} strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2" stroke={themeColor} strokeWidth="1.8" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-app-text tracking-[-0.3px]">
                {isFound ? "습득 장소와 날짜를 입력해 주세요" : "분실 장소와 날짜를 입력해 주세요"}
              </p>
              <p className="text-[11px] font-medium mt-0.5 tracking-[-0.2px]" style={{ color: themeColor }}>
                {isFound ? "AI가 분실자를 자동으로 찾아드릴게요" : "등록하면 AI가 유사한 습득물 Top 5를 보여드려요"}
              </p>
            </div>
          </div>

          {/* 폼 */}
          <div className="bg-white rounded-[10px] p-3 shadow-sm">
            {/* 제목 */}
            <div className="mb-[18px]">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[13px] font-bold text-black">제목</span>
                <span className="w-[5px] h-[5px] rounded-full bg-red-500" />
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 검은색 Kodak 모자"
                className="w-full h-11 bg-app-gray-light border border-app-border rounded-[10px] px-3.5 text-sm text-black outline-none placeholder:text-app-gray"
              />
            </div>

            {/* AI 분석 캡션 */}
            <div className="mb-[18px]">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[13px] font-bold text-black">AI 분석</span>
                {analysisStatus === "PROCESSING" ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColor }} />
                    <span className="text-[10px] font-semibold" style={{ color: themeColor }}>분석 중...</span>
                  </div>
                ) : aiCaptionLoaded ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: themeColor + "20", color: themeColor }}>✨ AI 생성</span>
                ) : null}
              </div>
              <textarea
                value={editedCaption}
                onChange={(e) => { setEditedCaption(e.target.value); if (aiCaptionLoaded) setAiCaptionLoaded(false); }}
                placeholder={analysisStatus === "PROCESSING" ? "AI가 분석하고 있어요..." : "AI 분석 결과가 여기에 표시됩니다"}
                className="w-full min-h-[100px] bg-app-gray-light border border-app-border rounded-[10px] px-3.5 py-2.5 text-sm text-black resize-none outline-none placeholder:text-app-gray"
              />
            </div>

            {/* 위치 */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[13px] font-bold text-black">{isFound ? "습득 위치" : "분실 위치"}</span>
                <span className="text-xs font-bold text-app-gray">(선택)</span>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="w-full h-11 bg-app-gray-light border border-app-border rounded-[10px] flex items-center px-2.5 gap-2 cursor-pointer text-left"
              >
                <svg width="14" height="16" viewBox="0 0 9 12" fill="none" overflow="visible" className="shrink-0">
                  <path d="M8.5 4.5C8.5 6.9965 5.7305 9.5965 4.8005 10.3995C4.71386 10.4646 4.6084 10.4999 4.5 10.4999C4.3916 10.4999 4.28614 10.4646 4.1995 10.3995C3.2695 9.5965 0.5 6.9965 0.5 4.5C0.5 3.43913 0.921427 2.42172 1.67157 1.67157C2.42172 0.921427 3.43913 0.5 4.5 0.5C5.56087 0.5 6.57828 0.921427 7.32843 1.67157C8.07857 2.42172 8.5 3.43913 8.5 4.5Z" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.5 6.00024C5.32843 6.00024 6 5.32867 6 4.50024C6 3.67182 5.32843 3.00024 4.5 3.00024C3.67157 3.00024 3 3.67182 3 4.50024C3 5.32867 3.67157 6.00024 4.5 6.00024Z" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex-1 text-sm" style={{ color: location ? "#000" : "#919191" }}>
                  {location || "위치를 검색해주세요"}
                </span>
                <svg width="7" height="12" viewBox="0 0 5 9" fill="none" className="shrink-0">
                  <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* 날짜 */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[13px] font-bold text-black">{isFound ? "습득 날짜" : "분실 날짜"}</span>
                <span className="text-xs font-bold text-app-gray">(선택)</span>
              </div>
              <div onClick={() => dateInputRef.current?.showPicker()} className="h-11 bg-app-gray-light border border-app-border rounded-[10px] flex items-center px-2.5 gap-2 cursor-pointer relative overflow-hidden">
                <svg width="14" height="16" viewBox="0 0 10 11" fill="none" className="shrink-0 pointer-events-none">
                  <path d="M3 0.5V2.5M7 0.5V2.5M8.5 1.5H1.5C0.948 1.5 0.5 1.948 0.5 2.5V9.5C0.5 10.052 0.948 10.5 1.5 10.5H8.5C9.052 10.5 9.5 10.052 9.5 9.5V2.5C9.5 1.948 9.052 1.5 8.5 1.5ZM0.5 4.5H9.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex-1 text-sm pointer-events-none select-none" style={{ color: date ? "#000" : "#919191" }}>
                  {date ? date.replace(/-/g, ".") : "날짜를 선택해주세요"}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  tabIndex={-1}
                />
                <svg width="7" height="12" viewBox="0 0 5 9" fill="none" className="shrink-0 pointer-events-none">
                  <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke={themeColor} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* 데스크탑 CTA */}
          <div className="hidden md:block mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] border-none cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? "등록 중..." : isFound ? "습득물 등록하기" : "분실물 등록하기"}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 CTA */}
      <div className="bg-app-bg px-7 pt-3 pb-6 md:hidden">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] border-none cursor-pointer"
          style={{ backgroundColor: themeColor }}
        >
          {loading ? "등록 중..." : isFound ? "습득물 등록하기" : "분실물 등록하기"}
        </button>
      </div>

      {/* 분실물 매칭 로딩 오버레이 */}
      {loading && !isFound && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45">
          <div className="bg-white rounded-3xl px-10 py-11 flex flex-col items-center w-[360px] shadow-2xl">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center mb-7">
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute rounded-full animate-ping"
                  style={{ width: 60, height: 60, border: "1.5px solid #FF7A00", animationDelay: `${i * 0.7}s`, animationDuration: "2.1s" }} />
              ))}
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: "#FF7A00", boxShadow: "0 0 24px rgba(255,122,0,0.5)" }}>
                🔍
              </div>
            </div>
            <p className="text-[20px] font-bold text-black tracking-[-0.4px]">GET IT이 찾아드릴게요</p>
            <p className="text-sm font-medium mt-2 tracking-[-0.2px] text-orange">{MATCHING_MESSAGES[matchingMsgIdx]}</p>
            <p className="text-[13px] text-app-gray mt-1">나가도 알림으로 받아볼 수 있어요</p>
            <button onClick={() => { cancelledRef.current = true; setLoading(false); router.replace("/"); }}
              className="mt-6 px-6 py-2 rounded-full border border-app-border text-[13px] text-app-gray cursor-pointer bg-transparent hover:bg-app-gray-light transition-colors">
              홈으로
            </button>
          </div>
        </div>
      )}

      <LocationSearchModal
        visible={showLocationModal}
        token={token}
        onSelect={(place) => { setLocation(place.name); setSelectedLat(place.lat); setSelectedLng(place.lng); }}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}

export default function RegisterDetailPage() {
  return <Suspense><RegisterDetailContent /></Suspense>;
}
