import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import LogoCircle from "../../assets/logo-text.svg";
import LogoWordmark from "../../assets/logo-icon.svg";
import BellIcon from "../../assets/bell-icon.svg";

type FilterType = "습득물" | "분실물";

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

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();
  const [filter, setFilter] = useState<FilterType>("습득물");
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!token) { setItems([]); return; }
    const path = filter === "습득물" ? "/api/registration/found" : "/api/registration/lost";
    try {
      const data = await api.get<RegistrationItem[]>(path, token);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [filter, token]);

  useEffect(() => {
    setLoading(true);
    fetchItems().finally(() => setLoading(false));
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, [fetchItems]);

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
          <BellIcon width={16} height={18} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 20, paddingBottom: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {items.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 14, color: "#919191" }}>등록된 게시물이 없습니다.</Text>
            </View>
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/detail?id=${item.id}&type=${item.itemType.toLowerCase()}${item.matched ? "&matchStatus=complete" : ""}`)}
              />
            ))
          )}
        </ScrollView>
      )}
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
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/cap.jpg")}
        style={{ width: 131, height: 131, borderRadius: 30, flexShrink: 0 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, paddingLeft: 12, alignSelf: "stretch", justifyContent: "center", gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ backgroundColor: typeColor + "1A", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{typeLabel}</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#919191" }} numberOfLines={1}>{item.category}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }} numberOfLines={1}>{item.title}</Text>
        <Text style={{ fontSize: 12, color: "#000", lineHeight: 18 }} numberOfLines={2}>{item.description}</Text>
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>{item.location}</Text>
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
}
