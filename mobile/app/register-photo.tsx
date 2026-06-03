import { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import BackIcon from "../assets/myinfo-back.svg";
import CameraIcon from "../assets/reg-camera.svg";
import InfoIcon from "../assets/reg-info.svg";
import RequiredDot from "../assets/reg-required.svg";
import CloseIcon from "../assets/reg-close.svg";
import { useAuth } from "../context/AuthContext";
import { registerStore } from "../utils/registerStore";
import type { PreAnalysisStatus, ReferenceImage } from "../types/preAnalysis";

const API_BASE_URL = "https://api.getitsju.com";

const ANALYSIS_MESSAGES = ["이미지 분석 중...", "물건 특징 추출 중...", "설명 작성 중..."];

function AnalysisLoadingOverlay({ themeColor, onCancel }: { themeColor: string; onCancel: () => void }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const radarAnim = Animated.loop(
      Animated.stagger(700, [ring1, ring2, ring3].map((ring) =>
        Animated.sequence([
          Animated.timing(ring, { toValue: 1, duration: 2100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ))
    );
    radarAnim.start();

    let idx = 0;
    const cycleText = () => {
      Animated.timing(textOpacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
        idx = (idx + 1) % ANALYSIS_MESSAGES.length;
        setMsgIndex(idx);
        Animated.timing(textOpacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
      });
    };
    const interval = setInterval(cycleText, 2100);
    return () => { radarAnim.stop(); clearInterval(interval); };
  }, []);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <View style={{ backgroundColor: "#fff", borderRadius: 28, paddingHorizontal: 36, paddingVertical: 40, alignItems: "center", width: 320, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}>
        {/* 링 애니메이션 */}
        <View style={{ width: 140, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          {[ring1, ring2, ring3].map((ring, i) => (
            <Animated.View key={i} style={{
              position: "absolute", width: 140, height: 140, borderRadius: 70,
              borderWidth: 1.5, borderColor: themeColor,
              opacity: ring.interpolate({ inputRange: [0, 0.08, 0.65, 1], outputRange: [0, 0.7, 0.2, 0] }),
              transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) }],
            }} />
          ))}
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: themeColor, alignItems: "center", justifyContent: "center", shadowColor: themeColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8 }}>
            <Text style={{ fontSize: 28 }}>✨</Text>
          </View>
        </View>

        <Text style={{ fontSize: 20, fontWeight: "700", color: "#000", letterSpacing: -0.4 }}>물건 정보 생성 중</Text>
        <Animated.Text style={{ fontSize: 13, color: themeColor, marginTop: 6, letterSpacing: -0.2, fontWeight: "500", opacity: textOpacity }}>
          {ANALYSIS_MESSAGES[msgIndex]}
        </Animated.Text>
        <Text style={{ fontSize: 13, color: "#434343", marginTop: 4, letterSpacing: -0.2 }}>
          조금만 기다려 주세요!
        </Text>

        <TouchableOpacity onPress={onCancel} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" }}>
          <Text style={{ fontSize: 13, color: "#919191" }}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReferenceImageOverlay({
  image,
  imageAction,
  onUse,
  onRefresh,
  onSkip,
}: {
  image: ReferenceImage | null;
  imageAction: "use" | "refresh" | "skip" | null;
  onUse: () => void;
  onRefresh: () => void;
  onSkip: () => void;
}) {
  const loading = imageAction !== null;
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 24 }}>
      <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "100%" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 4 }}>참고 이미지 선택</Text>
        <Text style={{ fontSize: 13, color: "#919191", marginBottom: 16 }}>AI가 분실물과 유사한 이미지를 찾았습니다.</Text>

        {image ? (
          <>
            {imageAction === "refresh" ? (
              <View style={{ height: 180, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <ActivityIndicator size="large" color="#1E3A5F" />
              </View>
            ) : (
              <Image source={{ uri: image.imageUrl }} style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 10 }} resizeMode="contain" />
            )}
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#000", marginBottom: 16 }} numberOfLines={2}>{image.title}</Text>
          </>
        ) : (
          <View style={{ height: 60, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: "#919191" }}>참고 이미지를 찾지 못했습니다.</Text>
          </View>
        )}

        <View style={{ gap: 8 }}>
          {image && (
            <TouchableOpacity
              onPress={onUse}
              disabled={loading}
              style={{ height: 46, borderRadius: 10, backgroundColor: "#FF7A00", alignItems: "center", justifyContent: "center" }}
            >
              {imageAction === "use" ? <ActivityIndicator color="#fff" /> : (
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>이 이미지로 진행</Text>
              )}
            </TouchableOpacity>
          )}
          {image && (
            <TouchableOpacity
              onPress={onRefresh}
              disabled={loading}
              style={{ height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D9D9D9", alignItems: "center", justifyContent: "center" }}
            >
              {imageAction === "refresh" ? <ActivityIndicator color="#434343" /> : (
                <Text style={{ color: "#434343", fontSize: 14, fontWeight: "600" }}>다시 가져오기</Text>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onSkip}
            disabled={loading}
            style={{ height: 46, alignItems: "center", justifyContent: "center" }}
          >
            {imageAction === "skip" ? <ActivityIndicator color="#919191" /> : (
              <Text style={{ color: "#919191", fontSize: 14 }}>이미지 없이 진행</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function RegisterPhotoScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { type, majorCategory, minorCategory } = useLocalSearchParams<{
    type: "found" | "lost";
    majorCategory: string;
    minorCategory: string;
  }>();
  const categoryDisplay =
    majorCategory && minorCategory ? `${majorCategory} > ${minorCategory}` : "";

  const [photo, setPhoto] = useState<string | null>(null);
  const [text, setText] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [preAnalysisId, setPreAnalysisId] = useState<number | null>(null);
  const preAnalysisIdRef = useRef<number | null>(null);
  const analysisStatusRef = useRef<PreAnalysisStatus>("PROCESSING");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollingTrigger, setPollingTrigger] = useState(0);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [imageAction, setImageAction] = useState<"use" | "refresh" | "skip" | null>(null);

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const showAlert = (msg: string) =>
    Platform.OS === "web" ? window.alert(msg) : Alert.alert(msg);

  const navigateToDetail = (pId: number) => {
    router.replace(
      `/register-detail?type=${type}&majorCategory=${encodeURIComponent(majorCategory ?? "")}&minorCategory=${encodeURIComponent(minorCategory ?? "")}&text=${encodeURIComponent(text.trim())}&preAnalysisId=${pId}`,
    );
  };

  useEffect(() => {
    if (!preAnalysisId || !token) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ai/pre-analysis/${preAnalysisId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return;
        const data = await res.json();
        const status: PreAnalysisStatus = data.result.status;
        analysisStatusRef.current = status;

        if (status === "PENDING_IMAGE_SELECTION") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setReferenceImage(data.result.referenceImages?.[0] ?? null);
          setShowImageSelection(true);
        } else if (status === "COMPLETED") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          navigateToDetail(preAnalysisId);
        } else if (status === "FAILED") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setAnalyzing(false);
          showAlert("AI 분석에 실패했습니다. 다시 시도해주세요.");
        }
      } catch {}
    };

    poll();
    pollingRef.current = setInterval(poll, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [preAnalysisId, token, pollingTrigger]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert("사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    if (!token) {
      router.push("/login");
      return;
    }
    if (isFound && !photo) {
      showAlert("습득물 사진을 등록해주세요.");
      return;
    }
    if (!isFound && !text.trim()) {
      showAlert("물건 설명을 입력해주세요.");
      return;
    }

    registerStore.setPhoto(photo);

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("itemType", isFound ? "FOUND" : "LOST");
      if (majorCategory?.trim()) formData.append("majorCategory", majorCategory.trim());
      if (minorCategory?.trim()) formData.append("minorCategory", minorCategory.trim());
      if (text.trim()) formData.append("text", text.trim());
      if (photo) {
        if (Platform.OS === "web") {
          const res = await fetch(photo);
          const blob = await res.blob();
          formData.append("image", blob, "image.jpg");
        } else {
          formData.append("image", {
            uri: photo,
            type: "image/jpeg",
            name: "image.jpg",
          } as any);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/ai/pre-analysis`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const id: number = data.result.id;
      const initialStatus: PreAnalysisStatus = data.result.status;
      preAnalysisIdRef.current = id;
      analysisStatusRef.current = initialStatus;
      setPreAnalysisId(id);

      if (initialStatus === "PENDING_IMAGE_SELECTION") {
        setReferenceImage(data.result.referenceImages?.[0] ?? null);
        setShowImageSelection(true);
      } else if (initialStatus === "COMPLETED") {
        navigateToDetail(id);
      } else if (initialStatus === "FAILED") {
        setAnalyzing(false);
        showAlert("AI 분석에 실패했습니다. 다시 시도해주세요.");
      }
      // PROCESSING: polling useEffect handles it
    } catch {
      setAnalyzing(false);
      showAlert("AI 분석에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleUseImage = async () => {
    if (!referenceImage || !preAnalysisId || !token) return;
    setImageAction("use");
    try {
      await fetch(`${API_BASE_URL}/api/ai/pre-analysis/${preAnalysisId}/reference-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: referenceImage.imageUrl }),
      });
    } catch {}
    setImageAction(null);
    setShowImageSelection(false);
    analysisStatusRef.current = "PROCESSING";
    setPollingTrigger((t) => t + 1);
  };

  const handleRefreshImage = async () => {
    if (!preAnalysisId || !token) return;
    setImageAction("refresh");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ai/pre-analysis/${preAnalysisId}/reference-images/refresh`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setReferenceImage(data.result.referenceImages?.[0] ?? null);
    } catch {
      showAlert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setImageAction(null);
    }
  };

  const handleSkipImage = async () => {
    if (!preAnalysisId || !token) return;
    setImageAction("skip");
    try {
      await fetch(`${API_BASE_URL}/api/ai/pre-analysis/${preAnalysisId}/reference-image/skip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setImageAction(null);
    setShowImageSelection(false);
    analysisStatusRef.current = "PROCESSING";
    setPollingTrigger((t) => t + 1);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
        {/* 헤더 */}
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 8 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <BackIcon width={11} height={19} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#000",
                  letterSpacing: -0.32,
                }}
              >
                물건 등록하기
              </Text>
            </View>
            <View style={{ width: 19 }} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 선택된 카테고리 표시 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: themeColor,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                {isFound ? "습득물" : "분실물"}
              </Text>
            </View>
            {categoryDisplay ? (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "#E5E7EB",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#434343" }}
                >
                  {categoryDisplay}
                </Text>
              </View>
            ) : null}
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
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#000" }}
                >
                  사진 등록
                </Text>
                <Text style={{ fontSize: 12, color: "#919191", marginLeft: 3 }}>
                  {photo ? "(1/1)" : "(0/1)"}
                </Text>
                {isFound ? (
                  <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#919191",
                      marginLeft: 2,
                    }}
                  >
                    {" (선택)"}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <InfoIcon width={11} height={11} />
                <Text style={{ fontSize: 12, color: "#919191", marginLeft: 4 }}>
                  물건의 특징이 잘 보이도록 사진을 등록해주세요.
                </Text>
              </View>
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
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: "#919191",
                    marginTop: 8,
                  }}
                >
                  사진 추가
                </Text>
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
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#919191",
                      marginTop: 8,
                    }}
                  >
                    사진 변경
                  </Text>
                </TouchableOpacity>
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
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#000" }}
                >
                  물건 설명
                </Text>
                {isFound ? (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#919191",
                      marginLeft: 4,
                    }}
                  >
                    {" "}
                    (선택)
                  </Text>
                ) : (
                  <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <InfoIcon width={11} height={11} />
                <Text style={{ fontSize: 12, color: "#919191", marginLeft: 4 }}>
                  AI가 물건을 더 잘 파악할 수 있도록 자세히 설명해주세요.
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 300,
                backgroundColor: "#E5E7EB",
                borderWidth: 1,
                borderColor: "#D9D9D9",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={
                  isFound
                    ? "예: 검은색 반지갑이에요. 소가죽 소재이고 표면 모서리가 약간 닳아있어요. 안에 카드가 몇 장 들어있어요."
                    : "예: 흰색 무선 이어폰이에요. 케이스 뒷면에 곰 스티커가 붙어있고 오른쪽 이어버드에 작은 흠집이 있어요."
                }
                placeholderTextColor="#919191"
                multiline
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: "#000",
                  padding: 0,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* CTA */}
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
            onPress={handleNext}
            disabled={analyzing}
            style={{
              backgroundColor: themeColor,
              height: 46,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "600",
                letterSpacing: -0.32,
              }}
            >
              다음
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI 분석 중 로딩 오버레이 */}
        {analyzing && !showImageSelection && (
          <AnalysisLoadingOverlay
            themeColor={themeColor}
            onCancel={() => {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setAnalyzing(false);
              setPreAnalysisId(null);
              preAnalysisIdRef.current = null;
              analysisStatusRef.current = "PROCESSING";
            }}
          />
        )}

        {/* 참고 이미지 선택 오버레이 */}
        {showImageSelection && (
          <ReferenceImageOverlay
            image={referenceImage}
            imageAction={imageAction}
            onUse={handleUseImage}
            onRefresh={handleRefreshImage}
            onSkip={handleSkipImage}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
