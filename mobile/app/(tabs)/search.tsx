import { useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

type FilterType = "습득물" | "분실물";
type Category = "전체" | "의류" | "전자기기" | "지갑/가방" | "귀중품" | "기타";

const CATEGORIES: Category[] = ["전체", "의류", "전자기기", "지갑/가방", "귀중품", "기타"];

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
      <Image source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/cap.jpg")} style={{ width: 100, height: 100, borderRadius: 14, flexShrink: 0 }} resizeMode="cover" />
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<FilterType>("습득물");
  const [category, setCategory] = useState<Category>("전체");
  const [results, setResults] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isSearched = submittedQuery.trim() !== "";
  const isLostMode = typeFilter === "분실물";
  const activeColor = isLostMode ? "#FF7A00" : "#1E3A5F";

  const fetchResults = useCallback(
    async (keyword: string) => {
      if (!token || !keyword.trim()) return;
      setLoading(true);
      try {
        const data = await api.get<RegistrationItem[]>(`/api/registration/search?keyword=${encodeURIComponent(keyword)}`, token);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    setRecentSearches((prev) => [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 8));
    fetchResults(trimmed);
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    setSubmittedQuery(term);
    fetchResults(term);
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
    setResults([]);
  };

  const filtered = results.filter((item) => {
    const matchType = isLostMode ? item.itemType === "LOST" : item.itemType === "FOUND";
    const matchCat = category === "전체" || item.category?.includes(category);
    return matchType && matchCat;
  });

  return (
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

          {/* 카테고리 칩 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    height: 32,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? activeColor : "#fff",
                    borderWidth: 1,
                    borderColor: isActive ? activeColor : "#E5E7EB",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: isActive ? "#fff" : "#757575", letterSpacing: -0.2 }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 결과 수 */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 }}>
            <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.2 }}>
              <Text style={{ fontWeight: "700", color: "#000" }}>"{submittedQuery}"</Text> 검색 결과 <Text style={{ fontWeight: "700", color: activeColor }}>{loading ? "-" : filtered.length}</Text>건
            </Text>
          </View>

          {/* 결과 리스트 */}
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#1E3A5F" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14, color: "#ABABAB", letterSpacing: -0.3 }}>검색 결과가 없어요</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 10 }}
              renderItem={({ item }) => <ItemCard item={item} onPress={() => router.push(`/detail?id=${item.id}&type=${item.itemType.toLowerCase()}`)} />}
            />
          )}
        </View>
      )}
    </View>
  );
}
