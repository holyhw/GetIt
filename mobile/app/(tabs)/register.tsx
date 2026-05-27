import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import BackIcon from "../../assets/myinfo-back.svg";
import RequiredDot from "../../assets/reg-required.svg";

import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["지갑", "의류", "가방", "전자기기", "기타"];

export default function RegisterScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [type, setType] = useState<"found" | "lost">("found");
  const [category, setCategory] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setType("found");
      setCategory(null);
    }, [])
  );

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const handleNext = () => {
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
    if (!category) {
      Alert.alert("카테고리를 선택해주세요.");
      return;
    }
    router.push(`/register-photo?type=${type}&category=${encodeURIComponent(category)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ backgroundColor: "#F5F7FA" }}>
        <View style={{ height: 60 }} />
        <View style={{ height: 51, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={{ marginRight: 8 }}>
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
            marginBottom: 24,
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

        {/* 카테고리 */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: -2, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>카테고리</Text>
            <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(selected ? null : cat)}
                  style={{
                    height: 36,
                    paddingHorizontal: 18,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? "#fff" : "#E5E7EB",
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? themeColor : "#D9D9D9",
                  }}
                >
                  <Text style={{ fontSize: 12, color: selected ? themeColor : "#000", fontWeight: selected ? "600" : "400" }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={{ backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={{
            backgroundColor: category ? themeColor : "#D9D9D9",
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
