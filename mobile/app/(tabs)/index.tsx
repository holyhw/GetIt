import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { CategoryImage } from "../../components/CategoryImage";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import type { FilterType, RegistrationItem, PagedResponse } from "../../types/registration";
import LogoCircle from "../../assets/logo-text.svg";
import LogoWordmark from "../../assets/logo-icon.svg";
import BellIcon from "../../assets/bell-icon.svg";
import { CategoryFilterModal, type CategoryFilterValue } from "../../components/CategoryFilterModal";
import { DateFilterModal } from "../../components/DateFilterModal";
import type { DateFilter } from "../../utils/filters";
import { getDateFilterLabel } from "../../utils/filters";
import { fetchGroupedUnreadCount } from "../../utils/fetchUnreadCount";

const PAGE_SIZE = 15;

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();
  const [filter, setFilter] = useState<FilterType>("습득물");
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const fetchItems = useCallback(async (pageNum: number, append: boolean) => {
    const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
    if (categoryFilter) {
      params.set("majorCategory", categoryFilter.major);
      params.set("minorCategory", categoryFilter.minor);
    }
    if (dateFilter.start) params.set("startDate", dateFilter.start);
    if (dateFilter.end) params.set("endDate", dateFilter.end);
    const endpoint = filter === "습득물" ? "found" : "lost";
    const path = `/api/registration/${endpoint}/page?${params.toString()}`;
    try {
      const data = await api.get<PagedResponse<RegistrationItem>>(path, token ?? "");
      setItems(prev => {
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems(0, false);
    setRefreshing(false);
  }, [fetchItems]);

  const onEndReached = useCallback(() => {
    if (!hasNext || loadingMore || loading) return;
    setLoadingMore(true);
    fetchItems(page + 1, true).finally(() => setLoadingMore(false));
  }, [hasNext, loadingMore, loading, fetchItems, page]);

  useEffect(() => {
    if (!token) return;
    fetchGroupedUnreadCount(token).then((count) => setUnreadCount(count));
  }, [token]);

  const activeColor = filter === "분실물" ? "#FF7A00" : "#1E3A5F";
  const categoryLabel = categoryFilter ? `${categoryFilter.major} > ${categoryFilter.minor}` : "카테고리";
  const isCategoryActive = categoryFilter !== null;
  const isDateActive = !!(dateFilter.start || dateFilter.end);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 76, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <LogoCircle width={31} height={30} />
          <LogoWordmark width={93} height={16} />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 8, padding: 2, gap: 2 }}>
          {(["습득물", "분실물"] as FilterType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={{
                backgroundColor: filter === type
                  ? type === "습득물" ? "#5F92D5" : "#FFB26B"
                  : "transparent",
                borderRadius: 6,
                width: 61,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: filter === type ? "#fff" : "#000", fontSize: 12, fontWeight: "600" }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={{ marginLeft: 12 }}
          onPress={() => isLoggedIn ? router.push("/notification") : router.push("/login")}
        >
          <View>
            <BellIcon width={16} height={18} />
            {isLoggedIn && unreadCount > 0 && (
              <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#F4551E", borderRadius: 6, minWidth: 12, height: 12, paddingHorizontal: 2, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 8, fontWeight: "700", color: "#fff" }}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* 필터 버튼 */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 4 }}>
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

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 20, paddingBottom: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 14, color: "#919191" }}>등록된 게시물이 없습니다.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#1E3A5F" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => router.push(`/detail?id=${item.id}&type=${item.itemType.toLowerCase()}${item.matched ? "&matchStatus=complete" : ""}`)}
            />
          )}
        />
      )}
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
    </View>
  );
}

function ItemCard({ item, onPress }: { item: RegistrationItem; onPress?: () => void }) {
  const isLost = item.itemType === "LOST";
  const typeColor = isLost ? "#FF7A00" : "#5F92D5";
  const typeLabel = isLost ? "분실물" : "습득물";

  const formattedDate = item.occurredDate
    ? item.occurredDate.replace(/-/g, ".")
    : item.createdDate?.slice(0, 10).replace(/-/g, ".");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 30,
        height: 155,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      <CategoryImage
        imageUrl={item.imageUrl}
        majorCategory={item.majorCategory}
        width={131}
        height={131}
        borderRadius={30}
      />
      <View style={{ flex: 1, paddingLeft: 12, alignSelf: "stretch", justifyContent: "center", gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ backgroundColor: typeColor + "1A", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{typeLabel}</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#919191" }} numberOfLines={1}>{`${item.majorCategory ?? "null"} > ${item.minorCategory ?? "null"}`}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }} numberOfLines={1}>{item.title}</Text>
        {!!item.description && <Text style={{ fontSize: 12, color: "#000", lineHeight: 18 }} numberOfLines={2}>{item.description}</Text>}
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>{item.location}</Text>
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
}
