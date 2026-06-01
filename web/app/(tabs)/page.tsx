"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getDateFilterLabel, type DateFilter } from "@/lib/filters";
import type { FilterType, RegistrationItem, PagedResponse } from "@/types/registration";
import { CategoryImage } from "@/components/CategoryImage";
import { CategoryFilterModal, type CategoryFilterValue } from "@/components/CategoryFilterModal";
import { DateFilterModal } from "@/components/DateFilterModal";
import { BellIcon } from "@/components/icons";
import { useAuthStore } from "@/stores/authStore";
import { useNotifStore } from "@/stores/notifStore";

const PAGE_SIZE = 15;

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const isLoggedIn = !!token;
  const [filter, setFilter] = useState<FilterType>("습득물");
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const storeCount = useNotifStore((s) => s.unreadCount);
  const setStoreCount = useNotifStore((s) => s.setUnreadCount);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeColor = filter === "분실물" ? "#FF7A00" : "#1E3A5F";

  const fetchItems = useCallback(async (pageNum: number, append: boolean) => {
    const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
    if (categoryFilter) {
      params.set("majorCategory", categoryFilter.major);
      params.set("minorCategory", categoryFilter.minor);
    }
    if (dateFilter.start) params.set("startDate", dateFilter.start);
    if (dateFilter.end) params.set("endDate", dateFilter.end);
    const endpoint = filter === "습득물" ? "found" : "lost";
    try {
      const data = await api.get<PagedResponse<RegistrationItem>>(
        `/api/registration/${endpoint}/page?${params.toString()}`,
        token ?? ""
      );
      setItems((prev) => {
        const combined = append ? [...prev, ...data.content] : data.content;
        const seen = new Set<number>();
        return combined.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
      });
      setHasNext(data.hasNext);
      setPage(data.page);
    } catch {
      if (!append) setItems([]);
    }
  }, [filter, token, categoryFilter, dateFilter]);

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(0);
    setHasNext(false);
    fetchItems(0, false).finally(() => setLoading(false));
  }, [fetchItems]);

  useEffect(() => {
    if (!token) return;
    api.get<{ count: number }>("/api/notifications/unread-count", token)
      .then((d) => setStoreCount(d.count)).catch(() => {});
  }, [token]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
          setLoadingMore(true);
          fetchItems(page + 1, true).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loading, loadingMore, fetchItems, page]);

  const categoryLabel = categoryFilter
    ? `${categoryFilter.major} > ${categoryFilter.minor}`
    : "카테고리";
  const isCategoryActive = categoryFilter !== null;
  const isDateActive = !!(dateFilter.start || dateFilter.end);

  return (
    <div className="min-h-dvh bg-app-bg">
      <div className="md:max-w-[1200px] md:mx-auto">
      {/* 헤더 + 필터 바 (함께 sticky) */}
      <div className="sticky top-0 md:top-[72px] z-10 bg-app-bg">
        {/* 모바일 헤더 */}
        <header className="px-6 pt-8 pb-4 flex items-center md:hidden">
          <div className="flex items-center gap-1">
            <Image src="/logo-text.svg" alt="" width={31} height={30} />
            <Image src="/logo-icon.svg" alt="GET IT" width={93} height={16} />
          </div>
          <div className="flex-1" />
          <div className="flex bg-app-gray-light rounded-[10px] p-0.5 gap-0.5">
            {(["습득물", "분실물"] as FilterType[]).map((type) => (
              <button key={type} onClick={() => setFilter(type)}
                className="w-[61px] h-7 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer"
                style={{ backgroundColor: filter === type ? (type === "습득물" ? "#5F92D5" : "#FFB26B") : "transparent", color: filter === type ? "#fff" : "#000" }}>
                {type}
              </button>
            ))}
          </div>
          <button className="ml-3 relative cursor-pointer bg-transparent border-none p-0"
            onClick={() => router.push(isLoggedIn ? "/notification" : "/login")}>
            <BellIcon size={18} />
            {isLoggedIn && storeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F4551E] text-white text-[8px] font-bold rounded-md min-w-3 h-3 px-0.5 flex items-center justify-center leading-none">
                {storeCount > 99 ? "99+" : storeCount}
              </span>
            )}
          </button>
        </header>

        {/* 모바일 필터 바 / 데스크탑 통합 바 */}
        <div className="flex items-center gap-2 px-4 pb-2 md:pt-4 md:pb-3 md:border-b md:border-app-gray-light">
          {/* 데스크탑에서만 토글 표시 */}
          <div className="hidden md:flex bg-app-gray-light rounded-[10px] p-0.5 gap-0.5 mr-2">
            {(["습득물", "분실물"] as FilterType[]).map((type) => (
              <button key={type} onClick={() => setFilter(type)}
                className="w-[72px] h-8 rounded-[8px] text-sm font-semibold transition-colors cursor-pointer"
                style={{ backgroundColor: filter === type ? (type === "습득물" ? "#5F92D5" : "#FFB26B") : "transparent", color: filter === type ? "#fff" : "#000" }}>
                {type}
              </button>
            ))}
          </div>

          <div className="md:flex-1" />
          {[
            { label: categoryLabel, active: isCategoryActive, onClick: () => setShowCategoryModal(true) },
            { label: getDateFilterLabel(dateFilter), active: isDateActive, onClick: () => setShowDateModal(true) },
          ].map(({ label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-1 px-3 py-[7px] rounded-full border text-[13px] font-semibold cursor-pointer transition-colors"
              style={{
                borderColor: active ? activeColor : "#D9D9D9",
                backgroundColor: active ? activeColor + "15" : "#fff",
                color: active ? activeColor : "#434343",
              }}
            >
              {label}
              <span className="text-[9px]" style={{ color: active ? activeColor : "#919191" }}>▼</span>
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-app-gray">등록된 게시물이 없습니다.</p>
        </div>
      ) : (
        <div className="px-3 pt-5 pb-4 mt-1 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 md:px-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() =>
                router.push(
                  `/detail/${item.id}?type=${item.itemType.toLowerCase()}${item.matched ? "&matchStatus=complete" : ""}`
                )
              }
            />
          ))}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      )}

      </div> {/* md:max-w-[1200px] */}
      <CategoryFilterModal
        visible={showCategoryModal}
        value={categoryFilter}
        activeColor={activeColor}
        onSelect={setCategoryFilter}
        onClose={() => setShowCategoryModal(false)}
      />
      <DateFilterModal
        visible={showDateModal}
        value={dateFilter}
        activeColor={activeColor}
        onSelect={setDateFilter}
        onClose={() => setShowDateModal(false)}
      />
    </div>
  );
}

