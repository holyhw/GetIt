"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import TopHeader from "@/components/TopHeader";
import { CategoryFilterModal, type CategoryFilterValue } from "@/components/CategoryFilterModal";
import type { RegistrationItem, PagedResponse } from "@/types/registration";

const PAGE_SIZE = 100;

export default function DbPage() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (cat: CategoryFilterValue) => {
    const base = new URLSearchParams({ size: String(PAGE_SIZE) });
    if (cat) {
      base.set("majorCategory", cat.major);
      if (cat.minor) base.set("minorCategory", cat.minor);
    }

    const fetchEndpoint = async (endpoint: string) => {
      const all: RegistrationItem[] = [];
      let pageNum = 0;
      let hasNext = true;
      while (hasNext) {
        const params = new URLSearchParams(base);
        params.set("page", String(pageNum));
        const data = await api.get<PagedResponse<RegistrationItem>>(
          `/api/registration/${endpoint}/page?${params}`, ""
        );
        all.push(...data.content);
        hasNext = data.hasNext;
        pageNum++;
      }
      return all;
    };

    const [found, lost] = await Promise.all([fetchEndpoint("found"), fetchEndpoint("lost")]);
    return { items: [...found, ...lost], total: found.length + lost.length };
  }, []);

  useEffect(() => {
    setLoading(true);
    setItems([]);
    fetchAll(categoryFilter)
      .then(({ items: all, total }) => {
        const sorted = all.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        const seen = new Set<number>();
        setItems(sorted.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; }));
        setTotalCount(total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [categoryFilter, fetchAll]);

  const isCategoryActive = categoryFilter !== null;
  const categoryLabel = categoryFilter
    ? (categoryFilter.minor ? `${categoryFilter.major} > ${categoryFilter.minor}` : categoryFilter.major)
    : "카테고리";

  return (
    <div className="min-h-dvh bg-app-bg md:pt-[72px]">
      <TopHeader />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-black tracking-[-0.4px]">이미지 데이터베이스</h1>
            {!loading && (
              <span className="text-base font-bold text-navy tracking-[-0.3px]">
                총 {totalCount.toLocaleString()}개
              </span>
            )}
          </div>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1 px-3 py-[7px] rounded-full border text-[13px] font-semibold cursor-pointer transition-colors"
            style={{
              borderColor: isCategoryActive ? "#1E3A5F" : "#D9D9D9",
              backgroundColor: isCategoryActive ? "#1E3A5F15" : "#fff",
              color: isCategoryActive ? "#1E3A5F" : "#434343",
            }}
          >
            {categoryLabel}
            <span className="text-[9px]" style={{ color: isCategoryActive ? "#1E3A5F" : "#919191" }}>▼</span>
          </button>
        </div>

        {/* 그리드 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
            <p className="text-xs text-app-gray">전체 데이터 로딩 중...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-app-gray">데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-0.5">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => router.push(`/detail/${item.id}`)}
                className="aspect-square overflow-hidden bg-app-gray-light cursor-pointer relative group border-none p-0"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-150"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: item.itemType === "LOST" ? "#FFF4EA" : "#EEF3FB" }}
                  >
                    <span className="text-[8px] text-app-gray font-medium">{item.majorCategory ?? ""}</span>
                  </div>
                )}
                <div
                  className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full opacity-80"
                  style={{ backgroundColor: item.itemType === "LOST" ? "#FF7A00" : "#1E3A5F" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <CategoryFilterModal
        visible={showCategoryModal}
        value={categoryFilter}
        activeColor="#1E3A5F"
        allowMajorOnly
        onSelect={(val) => { setCategoryFilter(val); setShowCategoryModal(false); }}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
}
