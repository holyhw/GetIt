"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getDateFilterLabel, type DateFilter } from "@/lib/filters";
import type { FilterType, RegistrationItem, PagedResponse } from "@/types/registration";
import { CategoryImage } from "@/components/CategoryImage";
import { CategoryFilterModal, type CategoryFilterValue } from "@/components/CategoryFilterModal";
import { DateFilterModal } from "@/components/DateFilterModal";
import { useAuthStore } from "@/stores/authStore";

function SearchIcon({ color = "#ABABAB" }: { color?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className="shrink-0">
      <circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="1.6" />
      <line x1="11.5" y1="11.5" x2="15.5" y2="15.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ItemCard({ item, onClick }: { item: RegistrationItem; onClick: () => void }) {
  const isLost = item.itemType === "LOST";
  const typeColor = isLost ? "#FF7A00" : "#5F92D5";
  const typeLabel = isLost ? "분실물" : "습득물";
  const date = (item.occurredDate ?? item.createdDate?.slice(0, 10))?.replace(/-/g, ".");

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-[20px] flex items-center px-3 py-3 text-left cursor-pointer active:opacity-90 transition-opacity shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
    >
      <CategoryImage imageUrl={item.imageUrl} majorCategory={item.majorCategory} width={100} height={100} borderRadius={14} />
      <div className="flex-1 pl-3 flex flex-col gap-[3px] min-w-0">
        <span
          className="self-start text-[10px] font-bold px-[7px] py-[2px] rounded-[6px]"
          style={{ backgroundColor: typeColor + "1A", color: typeColor }}
        >
          {typeLabel}
        </span>
        <p className="text-[15px] font-bold text-black tracking-[-0.32px] truncate">{item.title}</p>
        {!!item.description && (
          <p className="text-xs text-[#434343] line-clamp-2 leading-[17px] tracking-[-0.2px]">{item.description}</p>
        )}
        <p className="text-[11px] text-app-gray tracking-[-0.2px] truncate">{item.location} · {date}</p>
      </div>
    </button>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const submittedQueryRef = useRef("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<FilterType>("습득물");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [results, setResults] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearched = submittedQuery.trim() !== "";
  const activeColor = typeFilter === "분실물" ? "#FF7A00" : "#1E3A5F";

  // localStorage에서 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveRecentSearches = (searches: string[]) => {
    setRecentSearches(searches);
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  };

  const doFetch = useCallback(async (
    keyword: string,
    type: FilterType,
    cat: CategoryFilterValue,
    date: DateFilter,
    pageNum: number,
    append: boolean,
  ) => {
    if (!keyword.trim()) return;
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        keyword,
        itemType: type === "분실물" ? "LOST" : "FOUND",
        page: String(pageNum),
        size: "15",
      });
      if (cat) { params.set("majorCategory", cat.major); params.set("minorCategory", cat.minor); }
      if (date.start) params.set("startDate", date.start);
      if (date.end) params.set("endDate", date.end);
      const data = await api.get<PagedResponse<RegistrationItem>>(
        `/api/registration/search/filter/page?${params.toString()}`,
        token ?? ""
      );
      setResults(prev => {
        const combined = append ? [...prev, ...data.content] : data.content;
        const seen = new Set<number>();
        return combined.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
      });
      setHasNext(data.hasNext);
      setPage(data.page);
      if (pageNum === 0) setTotal(data.totalElements);
    } catch {
      if (!append) setResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  // 타입 토글 변경 시 재검색
  useEffect(() => {
    if (!submittedQueryRef.current) return;
    setResults([]); setPage(0); setHasNext(false);
    doFetch(submittedQueryRef.current, typeFilter, categoryFilter, dateFilter, 0, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  // 무한 스크롤
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
        doFetch(submittedQueryRef.current, typeFilter, categoryFilter, dateFilter, page + 1, true);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loading, loadingMore, doFetch, typeFilter, categoryFilter, dateFilter, page]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    submittedQueryRef.current = trimmed;
    setSubmittedQuery(trimmed);
    saveRecentSearches([trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 8));
    setResults([]); setPage(0); setHasNext(false);
    doFetch(trimmed, typeFilter, categoryFilter, dateFilter, 0, false);
    inputRef.current?.blur();
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    submittedQueryRef.current = term;
    setSubmittedQuery(term);
    setResults([]); setPage(0); setHasNext(false);
    doFetch(term, typeFilter, categoryFilter, dateFilter, 0, false);
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
    submittedQueryRef.current = "";
    setResults([]);
    inputRef.current?.focus();
  };

  const categoryLabel = categoryFilter ? `${categoryFilter.major} > ${categoryFilter.minor}` : "카테고리";
  const isCategoryActive = categoryFilter !== null;
  const isDateActive = !!(dateFilter.start || dateFilter.end);

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 검색 바 (sticky) */}
      <div className="sticky top-0 z-10 bg-app-bg pt-8 px-5 pb-3">
        <div className="bg-white rounded-[14px] h-[46px] flex items-center px-3.5 gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.07)]">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="분실물 또는 습득물을 검색하세요"
            className="flex-1 text-sm text-black tracking-[-0.3px] outline-none bg-transparent placeholder:text-[#ABABAB]"
          />
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="w-[18px] h-[18px] rounded-full bg-app-border flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className="text-[11px] text-white font-bold leading-none">×</span>
            </button>
          )}
        </div>
      </div>

      {/* 검색 전: 최근 검색어 */}
      {!isSearched ? (
        <div className="px-5 mt-2">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-sm font-bold text-black tracking-[-0.3px]">최근 검색어</span>
            {recentSearches.length > 0 && (
              <button onClick={() => saveRecentSearches([])} className="text-xs text-app-gray tracking-[-0.2px] cursor-pointer">
                전체 삭제
              </button>
            )}
          </div>
          {recentSearches.length === 0 ? (
            <p className="text-[13px] text-[#ABABAB] tracking-[-0.2px]">최근 검색어가 없어요</p>
          ) : (
            <div>
              {recentSearches.map((term) => (
                <div key={term} className="flex items-center justify-between py-[13px] border-b border-[#F0F0F0]">
                  <button
                    onClick={() => handleRecentTap(term)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <SearchIcon color="#ABABAB" />
                    <span className="text-sm text-black tracking-[-0.3px] truncate">{term}</span>
                  </button>
                  <button
                    onClick={() => saveRecentSearches(recentSearches.filter(s => s !== term))}
                    className="text-base text-[#ABABAB] leading-[18px] ml-2 cursor-pointer shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* 타입 토글 */}
          <div className="px-5 mb-2.5">
            <div className="flex bg-app-gray-light rounded-[10px] p-0.5">
              {(["습득물", "분실물"] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="flex-1 h-8 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: typeFilter === t ? (t === "습득물" ? "#5F92D5" : "#FFB26B") : "transparent",
                    color: typeFilter === t ? "#fff" : "#757575",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 px-5 mb-2">
            {[
              { label: categoryLabel, active: isCategoryActive, onClick: () => setShowCategoryModal(true) },
              { label: getDateFilterLabel(dateFilter), active: isDateActive, onClick: () => setShowDateModal(true) },
            ].map(({ label, active, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-1 px-3 py-[7px] rounded-full border text-[13px] font-semibold cursor-pointer"
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

          {/* 결과 수 */}
          <div className="px-5 pt-2 pb-1.5">
            <p className="text-xs text-app-gray tracking-[-0.2px]">
              <span className="font-bold text-black">"{submittedQuery}"</span> 검색 결과{" "}
              <span className="font-bold" style={{ color: activeColor }}>{loading ? "-" : total}</span>건
            </p>
          </div>

          {/* 결과 리스트 */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex justify-center py-20">
              <p className="text-sm text-[#ABABAB] tracking-[-0.3px]">검색 결과가 없어요</p>
            </div>
          ) : (
            <div className="px-5 pb-24 flex flex-col gap-2.5">
              {results.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(`/detail/${item.id}?type=${item.itemType.toLowerCase()}`)}
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
        </div>
      )}

      <CategoryFilterModal
        visible={showCategoryModal}
        value={categoryFilter}
        activeColor={activeColor}
        onSelect={(val) => {
          setCategoryFilter(val);
          if (submittedQueryRef.current) {
            setResults([]); setPage(0); setHasNext(false);
            doFetch(submittedQueryRef.current, typeFilter, val, dateFilter, 0, false);
          }
        }}
        onClose={() => setShowCategoryModal(false)}
      />
      <DateFilterModal
        visible={showDateModal}
        value={dateFilter}
        activeColor={activeColor}
        onSelect={(val) => {
          setDateFilter(val);
          if (submittedQueryRef.current) {
            setResults([]); setPage(0); setHasNext(false);
            doFetch(submittedQueryRef.current, typeFilter, categoryFilter, val, 0, false);
          }
        }}
        onClose={() => setShowDateModal(false)}
      />
    </div>
  );
}
