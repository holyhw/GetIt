import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import BackIcon from "../../assets/myinfo-back.svg";
import CameraIcon from "../../assets/reg-camera.svg";
import InfoIcon from "../../assets/reg-info.svg";
import RequiredDot from "../../assets/reg-required.svg";
import PinIcon from "../../assets/reg-pin.svg";
import CalendarIcon from "../../assets/reg-calendar.svg";
import CloseIcon from "../../assets/reg-close.svg";
import ArrowRight from "../../assets/detail-arrow-right.svg";
import { useAuth } from "../../context/AuthContext";
import { matchStore } from "../../utils/matchStore";

const API_BASE_URL = "https://api.getitsju.com";
const CATEGORIES = ["지갑", "의류", "가방", "전자기기", "기타"];

// 네이티브 전용 DateTimePicker
const DateTimePicker = Platform.OS !== "web" ? require("@react-native-community/datetimepicker").default : null;

type InputRowProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  multiline?: boolean;
  height?: number;
};

function InputRow({ label, required, optional, value, onChangeText, placeholder, leftIcon, multiline, height = 34 }: InputRowProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>{label}</Text>
        {required && <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />}
        {optional && <Text style={{ fontSize: 10, fontWeight: "700", color: "#919191", marginLeft: 4 }}>{" (선택)"}</Text>}
      </View>
      <View
        style={{
          flex: 1,
          height,
          backgroundColor: "#E5E7EB",
          borderWidth: 1,
          borderColor: "#D9D9D9",
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
        }}
      >
        {leftIcon && <View style={{ marginRight: 6 }}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#919191"
          multiline={multiline}
          style={{
            flex: 1,
            fontSize: 12,
            color: "#000",
            padding: 0,
            textAlignVertical: multiline ? "top" : "center",
            height: multiline ? height - 16 : undefined,
          }}
        />
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [type, setType] = useState<"found" | "lost">("found");
  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";
  const ctaText = isFound ? "습득물 등록하기" : "분실물 등록하기";
  const dateLabel = date ? date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "") : "날짜와 시간을 선택해주세요";

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("제목을 입력해주세요.");
      return;
    }
    if (!category) {
      Alert.alert("카테고리를 선택해주세요.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("위치를 입력해주세요.");
      return;
    }
    if (isFound && !photo) {
      Alert.alert("사진을 등록해주세요.");
      return;
    }
    if (!isFound && !description.trim()) {
      Alert.alert("상세 설명을 입력해주세요.");
      return;
    }

    const params = new URLSearchParams({ title: title.trim() });
    if (category) params.append("category", category);
    if (location.trim()) params.append("location", location.trim());
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      params.append("occurredDate", `${y}-${m}-${d}`);
    }
    if (isFound && description.trim()) params.append("description", description.trim());
    if (!isFound && description.trim()) params.append("text", description.trim());

    const formData = new FormData();
    if (photo) {
      if (Platform.OS === "web") {
        const res = await fetch(photo);
        const blob = await res.blob();
        formData.append("image", blob, "image.jpg");
      } else {
        formData.append("image", { uri: photo, type: "image/jpeg", name: "image.jpg" } as any);
      }
    }

    setLoading(true);
    try {
      const path = isFound ? "/api/registration/found" : "/api/registration/lost";
      const res = await fetch(`${API_BASE_URL}${path}?${params}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`오류: ${res.status}`);
      const data = await res.json();

      if (isFound) {
        router.replace(`/detail?id=${data.result.id}&type=found`);
      } else {
        matchStore.set({ matchResults: data.result.matchResults });
        router.replace("/top5");
      }
    } catch (e: any) {
      Alert.alert("등록 실패", e.message ?? "잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
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
          <View style={{ height: 34, flexDirection: "row", backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 10, padding: 2, marginBottom: 16 }}>
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
                style={{ height: 130, borderWidth: 1, borderStyle: "dashed", borderColor: "#D9D9D9", borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}
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

          {/* 폼 */}
          <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, shadowColor: "#000", shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <InputRow label="제목" required value={title} onChangeText={setTitle} placeholder="예: 검은색 Kodak 모자" />

            {/* 카테고리 */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>카테고리</Text>
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
                        height: 30,
                        paddingHorizontal: 14,
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? "#fff" : "#E5E7EB",
                        borderWidth: selected ? 1.5 : 1,
                        borderColor: selected ? themeColor : "#D9D9D9",
                      }}
                    >
                      <Text style={{ fontSize: 10, color: selected ? themeColor : "#000", fontWeight: selected ? "600" : "400" }}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 위치 */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>{isFound ? "습득 위치" : "분실 위치"}</Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    flex: 1,
                    height: 34,
                    backgroundColor: "#E5E7EB",
                    borderWidth: 1,
                    borderColor: "#D9D9D9",
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <PinIcon width={9} height={11} style={{ marginRight: 6 }} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="위치를 선택해주세요"
                    placeholderTextColor="#919191"
                    style={{ flex: 1, fontSize: 12, color: "#000", padding: 0 }}
                  />
                </View>
                <TouchableOpacity
                  style={{ width: 68, height: 34, backgroundColor: "#E5E7EB", borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#464646" }}>지도에서 선택</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 날짜 */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>{isFound ? "습득 날짜" : "분실 날짜"}</Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>

              {Platform.OS === "web" ? (
                <View
                  style={{
                    height: 34,
                    backgroundColor: "#E5E7EB",
                    borderWidth: 1,
                    borderColor: "#D9D9D9",
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    overflow: "hidden",
                  }}
                >
                  <CalendarIcon width={10} height={11} style={{ marginRight: 8 }} />
                  <input
                    type="date"
                    value={date ? date.toISOString().split("T")[0] : ""}
                    onChange={(e: any) => (e.target.value ? setDate(new Date(e.target.value)) : setDate(null))}
                    style={{ flex: 1, fontSize: 12, border: "none", background: "transparent", outline: "none", color: date ? "#000" : "#919191", fontFamily: "inherit" } as any}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    style={{ height: 34, backgroundColor: "#E5E7EB", borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}
                  >
                    <CalendarIcon width={10} height={11} style={{ marginRight: 8 }} />
                    <Text style={{ flex: 1, fontSize: 12, color: date ? "#000" : "#919191" }}>{dateLabel}</Text>
                    <ArrowRight width={5} height={9} />
                  </TouchableOpacity>

                  {Platform.OS === "android" && DateTimePicker && showPicker && (
                    <DateTimePicker
                      value={date ?? new Date()}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onValueChange={(selected: Date) => {
                        setShowPicker(false);
                        setDate(selected);
                      }}
                      onDismiss={() => setShowPicker(false)}
                    />
                  )}
                </>
              )}
            </View>

            <InputRow
              label="상세 설명"
              required={!isFound}
              optional={isFound}
              value={description}
              onChangeText={setDescription}
              placeholder="물건의 특징을 자세히 입력해주세요"
              multiline
              height={67}
            />
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={{ backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: themeColor, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: -0.32 }}>{ctaText}</Text>}
          </TouchableOpacity>
        </View>

        {/* iOS 날짜 피커 바텀시트 */}
        {Platform.OS === "ios" && showPicker && DateTimePicker && (
          <>
            <TouchableOpacity style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" }} onPress={() => setShowPicker(false)} />
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 }}>
              <View style={{ width: 40, height: 4, backgroundColor: "#D9D9D9", borderRadius: 2, alignSelf: "center", marginTop: 12 }} />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ fontSize: 16, color: themeColor, fontWeight: "600" }}>완료</Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center", width: "100%" }}>
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  style={{ height: 216 }}
                  locale="ko"
                  onValueChange={(selected: Date) => {
                    setDate(selected);
                  }}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