function ItemCard({ item, onClick }: { item: RegistrationItem; onClick: () => void }) {
  const isLost = item.itemType === "LOST";
  const typeColor = isLost ? "#FF7A00" : "#5F92D5";
  const typeLabel = isLost ? "분실물" : "습득물";
  const formattedDate = item.occurredDate
    ? item.occurredDate.replace(/-/g, ".")
    : item.createdDate?.slice(0, 10).replace(/-/g, ".");

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-[30px] h-[155px] flex items-center px-3 py-3 w-full text-left cursor-pointer active:opacity-90 transition-opacity shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
    >
      <CategoryImage
        imageUrl={item.imageUrl}
        majorCategory={item.majorCategory}
        width={131}
        height={131}
        borderRadius={30}
      />
      <div className="flex-1 self-stretch pl-3 flex flex-col justify-center gap-[3px] min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-[7px] py-[2px] rounded-[6px] shrink-0"
            style={{ backgroundColor: typeColor + "1A", color: typeColor }}
          >
            {typeLabel}
          </span>
          <span className="text-[11px] text-app-gray truncate">
            {`${item.majorCategory ?? ""} > ${item.minorCategory ?? ""}`}
          </span>
        </div>
        <p className="text-base font-semibold text-black truncate">{item.title}</p>
        {!!item.description && (
          <p className="text-xs text-black line-clamp-2 leading-[18px]">{item.description}</p>
        )}
        <p className="text-xs text-app-gray truncate">{item.location}</p>
        <p className="text-xs text-app-gray">{formattedDate}</p>
      </div>
    </button>
  );
}
