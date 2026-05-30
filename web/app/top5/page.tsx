"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { matchStore } from "@/lib/matchStore";
import { CategoryImage } from "@/components/CategoryImage";
import type { MatchResultResponse } from "@/types/match";

const CARD_WIDTH = 273;

function SimilarityBadge({ percentage }: { percentage: number }) {
  const SIZE = 65, STROKE = 5;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE * (1 - percentage / 100);
  return (
    <div style={{ width: SIZE, height: SIZE }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.85)" }} />
      <svg width={SIZE} height={SIZE} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#E5E7EB" strokeWidth={STROKE} fill="none" />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#3B82F6" strokeWidth={STROKE} fill="none" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-center z-10">
        <div className="flex items-baseline">
          <span className="text-[18px] font-bold text-black">{percentage}</span>
          <span className="text-[10px] font-semibold text-black">%</span>
        </div>
        <span className="text-[9px] font-medium text-black">유사도</span>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="relative opacity-75" style={{ width: 43, height: 24 }}>
      <svg width="43" height="24" viewBox="0 0 43 24" fill="none" className="absolute inset-0">
        <path d="M0 8C0 3.58 3.58 0 8 0H35C39.42 0 43 3.58 43 8V24H0V8Z" fill="#1E3A5F" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-medium text-white">{rank}위</span>
      </div>
    </div>
  );
}

