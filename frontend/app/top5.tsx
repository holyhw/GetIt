import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, Animated, ScrollView, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import BackIcon from "../assets/myinfo-back.svg";
import Top5ChatIcon from "../assets/top5-chat.svg";
import Top5DetailIcon from "../assets/top5-detail.svg";
import RankBg from "../assets/top5-rank.svg";
import PinIcon from "../assets/reg-pin.svg";
import CalendarIcon from "../assets/reg-calendar.svg";

const capImage = require("../assets/cap.jpg");

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = 273;
const CARD_SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING;
// 첫 카드가 중앙에 오도록 좌우 여백
const SIDE_OFFSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const MOCK_DATA = [
  { rank: 1, similarity: 92, title: "Kodak 검은색 모자", location: "강남역 신분당선 4번출구", date: "2026.04.22" },
  { rank: 2, similarity: 87, title: "Kodak 검은색 모자", location: "강남역 신분당선 4번출구", date: "2026.04.22" },
  { rank: 3, similarity: 78, title: "검은색 모자", location: "강남역 신분당선 4번출구", date: "2026.04.20" },
  { rank: 4, similarity: 65, title: "모자 (검정)", location: "강남역 4번출구", date: "2026.04.19" },
  { rank: 5, similarity: 52, title: "검은 볼캡", location: "강남역 2번출구", date: "2026.04.18" },
];

const AI_REASON = `입력된 분실물의 이미지와 텍스트 설명을 기반으로, 후보 이미지 및 설명과의 복합 유사도를 분석했습니다. 이미지 측면에서는 검은색 모자 바탕 위에 전면 중앙에 위치한 노란색 패치와, 그 위에 빨간색으로 표기된 "Kodak" 로고의 색상 대비 및 배치 구조가 높은 수준으로 일치했습니다. 또한 캡 형태의 기본 실루엣과 챙의 곡률, 전체 비율 등 형태적 특징 역시 유사한 패턴을 보였습니다. 텍스트 설명 비교에서는 "검은색 모자", "전면 노란색 패치", "빨간색 Kodak 로고"와 같은 핵심 키워드가 후보 정보와 직접적으로 대응되며, 색상·브랜드·위치 정보가 모두 일관되게 매칭되었습니다.`;

// ── 유사도 원형 프로그레스 배지 ──────────────────────────
function SimilarityBadge({ percentage }: { percentage: number }) {
  const SIZE = 65;
  const STROKE = 5;
  const RADIUS = (SIZE - STROKE) / 2; // 30
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~188.5
  const strokeDashoffset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      {/* 흰 배경 원 */}
      <View
        style={{
          position: "absolute",
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: "rgba(255,255,255,0.85)",
        }}
      />
      {/* SVG 프로그레스 링 */}
      <Svg width={SIZE} height={SIZE} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        {/* 트랙 */}
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#E5E7EB" strokeWidth={STROKE} fill="none" />
        {/* 진행 호 */}
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#3B82F6" strokeWidth={STROKE} fill="none" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </Svg>
      {/* 텍스트 */}
      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>{percentage}</Text>
          <Text style={{ fontSize: 10, fontWeight: "600", color: "#000" }}>%</Text>
        </View>
        <Text style={{ fontSize: 9, fontWeight: "500", color: "#000" }}>유사도</Text>
      </View>
    </View>
  );
}

// ── 순위 배지 ────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  return (
    <View style={{ opacity: 0.75 }}>
      <RankBg width={43} height={24} style={{ position: "absolute" }} />
      <View
        style={{
          width: 43,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#fff" }}>{rank}위</Text>
      </View>
    </View>
  );
}

// ── 카드 아이템 ──────────────────────────────────────────
type CardProps = {
  item: (typeof MOCK_DATA)[0];
  index: number;
  scrollX: Animated.Value;
};

