import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import BackIcon from "../../assets/myinfo-back.svg";
import CameraIcon from "../../assets/reg-camera.svg";
import InfoIcon from "../../assets/reg-info.svg";
import RequiredDot from "../../assets/reg-required.svg";
import CloseIcon from "../../assets/reg-close.svg";
import { useAuth } from "../../context/AuthContext";
import { registerStore } from "../../utils/registerStore";

const API_BASE_URL = "https://api.getitsju.com";

export default function RegisterScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [type, setType] = useState<"found" | "lost">("found");
  const [photo, setPhoto] = useState<string | null>(null);
  const [text, setText] = useState("");

  useFocusEffect(
    useCallback(() => {
      setType("found");
      setPhoto(null);
      setText("");
    }, [])
  );

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const handleNext = () => {
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
    if (isFound && !photo) {
      Alert.alert("습득물 사진을 등록해주세요.");
      return;
    }
    if (!isFound && !text.trim()) {
      Alert.alert("물건 설명을 입력해주세요.");
      return;
    }

    registerStore.setPhoto(photo);
    router.push(`/register-detail?type=${type}&text=${encodeURIComponent(text.trim())}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
        {/* 헤더 */}
        <View style={{ backgroundColor: "#F5F7FA" }}>
          <View style={{ height: 60 }} />
          <View style={{ height: 51, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <BackIcon width={11} height={19} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>물건 등록하기</Text>
            </View>
            <View style={{ width: 19 }} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
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
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setType("found")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isFound ? "#1E3A5F" : "transparent",
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: isFound ? "#fff" : "#919191" }}>습득물 등록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("lost")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: !isFound ? "#FF7A00" : "transparent",
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: !isFound ? "#fff" : "#919191" }}>분실물 등록</Text>
            </TouchableOpacity>
          </View>

          {/* 사진 등록 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>사진 등록</Text>
                <Text style={{ fontSize: 10, color: "#919191", marginLeft: 3 }}>{photo ? "(1/1)" : "(0/1)"}</Text>
                {isFound ? <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} /> : <Text style={{ fontSize: 10, fontWeight: "700", color: "#919191", marginLeft: 2 }}>{" (선택)"}</Text>}
              </View>
              <View style={{ flex: 1 }} />
              <InfoIcon width={11} height={11} />
              <Text style={{ fontSize: 10, color: "#919191", marginLeft: 4, flexShrink: 1 }} numberOfLines={1}>
                물건의 특징이 잘 보이도록 사진을 등록해주세요.
              </Text>
            </View>

            {!photo ? (
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  height: 130,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "#D9D9D9",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
              >
                <CameraIcon width={41} height={35} />
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#919191", marginTop: 8 }}>사진 추가</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    width: 178,
                    height: 130,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: "#D9D9D9",
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <CameraIcon width={41} height={35} />
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#919191", marginTop: 8 }}>사진 변경</Text>
                </TouchableOpacity>
                <View>
                  <Image source={{ uri: photo }} style={{ width: 131, height: 131, borderRadius: 15 }} resizeMode="cover" />
                  <TouchableOpacity onPress={() => setPhoto(null)} style={{ position: "absolute", top: -6, right: -6 }}>
                    <CloseIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* 물건 설명 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>물건 설명</Text>
                {isFound
                  ? <Text style={{ fontSize: 10, fontWeight: "700", color: "#919191", marginLeft: 4 }}> (선택)</Text>
                  : <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
                }
              </View>
              <Text style={{ fontSize: 10, color: "#919191", marginTop: 2 }}>AI가 물건을 더 잘 파악할 수 있도록 자세히 설명해주세요.</Text>
            </View>
            <View
              style={{
                height: 80,
                backgroundColor: "#E5E7EB",
                borderWidth: 1,
                borderColor: "#D9D9D9",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={isFound ? "예: 검은 지갑을 주웠어요" : "예: 학생회관 근처에서 지갑을 잃어버렸어요"}
                placeholderTextColor="#919191"
                multiline
                style={{ flex: 1, fontSize: 12, color: "#000", padding: 0, textAlignVertical: "top" }}
              />
            </View>
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={{ backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={{
              backgroundColor: themeColor,
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
    </KeyboardAvoidingView>
  );
}