function Top5Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();

  const id = searchParams.get("id");
  const type = searchParams.get("type") as "found" | "lost" | null;
  const fromRegistration = searchParams.get("fromRegistration");

  const [data, setData] = useState<MatchResultResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      const stored = matchStore.get();
      setData(stored?.matchResults ?? []);
      matchStore.clear();
      return;
    }
    if (!token) return;
    setLoading(true);
    const endpoint = type === "found"
      ? `/api/registration/${id}/matched-lost`
      : `/api/registration/${id}/matches`;
    fetch(`https://api.getitsju.com${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setData(d.result?.matchResults ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [id, token, type]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / (CARD_WIDTH + 20));
    setCurrentIndex(Math.max(0, Math.min(idx, data.length - 1)));
  };

  const goBack = () => fromRegistration ? router.replace("/") : router.back();

  if (loading) {
    return (
      <div className="min-h-dvh bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-dvh bg-app-bg flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-app-gray">매칭 결과가 없습니다.</p>
        <button onClick={goBack} className="text-sm text-navy font-semibold cursor-pointer bg-transparent border-none">돌아가기</button>
      </div>
    );
  }

  const currentItem = data[currentIndex];
  const SIDE_OFFSET = (393 - CARD_WIDTH) / 2;

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center h-[51px] px-6 mt-4">
        <button onClick={goBack} className="cursor-pointer bg-transparent border-none p-1">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">유사도 Top5 결과</h1>
        </div>
        <div className="w-[19px]" />
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* TOP X / N */}
        <div className="flex items-baseline justify-center mt-2 mb-4 gap-1">
          <span className="text-[20px] font-extrabold text-black">TOP </span>
          <span className="text-[32px] font-extrabold text-[#3B82F6]">{currentIndex + 1}</span>
          <span className="text-base font-medium text-black"> / {data.length}</span>
        </div>

        {/* 카드 캐러셀 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto pb-2"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            paddingLeft: SIDE_OFFSET,
            paddingRight: SIDE_OFFSET - 20,
            gap: 20,
          }}
        >
          {data.map((item, i) => {
            const pct = Math.round(item.similarity * 100);
            const date = item.occurredDate?.replace(/-/g, ".") ?? "";
            const isCenter = i === currentIndex;
            return (
              <div
                key={i}
                style={{
                  width: CARD_WIDTH,
                  flexShrink: 0,
                  scrollSnapAlign: "center",
                  transform: `scale(${isCenter ? 1 : 0.86})`,
                  opacity: isCenter ? 1 : 0.65,
                  transition: "transform 0.2s, opacity 0.2s",
                }}
              >
                <div className="bg-white rounded-[10px] shadow-sm mb-2.5">
                  <div className="m-1 rounded-[10px] overflow-hidden relative" style={{ height: 255 }}>
                    <CategoryImage imageUrl={item.imageUrl} majorCategory={item.category} width={CARD_WIDTH - 8} height={255} borderRadius={10} />
                    <div className="absolute top-2 left-2"><RankBadge rank={item.rank} /></div>
                    <div className="absolute top-0 right-0"><SimilarityBadge percentage={pct} /></div>
                  </div>
                  <div className="px-4 pt-2.5 pb-3">
                    <p className="text-base font-semibold leading-[22px] text-black mb-2.5">{item.title}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <svg width="9" height="11" viewBox="0 0 9 11" fill="none" className="shrink-0">
                        <path d="M8.5 4.5C8.5 6.9965 5.7305 9.5965 4.5 10.5C3.2695 9.5965 0.5 6.9965 0.5 4.5C0.5 2.01 2.237 0.5 4.5 0.5C6.763 0.5 8.5 2.01 8.5 4.5Z" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="4.5" cy="4.5" r="1.5" stroke="#1E3A5F" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-semibold text-[#434343] mr-1.5">습득 장소</span>
                      <span className="text-[10px] text-black flex-1 truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="10" height="11" viewBox="0 0 10 11" fill="none" className="shrink-0">
                        <path d="M3 0.5V2.5M7 0.5V2.5M8.5 1.5H1.5C0.948 1.5 0.5 1.948 0.5 2.5V9.5C0.5 10.052 0.948 10.5 1.5 10.5H8.5C9.052 10.5 9.5 10.052 9.5 9.5V2.5C9.5 1.948 9.052 1.5 8.5 1.5ZM0.5 4.5H9.5" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs font-semibold text-[#434343] mr-1.5">습득 시간</span>
                      <span className="text-[10px] text-black">{date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지 도트 */}
        <div className="flex justify-center items-center gap-3 mt-4 mb-4">
          {data.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i === currentIndex ? "#1E3A5F" : "#D6D6D6" }} />
          ))}
        </div>

        {/* AI 선정이유 */}
        <div className="mx-6 bg-white rounded-[10px] p-3 shadow-sm">
          <p className="text-xs font-bold text-black mb-2.5">AI 선정이유</p>
          <div className="bg-app-gray-light border border-app-border rounded-[10px] min-h-[178px] p-2">
            <p className="text-xs text-black leading-4">{currentItem?.explanation ?? ""}</p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg flex px-[37px] pt-3 pb-6 gap-3 z-10">
        <button
          onClick={() => router.push("/chat")}
          className="flex-1 h-[46px] rounded-[10px] border border-navy bg-white flex items-center justify-center gap-1.5 text-sm font-semibold text-navy cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1.79 12.47C1.91 12.77 1.94 13.1 1.87 13.41L1.02 16.04C0.96 16.29 1.07 16.56 1.25 16.78C1.35 16.88 1.47 16.94 1.6 16.98C1.74 17.01 1.87 17.01 2.01 16.97L4.74 16.17C5.03 16.12 5.33 16.14 5.61 16.25C7.32 17.05 9.26 17.22 11.08 16.73C12.9 16.24 14.49 15.12 15.57 13.57C16.64 12.02 17.14 10.14 16.97 8.27C16.79 6.39 15.96 4.63 14.62 3.31C13.28 1.98 11.51 1.17 9.64 1.03C7.76 0.88 5.88 1.39 4.35 2.49C2.82 3.59 1.72 5.19 1.25 7.02C0.78 8.84 0.97 10.77 1.79 12.47Z" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          채팅하기
        </button>
        <button
          onClick={() => currentItem && router.push(`/detail/${currentItem.registrationId}?type=found`)}
          className="flex-1 h-[46px] rounded-[10px] bg-navy flex items-center justify-center gap-1.5 text-sm font-semibold text-white cursor-pointer border-none"
        >
          <svg width="11" height="13" viewBox="0 0 13 15" fill="none">
            <path d="M3.3 0.5V3.3M6.1 0.5V3.3M8.9 0.5V3.3M10.3 1.9H1.9C1.13 1.9 0.5 2.53 0.5 3.3V13.1C0.5 13.87 1.13 14.5 1.9 14.5H10.3C11.07 14.5 11.7 13.87 11.7 13.1V3.3C11.7 2.53 11.07 1.9 10.3 1.9ZM3.3 6.1H7.5M3.3 8.9H8.9M3.3 11.7H6.8" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          상세보기
        </button>
      </div>
    </div>
  );
}

export default function Top5Page() {
  return <Suspense><Top5Content /></Suspense>;
}
