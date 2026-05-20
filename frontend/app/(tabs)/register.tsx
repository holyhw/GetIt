import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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

// ─────────────────────────────────────────────────────────
// 카테고리 목록
// ─────────────────────────────────────────────────────────
const CATEGORIES = ["지갑", "의류", "가방", "전자기기", "기타"];

// ─────────────────────────────────────────────────────────
// 공통 InputRow 컴포넌트
// ─────────────────────────────────────────────────────────
type InputRowProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  multiline?: boolean;
  height?: number;
};

function InputRow({
  label,
  required,
  optional,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightSlot,
  multiline,
  height = 34,
}: InputRowProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      {/* 라벨 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>{label}</Text>
        {required && <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />}
        {optional && (
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#919191", marginLeft: 4 }}>
            {" (선택)"}
          </Text>
        )}
      </View>
      {/* 입력 행 */}
      <View style={{ flexDirection: "row", gap: 8 }}>
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
        {rightSlot}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// 메인 화면
// ─────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();

  const [type, setType] = useState<"found" | "lost">("found");
  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";
  const ctaText = isFound ? "습득물 등록하기" : "분실물 등록하기";

  // 사진: 습득=필수, 분실=선택
  // 상세 설명: 습득=선택, 분실=필수

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>

        {/* ── 헤더 ──────────────────────────────────────── */}
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
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <BackIcon width={11} height={19} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>
                물건 등록하기
              </Text>
            </View>
            <View style={{ width: 19 }} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 토글 바: h=34, w=345, borderRadius=10 ── */}
          {/* 습득(left half navy) / 분실(right half orange) */}
          {/* 토글: 외부 컨테이너 + 내부 박스 2개(각각 borderRadius=10) */}
          {/* Figma: 컨테이너 bg=#F7F7F7, 활성 박스 w=173 h=34 rounded-10 */}
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
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: isFound ? "#fff" : "#919191" }}
              >
                습득물 등록
              </Text>
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
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: !isFound ? "#fff" : "#919191" }}
              >
                분실물 등록
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── 사진 등록 카드: h=183, white, shadow ── */}
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
            {/* 사진 카드 헤더 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {/* 왼쪽: 사진 등록 + 카운트 + 필수/선택 */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>사진 등록</Text>
                <Text style={{ fontSize: 10, color: "#919191", marginLeft: 3 }}>
                  {photo ? "(1/1)" : "(0/1)"}
                </Text>
                {isFound ? (
                  <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
                ) : (
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#919191", marginLeft: 2 }}>
                    {" (선택)"}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }} />
              {/* 오른쪽: 안내 아이콘 + 텍스트 */}
              <InfoIcon width={11} height={11} />
              <Text
                style={{ fontSize: 10, color: "#919191", marginLeft: 4, flexShrink: 1 }}
                numberOfLines={1}
              >
                물건의 특징이 잘 보이도록 사진을 등록해주세요.
              </Text>
            </View>

            {/* 사진 업로드 영역 */}
            {!photo ? (
              // 빈 상태: 점선 박스, 카메라 아이콘 + "사진 추가"
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
                <Text
                  style={{ fontSize: 12, fontWeight: "800", color: "#919191", marginTop: 8 }}
                >
                  사진 추가
                </Text>
              </TouchableOpacity>
            ) : (
              // 채워진 상태: 왼쪽 변경 박스 + 오른쪽 썸네일
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* 사진 변경 박스: w=178 */}
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
                  <Text
                    style={{ fontSize: 12, fontWeight: "800", color: "#919191", marginTop: 8 }}
                  >
                    사진 변경
                  </Text>
                </TouchableOpacity>
                {/* 썸네일: 131×131, borderRadius=15 + X 버튼 */}
                <View>
                  <Image
                    source={{ uri: photo }}
                    style={{ width: 131, height: 131, borderRadius: 15 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setPhoto(null)}
                    style={{ position: "absolute", top: -6, right: -6 }}
                  >
                    <CloseIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* ── 폼 카드: white, shadow ── */}
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
            {/* 제목 */}
            <InputRow
              label="제목"
              required
              value={title}
              onChangeText={setTitle}
              placeholder="예: 검은색 Kodak 모자"
            />

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
                      <Text
                        style={{
                          fontSize: 10,
                          color: selected ? themeColor : "#000",
                          fontWeight: selected ? "600" : "400",
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 습득/분실 위치 */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                  {isFound ? "습득 위치" : "분실 위치"}
                </Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* 위치 입력 */}
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
                {/* 지도에서 선택 버튼: w=68 */}
                <TouchableOpacity
                  style={{
                    width: 68,
                    height: 34,
                    backgroundColor: "#E5E7EB",
                    borderWidth: 1,
                    borderColor: "#D9D9D9",
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#464646" }}>
                    지도에서 선택
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 습득/분실 시간 */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                  {isFound ? "습득 시간" : "분실 시간"}
                </Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>
              <TouchableOpacity
                style={{
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
                <CalendarIcon width={10} height={11} style={{ marginRight: 8 }} />
                <Text style={{ flex: 1, fontSize: 12, color: time ? "#000" : "#919191" }}>
                  {time || "날짜와 시간을 선택해주세요"}
                </Text>
                <ArrowRight width={5} height={9} />
              </TouchableOpacity>
            </View>

            {/* 상세 설명: 습득=선택, 분실=필수 */}
            <InputRow
              label="상세 설명"
              required={!isFound}
              optional={isFound}
              value={description}
              onChangeText={setDescription}
              placeholder="예: 검은색 Kodak 모자"
              multiline
              height={67}
            />
          </View>
        </ScrollView>

        {/* ── CTA 버튼 (하단 고정) ────────────────────────── */}
        {/* Figma: w=337, h=46, borderRadius=10 */}
        <View
          style={{
            backgroundColor: "#F5F7FA",
            paddingHorizontal: 28,
            paddingTop: 12,
            paddingBottom: 22,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: themeColor,
              height: 46,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: -0.32 }}>
              {ctaText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
