import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import MyInfoBackIcon from "../assets/myinfo-back.svg";
import RegisterIcon from "../assets/myitems-register.svg";

const capImage = require("../assets/cap.jpg");
const airpodsImage = require("../assets/item-airpods.jpg");
const sunglassesImage = require("../assets/item-sunglasses.jpg");
const walletImage = require("../assets/item-wallet.jpg");

type Status = "매칭완료" | "매칭중" | "종료";

const STATUS_CONFIG: Record<Status, { dot: string; text: string }> = {
  매칭완료: { dot: "#1E3A5F", text: "#1E3A5F" },
  매칭중:   { dot: "#FF7A00", text: "#FF7A00" },
  종료:     { dot: "#757575", text: "#757575" },
};

const ALL_ITEMS = [
  { id: 1, status: "매칭완료" as Status, title: "Kodak 검은색 모자",  location: "강남역 4번 출구", date: "2026. 05. 18", image: capImage },
  { id: 2, status: "매칭중"   as Status, title: "검은색 선글라스",    location: "강남역 4번 출구", date: "2026. 05. 18", image: sunglassesImage },
  { id: 3, status: "종료"     as Status, title: "하얀색 에어팟",      location: "강남역 4번 출구", date: "2026. 05. 18", image: airpodsImage },
  { id: 4, status: "종료"     as Status, title: "루이비똥 장지갑",    location: "강남역 4번 출구", date: "2026. 05. 18", image: walletImage },
];

type FilterKey = "전체" | "매칭중" | "매칭완료" | "종료";

const FILTERS: { key: FilterKey; count: number }[] = [
  { key: "전체",   count: 4 },
  { key: "매칭중", count: 1 },
  { key: "매칭완료", count: 1 },
  { key: "종료",   count: 2 },
];

type Item = (typeof ALL_ITEMS)[0];

function ItemCard({ item, onPress }: { item: Item; onPress?: () => void }) {
  const { dot, text } = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        width: 167,
        minHeight: 245,
        backgroundColor: "#fff",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* 아이템 이미지: 143×143, borderRadius=15, marginTop=12, centered */}
      <Image
        source={item.image}
        style={{
          width: 143,
          height: 143,
          borderRadius: 15,
          alignSelf: "center",
          marginTop: 12,
        }}
        resizeMode="cover"
      />

      {/* 텍스트 영역 */}
      <View style={{ paddingHorizontal: 12, marginTop: 10, paddingBottom: 10 }}>
        {/* 상태 행: dot 8×8 + 상태 텍스트 */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
        >
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 16,
              color: text,
              marginLeft: 4,
              letterSpacing: -0.32,
            }}
          >
            {item.status}
          </Text>
        </View>

        {/* 제목: 14px SemiBold */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 18,
            color: "#000",
            letterSpacing: -0.32,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        {/* 장소: 12px SemiBold, #919191 */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
            color: "#919191",
            letterSpacing: -0.32,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {item.location}
        </Text>

        {/* 날짜: 10px SemiBold, #919191 */}
        <Text
          style={{ fontSize: 10, fontWeight: "600", lineHeight: 14, color: "#919191", letterSpacing: -0.32 }}
        >
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyItemsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: "found" | "lost" }>();
  const isLost = type === "lost";

  // 습득물: navy 제목/버튼, 분실물: orange 버튼
  const title    = isLost ? "등록한 분실물" : "등록한 습득물";
  const ctaColor = isLost ? "#FF7A00"     : "#1E3A5F";
  const ctaText  = isLost ? "새 분실물 등록하기" : "새 습득물 등록하기";

  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");

  const filteredItems =
    activeFilter === "전체"
      ? ALL_ITEMS
      : ALL_ITEMS.filter((item) => item.status === activeFilter);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더: 뒤로가기 | 등록한 습득물 | 공백 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 0,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MyInfoBackIcon width={11} height={19} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}
          >
            {title}
          </Text>
        </View>
        {/* 헤더 오른쪽 공백 (back 버튼과 대칭) */}
        <View style={{ width: 11 }} />
      </View>

      {/* 필터 탭 바 */}
      {/* Figma: h=50, bg=#F5F7FA, borderBottom 1px #E5E7EB */}
      {/* 탭 centers: 전체 x=44, 매칭중 x=100.5, 매칭완료 x=167.5, 종료 x=230 */}
      <View
        style={{
          height: 50,
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 24,
          gap: 14,
          backgroundColor: "#F5F7FA",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{ paddingBottom: 8 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isActive ? "#000" : "#757575",
                  letterSpacing: -0.32,
                }}
              >
                {f.key} {f.count}
              </Text>
              {/* 활성 탭 언더라인: 2px navy */}
              {isActive && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: "#1E3A5F",
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2컬럼 아이템 그리드 */}
      {/* Figma: left=20, col_width=167, col_gap=19, row_gap=20 */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
          rowGap: 20,
        }}
        columnWrapperStyle={{ columnGap: 19 }}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push(`/detail?type=${isLost ? "lost" : "found"}`)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 CTA: 새 습득물 등록하기 */}
      {/* Figma: w=337, h=46, bg=#1E3A5F, borderRadius=10, y=784 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#F5F7FA",
          paddingHorizontal: 28,
          paddingTop: 12,
          paddingBottom: 22,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/register")}
          style={{
            backgroundColor: ctaColor,
            height: 46,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <RegisterIcon width={20} height={20} />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "600",
              letterSpacing: -0.32,
            }}
          >
            {ctaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