function CardItem({ item, index, scrollX }: CardProps) {
  const inputRange = [(index - 1) * ITEM_SIZE, index * ITEM_SIZE, (index + 1) * ITEM_SIZE];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.86, 1, 0.86],
    extrapolate: "clamp",
  });
  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: ["18deg", "0deg", "-18deg"],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.65, 1, 0.65],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        width: CARD_WIDTH,
        marginRight: CARD_SPACING,
        transform: [{ scale }, { perspective: 1000 }, { rotateY }],
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: -2, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
          marginBottom: 10,
        }}
      >
        {/* 이미지 영역: 265×255, borderRadius=10, 4px 안쪽 여백 */}
        <View style={{ margin: 4, borderRadius: 10, overflow: "hidden" }}>
          <Image source={capImage} style={{ width: 265, height: 255, borderRadius: 10 }} resizeMode="cover" />
          {/* 순위 배지: top-left */}
          <View style={{ position: "absolute", top: 8, left: 8 }}>
            <RankBadge rank={item.rank} />
          </View>
          {/* 유사도 배지: top-right (카드 경계 약간 overflow) */}
          <View style={{ position: "absolute", top: 0, right: 0 }}>
            <SimilarityBadge percentage={item.similarity} />
          </View>
        </View>

        {/* 텍스트 영역 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
          {/* 제목: 16px SemiBold, centered */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              lineHeight: 22,
              color: "#000",
              marginBottom: 10,
            }}
          >
            {item.title}
          </Text>

          {/* 습득 장소 */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <PinIcon width={9} height={11} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 17, color: "#434343", marginRight: 6 }}>습득 장소</Text>
            <Text style={{ fontSize: 10, lineHeight: 15, color: "#000" }} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* 습득 시간 */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CalendarIcon width={10} height={11} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 17, color: "#434343", marginRight: 6 }}>습득 시간</Text>
            <Text style={{ fontSize: 10, lineHeight: 15, color: "#000" }}>{item.date}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ── 메인 화면 ────────────────────────────────────────────
export default function Top5Screen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE);
    setCurrentIndex(Math.max(0, Math.min(index, MOCK_DATA.length - 1)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* ── 헤더 ──────────────────────────────────── */}
      <View style={{ backgroundColor: "#F5F7FA" }}>
        <View style={{ height: 60 }} />
        <View
          style={{
            height: 51,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <BackIcon width={11} height={19} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>유사도 Top5 결과</Text>
          </View>
          <View style={{ width: 11 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── TOP X / 5 인디케이터 ─────────────────── */}
        {/* Figma: "TOP " 20px ExtraBold, 숫자 32px ExtraBold #3B82F6, "/ 5" 16px Medium */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#000" }}>TOP </Text>
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#3B82F6" }}>{currentIndex + 1}</Text>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#000" }}> / 5</Text>
        </View>

        {/* ── 카드 캐러셀 ─────────────────────────── */}
        {/* Figma: 카드 w=273, h=354, 좌우 카드 visible with rotation */}
        <Animated.FlatList
          data={MOCK_DATA}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          // 첫/마지막 카드가 화면 중앙에 오도록
          contentContainerStyle={{ paddingLeft: SIDE_OFFSET, paddingRight: SIDE_OFFSET - CARD_SPACING }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => <CardItem item={item} index={index} scrollX={scrollX} />}
        />

        {/* ── 페이지네이션 도트 ─────────────────────── */}
        {/* Figma: 활성=navy 8px circle, 비활성=gray 8px circle, 간격 20px */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
            marginBottom: 16,
            gap: 12,
          }}
        >
          {MOCK_DATA.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === currentIndex ? "#1E3A5F" : "#D6D6D6",
              }}
            />
          ))}
        </View>

        {/* ── AI 선정이유 카드 ──────────────────────── */}
        {/* Figma: white, borderRadius=10, shadow, left=24, w=345 */}
        <View
          style={{
            marginHorizontal: 24,
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: -2, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#000",
              marginBottom: 10,
            }}
          >
            AI 선정이유
          </Text>
          {/* 텍스트 박스: bg=#E5E7EB, border=#D9D9D9, borderRadius=10, h=178 */}
          <View
            style={{
              backgroundColor: "#E5E7EB",
              borderWidth: 1,
              borderColor: "#D9D9D9",
              borderRadius: 10,
              height: 178,
              padding: 8,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <Text style={{ fontSize: 12, color: "#000", lineHeight: 16 }}>{AI_REASON}</Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* ── 하단 버튼 ────────────────────────────── */}
      {/* Figma: 채팅하기 w=153 (outline navy), 상세보기 w=153 (filled navy), gap=12, paddingH=37 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#F5F7FA",
          flexDirection: "row",
          paddingHorizontal: 37,
          paddingTop: 12,
          paddingBottom: 22,
          gap: 12,
        }}
      >
        {/* 채팅하기: 흰색 bg, navy border, navy 텍스트 */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 46,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#1E3A5F",
            backgroundColor: "#fff",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Top5ChatIcon width={18} height={18} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E3A5F", letterSpacing: -0.32 }}>채팅하기</Text>
        </TouchableOpacity>

        {/* 상세보기: navy bg, white 텍스트 */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 46,
            borderRadius: 10,
            backgroundColor: "#1E3A5F",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Top5DetailIcon width={13} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
