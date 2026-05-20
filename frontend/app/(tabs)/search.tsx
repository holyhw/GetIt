import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";

const capImage = require("../../assets/cap.jpg");

type FilterType = "습득물" | "분실물";
type Category = "전체" | "의류" | "전자기기" | "지갑/가방" | "귀중품" | "기타";

const CATEGORIES: Category[] = ["전체", "의류", "전자기기", "지갑/가방", "귀중품", "기타"];

const MOCK_ITEMS = [
  { id: 1, type: "found" as const, category: "의류", title: "Kodak 검은색 모자", desc: "강남역 4번 출구 근처에서 검은색 Kodak 모자를 습득했습니다.", location: "강남역 4번출구", date: "2026.04.22" },
  {
    id: 2,
    type: "lost" as const,
    category: "전자기기",
    title: "애플 에어팟 프로 2세대",
    desc: "지하철 2호선 강남역 안에서 흰색 에어팟 케이스를 분실했습니다.",
    location: "강남역 2호선",
    date: "2026.04.21",
  },
  {
    id: 3,
    type: "found" as const,
    category: "지갑/가방",
    title: "루이비통 갈색 장지갑",
    desc: "스타벅스 강남점 테이블에 놓여 있던 지갑을 습득했습니다.",
    location: "강남구 스타벅스",
    date: "2026.04.20",
  },
  {
    id: 4,
    type: "lost" as const,
    category: "전자기기",
    title: "갤럭시 버즈2 검정",
    desc: "버스 523번에서 내리면서 검은색 버즈 케이스를 두고 내렸습니다.",
    location: "강남역 버스정류장",
    date: "2026.04.19",
  },
  { id: 5, type: "found" as const, category: "귀중품", title: "실버 반지", desc: "헬스장 락커룸에서 은색 반지를 발견해 습득했습니다.", location: "강남구 헬스장", date: "2026.04.18" },
  { id: 6, type: "lost" as const, category: "의류", title: "노스페이스 검정 패딩", desc: "카페에서 잠깐 자리를 비운 사이 패딩이 사라졌습니다.", location: "신논현역 카페", date: "2026.04.17" },
];

type Item = (typeof MOCK_ITEMS)[0];

function SearchIcon({ color = "#919191" }: { color?: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Circle cx={7.5} cy={7.5} r={5.5} stroke={color} strokeWidth={1.6} />
      <Line x1={11.5} y1={11.5} x2={15.5} y2={15.5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function ItemCard({ item, onPress }: { item: Item; onPress?: () => void }) {
  const isLost = item.type === "lost";
  const typeColor = isLost ? "#FF7A00" : "#5F92D5";
  const typeLabel = isLost ? "분실물" : "습득물";

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
      <Image source={capImage} style={{ width: 100, height: 100, borderRadius: 14, flexShrink: 0 }} resizeMode="cover" />
      <View style={{ flex: 1, paddingLeft: 12, gap: 3 }}>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: typeColor + "1A",
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{typeLabel}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#000", letterSpacing: -0.32 }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#434343", lineHeight: 17, letterSpacing: -0.2 }} numberOfLines={2}>
          {item.desc}
        </Text>
        <Text style={{ fontSize: 11, color: "#919191", letterSpacing: -0.2 }} numberOfLines={1}>
          {item.location} · {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["모자", "에어팟", "지갑"]);
  const [typeFilter, setTypeFilter] = useState<FilterType>("습득물");
  const [category, setCategory] = useState<Category>("전체");

  const isSearched = submittedQuery.trim() !== "";
  const isLostMode = typeFilter === "분실물";
  const activeColor = isLostMode ? "#FF7A00" : "#1E3A5F";

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    setRecentSearches((prev) => [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 8));
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    setSubmittedQuery(term);
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
  };

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchType = isLostMode ? item.type === "lost" : item.type === "found";
    const matchCat = category === "전체" || item.category === category;
    const matchQuery = item.title.includes(submittedQuery) || item.desc.includes(submittedQuery);
    return matchType && matchCat && matchQuery;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* ── 검색 바 ── */}
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
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#D9D9D9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700", lineHeight: 18 }}>×</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── 검색 전: 최근 검색어 ── */}
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
            <View style={{ gap: 0 }}>
              {recentSearches.map((term) => (
                <View
                  key={term}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0F0F0",
                  }}
                >
                  <TouchableOpacity onPress={() => handleRecentTap(term)} style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <SearchIcon color="#ABABAB" />
                    <Text style={{ fontSize: 14, color: "#000", letterSpacing: -0.3 }}>{term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 16, color: "#ABABAB", lineHeight: 18 }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        /* ── 검색 후: 필터 + 결과 ── */
        <>
          {/* 습득물/분실물 토글 */}
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#E5E7EB",
                borderRadius: 10,
                padding: 2,
              }}
            >
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
              <Text style={{ fontWeight: "700", color: "#000" }}>"{submittedQuery}"</Text> 검색 결과 <Text style={{ fontWeight: "700", color: activeColor }}>{filtered.length}</Text>건
            </Text>
          </View>

          {/* 결과 리스트 */}
          {filtered.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14, color: "#ABABAB", letterSpacing: -0.3 }}>검색 결과가 없어요</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 10 }}
              renderItem={({ item }) => <ItemCard item={item} onPress={() => router.push(`/detail?type=${item.type}`)} />}
            />
          )}
        </>
      )}
    </View>
  );
}
