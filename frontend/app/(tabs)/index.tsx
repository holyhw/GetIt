import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const capImage = require("../../assets/cap.jpg");
import LogoCircle from "../../assets/logo-text.svg";
import LogoWordmark from "../../assets/logo-icon.svg";
import BellIcon from "../../assets/bell-icon.svg";

type FilterType = "습득물" | "분실물";

const MOCK_ITEMS = [
  {
    id: 1,
    type: "found" as const,
    category: "의류 > 모자",
    title: "Kodak 검은색 모자",
    desc: "지하철역 근처에서 검은색 Kodak 모자를 주웠습니다. 모자 앞면에 노란색 로고가 있는 것이 특징입니다",
    location: "강남역 4번출구",
    date: "2026.04.22",
  },
  {
    id: 2,
    type: "lost" as const,
    category: "의류 > 모자",
    title: "검은색 코닥 모자",
    desc: "지하철역 근처에서 검은색 Kodak 모자를 분실했습니다. 모자 앞면에 노란색 로고가 있는 것이 특징입니다",
    location: "강남역 4번출구",
    date: "2026.04.22",
  },
  {
    id: 3,
    type: "found" as const,
    category: "의류 > 모자",
    title: "검은색 코닥 모자",
    desc: "지하철역 근처에서 검은색 Kodak 모자를 주웠습니다. 모자 앞면에 노란색 로고가 있는 것이 특징입니다",
    location: "강남역 4번출구",
    date: "2026.04.22",
  },
  {
    id: 4,
    type: "lost" as const,
    category: "의류 > 모자",
    title: "검은색 코닥 모자",
    desc: "지하철역 근처에서 검은색 Kodak 모자를 분실했습니다. 모자 앞면에 노란색 로고가 있는 것이 특징입니다",
    location: "강남역 4번출구",
    date: "2026.04.22",
  },
];

type Item = (typeof MOCK_ITEMS)[0];

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [filter, setFilter] = useState<FilterType>("습득물");

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더: paddingHorizontal 24, logo at left:24, toggle at left:215, bell at ~left:355 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 76,
          paddingBottom: 16,
        }}
      >
        {/* 로고: 원형 아이콘 (31×30) + 4px gap + GET IT 텍스트 (93×16) = 128px */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <LogoCircle width={31} height={30} />
          <LogoWordmark width={93} height={16} />
        </View>

        {/* 중간 여백 (flex:1 → 63px) */}
        <View style={{ flex: 1 }} />

        {/* 토글: 128×32, 내부 패딩 2, 각 버튼 61×28 */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#E5E7EB",
            borderRadius: 8,
            padding: 2,
            gap: 2,
          }}
        >
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
              <Text
                style={{
                  color: filter === type ? "#fff" : "#000",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 알림 벨: marginLeft 12 */}
        <TouchableOpacity
          style={{ marginLeft: 12 }}
          onPress={() => isLoggedIn ? router.push("/notification") : router.push("/login")}
        >
          <BellIcon width={16} height={18} />
        </TouchableOpacity>
      </View>

      {/* 카드 리스트: paddingTop 32 → 첫 카드 y=140px */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 20,
          paddingBottom: 16,
          gap: 12,
        }}
      >
        {MOCK_ITEMS.filter((item) =>
          filter === "습득물" ? item.type === "found" : item.type === "lost"
        ).map((item, idx) => (
          <ItemCard
            key={item.id}
            item={item}
            onPress={() =>
              router.push(
                `/detail?type=${item.type}${idx <= 1 ? "&matchStatus=complete" : ""}`
              )
            }
          />
        ))}
      </ScrollView>
    </View>
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
        borderRadius: 30,
        height: 155,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      {/* 이미지: 131×131, borderRadius 30 */}
      <Image source={capImage} style={{ width: 131, height: 131, borderRadius: 30, flexShrink: 0 }} resizeMode="cover" />

      {/* 텍스트 영역: 이미지 우측 12px gap */}
      <View style={{ flex: 1, paddingLeft: 12, alignSelf: "stretch", justifyContent: "center", gap: 3 }}>
        {/* 타입 태그 + 카테고리 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              backgroundColor: typeColor + "1A",
              borderRadius: 6,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{typeLabel}</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#919191" }} numberOfLines={1}>{item.category}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#000", lineHeight: 18 }} numberOfLines={2}>
          {item.desc}
        </Text>
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={{ fontSize: 12, color: "#919191" }} numberOfLines={1}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
