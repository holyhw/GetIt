import { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Animated, ScrollView, Dimensions, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import BackIcon from "../assets/myinfo-back.svg";
import Top5ChatIcon from "../assets/top5-chat.svg";
import Top5DetailIcon from "../assets/top5-detail.svg";
import RankBg from "../assets/top5-rank.svg";
import PinIcon from "../assets/reg-pin.svg";
import CalendarIcon from "../assets/reg-calendar.svg";
import { matchStore, MatchResultResponse } from "../utils/matchStore";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const SCREEN_WIDTH = Platform.OS === "web" ? 393 : Dimensions.get("window").width;
const CARD_WIDTH = 273;
const CARD_SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING;
const SIDE_OFFSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

function SimilarityBadge({ percentage }: { percentage: number }) {
  const SIZE = 65;
  const STROKE = 5;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: "rgba(255,255,255,0.85)" }} />
      <View style={{ position: "absolute", width: SIZE, height: SIZE, transform: [{ rotate: "-90deg" }] }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#E5E7EB" strokeWidth={STROKE} fill="none" />
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#3B82F6" strokeWidth={STROKE} fill="none" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </Svg>
      </View>
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

function RankBadge({ rank }: { rank: number }) {
  return (
    <View style={{ width: 43, height: 24, opacity: 0.75 }}>
      <View style={{ position: "absolute", width: 43, height: 24 }}>
        <RankBg width={43} height={24} />
      </View>
      <View style={{ width: 43, height: 24, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#fff" }}>{rank}위</Text>
      </View>
    </View>
  );
}

type CardProps = {
  item: MatchResultResponse;
  index: number;
  scrollX: Animated.Value;
};

function CardItem({ item, index, scrollX }: CardProps) {
  const inputRange = [(index - 1) * ITEM_SIZE, index * ITEM_SIZE, (index + 1) * ITEM_SIZE];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: "clamp" });
  const rotateY = scrollX.interpolate({ inputRange, outputRange: ["18deg", "0deg", "-18deg"], extrapolate: "clamp" });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.65, 1, 0.65], extrapolate: "clamp" });
  const isWeb = Platform.OS === "web";
  const similarityPct = Math.round(item.similarity * 100);
  const date = item.occurredDate?.replace(/-/g, ".") ?? "";

  return (
    <Animated.View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING, transform: isWeb ? [{ scale }] : [{ scale }, { perspective: 1000 }, { rotateY }], opacity }}>
      <View style={{ width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 10, shadowColor: "#000", shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, marginBottom: 10 }}>
        <View style={{ margin: 4, borderRadius: 10, overflow: "hidden", width: CARD_WIDTH - 8, height: 255 }}>
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/cap.jpg")}
            style={{ width: CARD_WIDTH - 8, height: 255, borderRadius: 10 }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 8, left: 8 }}>
            <RankBadge rank={item.rank} />
          </View>
          <View style={{ position: "absolute", top: 0, right: 0 }}>
            <SimilarityBadge percentage={similarityPct} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", lineHeight: 22, color: "#000", marginBottom: 10 }}>{item.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <PinIcon width={9} height={11} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 17, color: "#434343", marginRight: 6 }}>습득 장소</Text>
            <Text style={{ fontSize: 10, lineHeight: 15, color: "#000", flex: 1 }} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CalendarIcon width={10} height={11} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 17, color: "#434343", marginRight: 6 }}>습득 시간</Text>
            <Text style={{ fontSize: 10, lineHeight: 15, color: "#000" }}>{date}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function Top5Screen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token } = useAuth();

  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const flatListRef = useRef<any>(null);

  const [data, setData] = useState<MatchResultResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // matchStore 경로: 마운트 시 1회만 읽기
  useEffect(() => {
    if (!id) {
      setData(matchStore.get()?.matchResults ?? []);
      matchStore.clear();
    }
  }, []);

  // API 경로: id + token 준비되면 fetch
  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    api.get<{ matchResults: MatchResultResponse[] }>(`/api/registration/${id}/matches`, token)
      .then((res) => setData(res.matchResults ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (Platform.OS !== "web" || data.length === 0) return;
    const timer = setTimeout(() => {
      const scrollEl = flatListRef.current?.getScrollableNode?.();
      if (!scrollEl) return;
      let isDragging = false, startX = 0, startScrollLeft = 0;
      const onMouseDown = (e: MouseEvent) => { isDragging = true; startX = e.clientX; startScrollLeft = scrollEl.scrollLeft; scrollEl.style.cursor = "grabbing"; };
      const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; e.preventDefault(); scrollEl.scrollLeft = startScrollLeft - (e.clientX - startX); };
      const onMouseUp = () => { isDragging = false; scrollEl.style.cursor = "grab"; setCurrentIndex(Math.max(0, Math.min(Math.round(scrollEl.scrollLeft / ITEM_SIZE), data.length - 1))); };
      scrollEl.style.cursor = "grab";
      scrollEl.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => { scrollEl.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
    }, 300);
    return () => clearTimeout(timer);
  }, [data.length]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F7FA", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14, color: "#919191" }}>매칭 결과가 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: "#1E3A5F", fontWeight: "600" }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentItem = data[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ backgroundColor: "#F5F7FA" }}>
        <View style={{ height: 60 }} />
        <View style={{ height: 51, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
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
        {/* TOP X / N */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginTop: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#000" }}>TOP </Text>
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#3B82F6" }}>{currentIndex + 1}</Text>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#000" }}> / {data.length}</Text>
        </View>

        {/* 카드 캐러셀 */}
        <Animated.FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          contentContainerStyle={{ paddingLeft: SIDE_OFFSET, paddingRight: SIDE_OFFSET - CARD_SPACING }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: Platform.OS !== "web",
              listener: (e: any) => {
                const clamped = Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE), data.length - 1));
                if (clamped !== currentIndexRef.current) { currentIndexRef.current = clamped; setCurrentIndex(clamped); }
              },
            }
          )}
          onMomentumScrollEnd={(e) => setCurrentIndex(Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE), data.length - 1)))}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => <CardItem item={item} index={index} scrollX={scrollX} />}
        />

        {/* 페이지네이션 도트 */}
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16, marginBottom: 16, gap: 12 }}>
          {data.map((_, i) => (
            <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === currentIndex ? "#1E3A5F" : "#D6D6D6" }} />
          ))}
        </View>

        {/* AI 선정이유 */}
        <View style={{ marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 10, padding: 12, shadowColor: "#000", shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#000", marginBottom: 10 }}>AI 선정이유</Text>
          <View style={{ backgroundColor: "#E5E7EB", borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 10, height: 178, padding: 8 }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <Text style={{ fontSize: 12, color: "#000", lineHeight: 16 }}>{currentItem?.explanation ?? ""}</Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#F5F7FA", flexDirection: "row", paddingHorizontal: 37, paddingTop: 12, paddingBottom: 22, gap: 12 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/chatroom")}
          style={{ flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F", backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Top5ChatIcon width={18} height={18} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E3A5F", letterSpacing: -0.32 }}>채팅하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => currentItem && router.push(`/detail?id=${currentItem.registrationId}&type=found`)}
          style={{ flex: 1, height: 46, borderRadius: 10, backgroundColor: "#1E3A5F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Top5DetailIcon width={13} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
