import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MyInfoBackIcon from "../assets/myinfo-back.svg";
import RegisterIcon from "../assets/myitems-register.svg";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const itemPlaceholder = require("../assets/cap.jpg");

type Status = "매칭완료" | "매칭중" | "종료";
type FilterKey = "전체" | "매칭중" | "매칭완료" | "종료";

const STATUS_CONFIG: Record<Status, { dot: string; text: string }> = {
  매칭완료: { dot: "#1E3A5F", text: "#1E3A5F" },
  매칭중:   { dot: "#FF7A00", text: "#FF7A00" },
  종료:     { dot: "#757575", text: "#757575" },
};

type RegistrationItem = {
  id: number;
  itemType: "LOST" | "FOUND";
  title: string;
  category: string;
  location: string;
  occurredDate: string;
  description: string;
  imageUrl: string | null;
  matched: boolean;
  createdDate: string;
};

function toStatus(item: RegistrationItem): Status {
  if (item.matched) return "매칭완료";
  return "매칭중";
}

function ItemCard({ item, onPress }: { item: RegistrationItem; onPress?: () => void }) {
  const status = toStatus(item);
  const { dot, text } = STATUS_CONFIG[status];
  const date = (item.occurredDate ?? item.createdDate?.slice(0, 10))?.replace(/-/g, ". ");

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{ width: 167, minHeight: 245, backgroundColor: "#fff", borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : itemPlaceholder}
        style={{ width: 143, height: 143, borderRadius: 15, alignSelf: "center", marginTop: 12 }}
        resizeMode="cover"
      />
      <View style={{ paddingHorizontal: 12, marginTop: 10, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
          <Text style={{ fontSize: 12, fontWeight: "700", lineHeight: 16, color: text, marginLeft: 4, letterSpacing: -0.32 }}>
            {status}
          </Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: "600", lineHeight: 18, color: "#000", letterSpacing: -0.32, marginBottom: 2 }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 16, color: "#919191", letterSpacing: -0.32, marginBottom: 2 }} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={{ fontSize: 10, fontWeight: "600", lineHeight: 14, color: "#919191", letterSpacing: -0.32 }}>
          {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyItemsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: "found" | "lost" }>();
  const { token } = useAuth();
  const isLost = type === "lost";

  const title    = isLost ? "등록한 분실물" : "등록한 습득물";
  const ctaColor = isLost ? "#FF7A00" : "#1E3A5F";
  const ctaText  = isLost ? "새 분실물 등록하기" : "새 습득물 등록하기";

  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    const itemType = isLost ? "LOST" : "FOUND";
    try {
      const data = await api.get<RegistrationItem[]>(`/api/registration/me?itemType=${itemType}`, token);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [token, isLost]);

  useEffect(() => {
    setLoading(true);
    fetchItems().finally(() => setLoading(false));
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, [fetchItems]);

  const filteredItems = activeFilter === "전체"
    ? items
    : items.filter((item) => toStatus(item) === activeFilter);

  const counts: Record<FilterKey, number> = {
    전체:   items.length,
    매칭중: items.filter((i) => toStatus(i) === "매칭중").length,
    매칭완료: items.filter((i) => toStatus(i) === "매칭완료").length,
    종료:   0,
  };

  const FILTERS: FilterKey[] = ["전체", "매칭중", "매칭완료", "종료"];

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 60, paddingBottom: 0 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MyInfoBackIcon width={11} height={19} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>{title}</Text>
        </View>
        <View style={{ width: 11 }} />
      </View>

      {/* 필터 탭 */}
      <View style={{ height: 50, flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 24, gap: 14, backgroundColor: "#F5F7FA", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        {FILTERS.map((key) => {
          const isActive = activeFilter === key;
          return (
            <TouchableOpacity key={key} onPress={() => setActiveFilter(key)} style={{ paddingBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: isActive ? "#000" : "#757575", letterSpacing: -0.32 }}>
                {key} {counts[key]}
              </Text>
              {isActive && <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#1E3A5F" }} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120, rowGap: 20 }}
          columnWrapperStyle={{ columnGap: 19 }}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => router.push(`/detail?id=${item.id}&type=${item.itemType.toLowerCase()}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 14, color: "#919191" }}>등록한 게시물이 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* 하단 CTA */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/register")}
          style={{ backgroundColor: ctaColor, height: 46, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <RegisterIcon width={20} height={20} />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: -0.32 }}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
