import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from "react-native";
import { CategoryImage } from "../../components/CategoryImage";
import { useRouter } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import { CategoryFilterModal, type CategoryFilterValue } from "../../components/CategoryFilterModal";
import { DateFilterModal } from "../../components/DateFilterModal";
import type { DateFilter } from "../../utils/filters";
import { getDateFilterLabel } from "../../utils/filters";
import type { FilterType, RegistrationItem, PagedResponse } from "../../types/registration";
import { api } from "../../utils/api";

function SearchIcon({ color = "#919191" }: { color?: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Circle cx={7.5} cy={7.5} r={5.5} stroke={color} strokeWidth={1.6} />
      <Line x1={11.5} y1={11.5} x2={15.5} y2={15.5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function ItemCard({ item, onPress }: { item: RegistrationItem; onPress?: () => void }) {
  const isLost = item.itemType === "LOST";
  const typeColor = isLost ? "#FF7A00" : "#5F92D5";
  const typeLabel = isLost ? "분실물" : "습득물";
  const date = (item.occurredDate ?? item.createdDate?.slice(0, 10))?.replace(/-/g, ".");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <CategoryImage imageUrl={item.imageUrl} majorCategory={item.majorCategory} width={100} height={100} borderRadius={14} />
      <View style={{ flex: 1, paddingLeft: 12, gap: 3 }}>
        <View style={{ alignSelf: "flex-start", backgroundColor: typeColor + "1A", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{typeLabel}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#000", letterSpacing: -0.32 }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#434343", lineHeight: 17, letterSpacing: -0.2 }} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={{ fontSize: 11, color: "#919191", letterSpacing: -0.2 }} numberOfLines={1}>
          {item.location} · {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { token } = useAuth();

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

  const isSearched = submittedQuery.trim() !== "";
  const isLostMode = typeFilter === "분실물";
  const activeColor = isLostMode ? "#FF7A00" : "#1E3A5F";

  // 모든 params를 명시적으로 받아서 stale closure 없음
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
      if (cat) {
        params.set("majorCategory", cat.major);
        params.set("minorCategory", cat.minor);
      }
      if (date.start) params.set("startDate", date.start);
      if (date.end) params.set("endDate", date.end);
      const data = await api.get<PagedResponse<RegistrationItem>>(
        `/api/registration/search/filter/page?${params.toString()}`,
        token ?? ""
      );
      setResults(prev => append ? [...prev, ...data.content] : data.content);
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

  // typeFilter 변경 시 재검색
  useEffect(() => {
    if (!submittedQueryRef.current) return;
    setResults([]);
    setPage(0);
    setHasNext(false);
    doFetch(submittedQueryRef.current, typeFilter, categoryFilter, dateFilter, 0, false);
  }, [typeFilter]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    submittedQueryRef.current = trimmed;
    setSubmittedQuery(trimmed);
    setRecentSearches((prev) => [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 8));
    setResults([]);
    setPage(0);
    setHasNext(false);
    doFetch(trimmed, typeFilter, categoryFilter, dateFilter, 0, false);
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    submittedQueryRef.current = term;
    setSubmittedQuery(term);
    setResults([]);
    setPage(0);
    setHasNext(false);
    doFetch(term, typeFilter, categoryFilter, dateFilter, 0, false);
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
    submittedQueryRef.current = "";
    setResults([]);
  };

  const onEndReached = useCallback(() => {
    if (!hasNext || loadingMore || loading) return;
    doFetch(submittedQueryRef.current, typeFilter, categoryFilter, dateFilter, page + 1, true);
  }, [hasNext, loadingMore, loading, doFetch, typeFilter, categoryFilter, dateFilter, page]);

  const categoryLabel = categoryFilter ? `${categoryFilter.major} > ${categoryFilter.minor}` : "카테고리";
  const isCategoryActive = categoryFilter !== null;
  const isDateActive = !!(dateFilter.start || dateFilter.end);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 검색 바 */}
      <View style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: "#F5F7FA" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 46,
            gap: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="분실물 또는 습득물을 검색하세요"
            placeholderTextColor="#ABABAB"
            returnKeyType="search"
            style={{ flex: 1, fontSize: 14, color: "#000", letterSpacing: -0.3 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700", lineHeight: 18 }}>×</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 검색 전: 최근 검색어 */}
      {!isSearched ? (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#000", letterSpacing: -0.3 }}>최근 검색어</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.2 }}>전체 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#ABABAB", letterSpacing: -0.2 }}>최근 검색어가 없어요</Text>
          ) : (
            <View>
              {recentSearches.map((term) => (
                <View key={term} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>
                  <TouchableOpacity onPress={() => handleRecentTap(term)} style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <SearchIcon color="#ABABAB" />
                    <Text style={{ fontSize: 14, color: "#000", letterSpacing: -0.3 }}>{term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setRecentSearches((prev) => prev.filter((s) => s !== term))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 16, color: "#ABABAB", lineHeight: 18 }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* 타입 토글 */}
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 10, padding: 2 }}>
              {(["습득물", "분실물"] as FilterType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTypeFilter(t)}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: typeFilter === t ? (t === "습득물" ? "#5F92D5" : "#FFB26B") : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: typeFilter === t ? "#fff" : "#757575" }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 필터 버튼 */}
          <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                paddingHorizontal: 12, paddingVertical: 7,
                borderRadius: 20, borderWidth: 1,
                borderColor: isCategoryActive ? activeColor : "#D9D9D9",
                backgroundColor: isCategoryActive ? activeColor + "15" : "#fff",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: isCategoryActive ? activeColor : "#434343" }}>
                {categoryLabel}
              </Text>
              <Text style={{ fontSize: 9, color: isCategoryActive ? activeColor : "#919191" }}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDateModal(true)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                paddingHorizontal: 12, paddingVertical: 7,
                borderRadius: 20, borderWidth: 1,
                borderColor: isDateActive ? activeColor : "#D9D9D9",
                backgroundColor: isDateActive ? activeColor + "15" : "#fff",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: isDateActive ? activeColor : "#434343" }}>
                {getDateFilterLabel(dateFilter)}
              </Text>
              <Text style={{ fontSize: 9, color: isDateActive ? activeColor : "#919191" }}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* 결과 수 */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 }}>
            <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.2 }}>
              <Text style={{ fontWeight: "700", color: "#000" }}>"{submittedQuery}"</Text> 검색 결과 <Text style={{ fontWeight: "700", color: activeColor }}>{loading ? "-" : total}</Text>건
            </Text>
          </View>

          {/* 결과 리스트 */}
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#1E3A5F" />
            </View>
          ) : results.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14, color: "#ABABAB", letterSpacing: -0.3 }}>검색 결과가 없어요</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 10 }}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                loadingMore ? (
                  <View style={{ paddingVertical: 16, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#1E3A5F" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => <ItemCard item={item} onPress={() => router.push(`/detail?id=${item.id}&type=${item.itemType.toLowerCase()}`)} />}
            />
          )}
        </View>
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
    </View>
    </TouchableWithoutFeedback>
  );
}
