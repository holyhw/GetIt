import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";
import BackIcon from "../../assets/myinfo-back.svg";
import SmartphoneIcon from "../../assets/smartphone.svg";
import BackpackIcon from "../../assets/backpack.svg";
import WalletIcon from "../../assets/wallet.svg";
import ShirtIcon from "../../assets/shirt.svg";
import GemIcon from "../../assets/gem.svg";
import BookIcon from "../../assets/book.svg";
import KeyIcon from "../../assets/key-round.svg";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { label: "전자기기", Icon: SmartphoneIcon, subcategories: ["스마트폰", "이어폰", "헤드셋", "키보드", "태블릿", "마우스", "보조배터리", "기타"] },
  { label: "가방", Icon: BackpackIcon, subcategories: ["백팩", "토트백", "에코백", "크로스백", "파우치", "기타"] },
  { label: "지갑", Icon: WalletIcon, subcategories: ["반지갑", "장지갑", "카드지갑", "기타"] },
  { label: "패션잡화", Icon: ShirtIcon, subcategories: ["신발", "의류", "안경", "선글라스", "모자", "기타"] },
  { label: "액세서리", Icon: GemIcon, subcategories: ["반지", "목걸이", "팔찌", "기타"] },
  { label: "도서/문구", Icon: BookIcon, subcategories: ["책", "기타"] },
  { label: "소지품", Icon: KeyIcon, subcategories: ["열쇠", "텀블러", "우산", "기타"] },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [type, setType] = useState<"found" | "lost">("found");
  const [selected, setSelected] = useState<{ main: string; sub: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      setType("found");
      setSelected(null);
    }, [])
  );

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const handleNext = () => {
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
    if (!selected) {
      Alert.alert("카테고리를 선택해주세요.");
      return;
    }
    router.push(`/register-photo?type=${type}&majorCategory=${encodeURIComponent(selected.main)}&minorCategory=${encodeURIComponent(selected.sub)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ backgroundColor: "#F5F7FA" }}>
        <View style={{ height: 60 }} />
        <View style={{ height: 51, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={{ marginRight: 8 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon width={11} height={19} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>물건 등록하기</Text>
          </View>
          <View style={{ width: 19 }} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 }}
      >
        {/* 토글 */}
        <View
          style={{
            height: 34,
            flexDirection: "row",
            backgroundColor: "#F7F7F7",
            borderWidth: 1,
            borderColor: "#D9D9D9",
            borderRadius: 10,
            padding: 2,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setType("found")}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isFound ? "#1E3A5F" : "transparent", borderRadius: 8 }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: isFound ? "#fff" : "#919191" }}>습득물 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType("lost")}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: !isFound ? "#FF7A00" : "transparent", borderRadius: 8 }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: !isFound ? "#fff" : "#919191" }}>분실물 등록</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 배너 */}
        <View style={{
          backgroundColor: themeColor + "12",
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: themeColor + "25",
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: themeColor + "20",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke={themeColor} strokeWidth={1.8} />
              <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke={themeColor} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A1A", letterSpacing: -0.3 }}>
              {isFound ? "습득하신 물건의 종류를 선택해 주세요" : "분실하신 물건의 종류를 선택해 주세요"}
            </Text>
            <Text style={{ fontSize: 11, color: themeColor, marginTop: 3, letterSpacing: -0.2, fontWeight: "500" }}>
              {isFound ? "AI가 분실자를 찾아드릴게요" : "AI가 비슷한 습득물을 찾아드릴게요"}
            </Text>
          </View>
        </View>

        {/* 카테고리 목록 */}
        <View style={{ gap: 12 }}>
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            return (
              <View key={cat.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {/* 대분류 — 흰 박스 밖 */}
                <View style={{ width: 52, alignItems: "center", gap: 4 }}>
                  <Icon width={24} height={24} />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#434343", textAlign: "center" }}>{cat.label}</Text>
                </View>

                {/* 소분류 — 흰 박스 */}
                <View style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: -2, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}>
                  {cat.subcategories.map((sub) => {
                    const isSelected = selected?.main === cat.label && selected?.sub === sub;
                    return (
                      <TouchableOpacity
                        key={sub}
                        onPress={() => setSelected(isSelected ? null : { main: cat.label, sub })}
                        style={{
                          width: "47%",
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isSelected ? themeColor + "15" : "#F5F7FA",
                          borderWidth: 1,
                          borderColor: isSelected ? themeColor : "#E5E7EB",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: isSelected ? themeColor : "#434343", fontWeight: isSelected ? "600" : "400" }}>
                          {sub}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={{ backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={{
            backgroundColor: selected ? themeColor : "#D9D9D9",
            height: 46,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: -0.32 }}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
