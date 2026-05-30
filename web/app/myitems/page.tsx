"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { RegistrationItem } from "@/types/registration";

type FilterKey = "전체" | "매칭중" | "매칭완료";

function toStatus(item: RegistrationItem) {
  return item.matched ? "매칭완료" : "매칭중";
}

function ItemCard({ item, onClick }: { item: RegistrationItem; onClick: () => void }) {
  const status = toStatus(item);
  const dotColor = status === "매칭완료" ? "#1E3A5F" : "#FF7A00";
  const date = (item.occurredDate ?? item.createdDate?.slice(0, 10))?.replace(/-/g, ". ");

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-[15px] shadow-[0_2px_6px_rgba(0,0,0,0.08)] cursor-pointer border-none text-left w-full"
    >
      <div className="mx-3 mt-3 rounded-[15px] overflow-hidden" style={{ height: 143 }}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" width={143} height={143} className="w-full h-full object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-app-gray-light" />
        )}
      </div>
      <div className="px-3 mt-2.5 pb-2.5">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          <span className="text-xs font-bold leading-4 tracking-[-0.32px]" style={{ color: dotColor }}>{status}</span>
        </div>
        <p className="text-sm font-semibold leading-[18px] text-black tracking-[-0.32px] truncate mb-0.5">{item.title}</p>
        <p className="text-xs font-semibold leading-4 text-app-gray tracking-[-0.32px] truncate mb-0.5">{item.location}</p>
        <p className="text-[10px] font-semibold leading-[14px] text-app-gray tracking-[-0.32px]">{date}</p>
      </div>
    </button>
  );
}

export default function MyItemsPage() {
  return (
    <Suspense>
      <MyItemsContent />
    </Suspense>
  );
}

function MyItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const type = searchParams.get("type") as "found" | "lost" | null;
  const isLost = type === "lost";

  const title = isLost ? "등록한 분실물" : "등록한 습득물";
  const ctaColor = isLost ? "#FF7A00" : "#1E3A5F";
  const ctaText = isLost ? "새 분실물 등록하기" : "새 습득물 등록하기";

  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<RegistrationItem[]>(`/api/registration/me?itemType=${isLost ? "LOST" : "FOUND"}`, token);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [token, isLost]);

  useEffect(() => {
    setLoading(true);
    fetchItems().finally(() => setLoading(false));
  }, [fetchItems]);

  const FILTERS: FilterKey[] = ["전체", "매칭중", "매칭완료"];
  const counts = {
    전체: items.length,
    매칭중: items.filter((i) => !i.matched).length,
    매칭완료: items.filter((i) => i.matched).length,
  };
  const filtered = activeFilter === "전체" ? items : items.filter((i) => toStatus(i) === activeFilter);

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 헤더 */}
      <div className="flex items-center px-6 pt-8 pb-0">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">{title}</h1>
        </div>
        <div className="w-[11px]" />
      </div>

      {/* 필터 탭 */}
      <div className="flex items-end gap-3.5 px-6 h-[50px] border-b border-app-gray-light bg-app-bg">
        {FILTERS.map((key) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="relative pb-2 bg-transparent border-none cursor-pointer"
            >
              <span className="text-sm font-bold tracking-[-0.32px]" style={{ color: isActive ? "#000" : "#757575" }}>
                {key} {counts[key]}
              </span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
            </button>
          );
        })}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center py-20">
          <p className="text-sm text-app-gray">등록한 게시물이 없습니다.</p>
        </div>
      ) : (
        <div className="px-5 pt-5 pb-32 grid grid-cols-2 gap-x-[19px] gap-y-5">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => router.push(`/detail/${item.id}?type=${item.itemType.toLowerCase()}`)}
            />
          ))}
        </div>
      )}

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg px-7 pt-3 pb-6 z-10">
        <button
          onClick={() => router.push("/register")}
          className="w-full h-[46px] rounded-[10px] flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer border-none"
          style={{ backgroundColor: ctaColor }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {ctaText}
        </button>
      </div>
    </div>
  );
}
