import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackIcon from "../assets/myinfo-back.svg";
import RequiredDot from "../assets/reg-required.svg";
import PinIcon from "../assets/reg-pin.svg";
import CalendarIcon from "../assets/reg-calendar.svg";
import ArrowRight from "../assets/detail-arrow-right.svg";
import { useAuth } from "../context/AuthContext";
import { matchStore } from "../utils/matchStore";
import { registerStore } from "../utils/registerStore";
import type { PreAnalysisStatus } from "../types/preAnalysis";
import {
  LocationSearchModal,
  type SelectedPlace,
} from "../components/LocationSearchModal";

const API_BASE_URL = "https://api.getitsju.com";
const DateTimePicker =
  Platform.OS !== "web"
    ? require("@react-native-community/datetimepicker").default
    : null;

const MATCHING_MESSAGES = [
  "분실물 정보 분석 중...",
  "유사한 습득물 검색 중...",
  "매칭 결과 생성 중...",
];

function MatchingLoadingOverlay({ onCancel }: { onCancel: () => void }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const radarAnim = Animated.loop(
      Animated.stagger(
        700,
        [ring1, ring2, ring3].map((ring) =>
          Animated.sequence([
            Animated.timing(ring, {
              toValue: 1,
              duration: 2100,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(ring, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );
    radarAnim.start();

    let idx = 0;
    const cycleText = () => {
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        idx = (idx + 1) % MATCHING_MESSAGES.length;
        setMsgIndex(idx);
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start();
      });
    };
    const interval = setInterval(cycleText, 2100);

    return () => {
      radarAnim.stop();
      clearInterval(interval);
    };
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10,18,42,0.97)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {/* Radar rings */}
      <View
        style={{
          width: 220,
          height: 220,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[ring1, ring2, ring3].map((ring, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 110,
              borderWidth: 1.5,
              borderColor: "#FF7A00",
              opacity: ring.interpolate({
                inputRange: [0, 0.08, 0.65, 1],
                outputRange: [0, 0.75, 0.25, 0],
              }),
              transform: [
                {
                  scale: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.12, 1],
                  }),
                },
              ],
            }}
          />
        ))}
        {/* Center badge */}
        <View
          style={{
            width: 82,
            height: 82,
            borderRadius: 41,
            backgroundColor: "#FF7A00",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#FF7A00",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 28,
            elevation: 14,
          }}
        >
          <Text style={{ fontSize: 36 }}>🔍</Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#ffffff",
          marginTop: 36,
          letterSpacing: -0.5,
        }}
      >
        분실물 매칭 중
      </Text>
      <Animated.Text
        style={{
          fontSize: 14,
          color: "#FF7A00",
          marginTop: 10,
          letterSpacing: -0.3,
          opacity: textOpacity,
        }}
      >
        {MATCHING_MESSAGES[msgIndex]}
      </Animated.Text>
      <Text
        style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 8 }}
      >
        잠시만 기다려주세요
      </Text>
      <Text
        style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 32, textAlign: "center", letterSpacing: -0.2 }}
      >
        나가도 결과는 알림으로 알려드려요
      </Text>
      <TouchableOpacity
        onPress={onCancel}
        style={{
          marginTop: 12,
          paddingHorizontal: 28,
          paddingVertical: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.25)",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>홈으로</Text>
      </TouchableOpacity>
    </View>
  );
}

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

function InputRow({
  label,
  required,
  optional,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  multiline,
  height = 44,
}: InputRowProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#000" }}>
          {label}
        </Text>
        {required && (
          <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
        )}
        {optional && (
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#919191",
              marginLeft: 4,
            }}
          >
            {" (선택)"}
          </Text>
        )}
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
          paddingHorizontal: 14,
        }}
      >
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#919191"
          multiline={multiline}
          style={{
            flex: 1,
            fontSize: 14,
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


export default function RegisterDetailScreen() {
  const router = useRouter();
  const {
    type,
    majorCategory,
    minorCategory,
    text: initialText,
    preAnalysisId: preAnalysisIdParam,
    referenceImageUrl,
    skipImage,
  } = useLocalSearchParams<{
    type: "found" | "lost";
    majorCategory: string;
    minorCategory: string;
    text: string;
    preAnalysisId?: string;
    referenceImageUrl?: string;
    skipImage?: string;
  }>();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preAnalysisId, setPreAnalysisId] = useState<number | null>(null);
  const preAnalysisIdRef = useRef<number | null>(null);
  const [analysisStatus, setAnalysisStatus] =
    useState<PreAnalysisStatus>("PROCESSING");
  const analysisStatusRef = useRef<PreAnalysisStatus>("PROCESSING");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollingTrigger, setPollingTrigger] = useState(0);

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";
  const dateLabel = date
    ? date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(/\.$/, "")
    : "날짜를 선택해주세요";

  // 마운트 시 pre-analysis 처리
  useEffect(() => {
    if (!token) return;

    // 이미지 선택 후 넘어온 경우: 백그라운드로 API 호출 후 폴링
    if (preAnalysisIdParam && (referenceImageUrl || skipImage)) {
      const id = parseInt(preAnalysisIdParam);
      preAnalysisIdRef.current = id;
      setPreAnalysisId(id);
      registerStore.clear();
      const url = referenceImageUrl
        ? `${API_BASE_URL}/api/ai/pre-analysis/${id}/reference-image`
        : `${API_BASE_URL}/api/ai/pre-analysis/${id}/reference-image/skip`;
      const options: RequestInit = referenceImageUrl
        ? { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: decodeURIComponent(referenceImageUrl) }) }
        : { method: "POST", headers: { Authorization: `Bearer ${token}` } };
      fetch(url, options).catch(() => {});
      return;
    }

    // register-photo에서 이미 분석 완료된 경우
    if (preAnalysisIdParam) {
      const id = parseInt(preAnalysisIdParam);
      preAnalysisIdRef.current = id;
      setPreAnalysisId(id);
      analysisStatusRef.current = "COMPLETED";
      setAnalysisStatus("COMPLETED");
      registerStore.clear();
      return;
    }

    const photo = registerStore.getPhoto();
    registerStore.clear();

    const startAnalysis = async () => {
      try {
        const formData = new FormData();
        formData.append("itemType", type === "found" ? "FOUND" : "LOST");
        if (majorCategory?.trim())
          formData.append("majorCategory", majorCategory.trim());
        if (minorCategory?.trim())
          formData.append("minorCategory", minorCategory.trim());
        if (initialText?.trim()) formData.append("text", initialText.trim());
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
        console.log("[pre-analysis] 초기 응답:", JSON.stringify(data.result, null, 2));
        const id: number = data.result.id;
        const initialStatus: PreAnalysisStatus = data.result.status;
        preAnalysisIdRef.current = id;
        setPreAnalysisId(id);
        if (initialStatus !== "PROCESSING") {
          analysisStatusRef.current = initialStatus;
          setAnalysisStatus(initialStatus);
        }
      } catch {
        analysisStatusRef.current = "FAILED";
        setAnalysisStatus("FAILED");
      }
    };

    startAnalysis();
  }, [token]);

  // preAnalysisId 확보되면 폴링 시작
  useEffect(() => {
    if (!preAnalysisId || !token) return;
    if (analysisStatusRef.current !== "PROCESSING") return;

    const poll = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ai/pre-analysis/${preAnalysisId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        console.log("[pre-analysis] 폴링 응답:", JSON.stringify(data.result, null, 2));
        const status: PreAnalysisStatus = data.result.status;
        if (status === "COMPLETED" || status === "FAILED") {
          analysisStatusRef.current = status;
          setAnalysisStatus(status);
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
        }
      } catch {}
    };

    poll();
    pollingRef.current = setInterval(poll, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [preAnalysisId, token, pollingTrigger]);

  const waitForPreAnalysisId = (): Promise<number | null> =>
    new Promise((resolve) => {
      if (
        preAnalysisIdRef.current !== null ||
        analysisStatusRef.current === "FAILED"
      ) {
        resolve(preAnalysisIdRef.current);
        return;
      }
      const interval = setInterval(() => {
        if (
          preAnalysisIdRef.current !== null ||
          analysisStatusRef.current === "FAILED"
        ) {
          clearInterval(interval);
          resolve(preAnalysisIdRef.current);
        }
      }, 500);
    });

  const waitForAnalysis = (): Promise<PreAnalysisStatus> =>
    new Promise((resolve) => {
      if (analysisStatusRef.current !== "PROCESSING") {
        resolve(analysisStatusRef.current);
        return;
      }
      const interval = setInterval(() => {
        if (analysisStatusRef.current !== "PROCESSING") {
          clearInterval(interval);
          resolve(analysisStatusRef.current);
        }
      }, 500);
    });

  const handleSubmit = async () => {
    if (!token) return;
    if (!title.trim()) {
      Alert.alert("제목을 입력해주세요.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("위치를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      let pId = preAnalysisIdRef.current;
      if (pId === null) {
        pId = await waitForPreAnalysisId();
      }
      if (pId === null) {
        Alert.alert("AI 분석 실패", "처음으로 돌아가 다시 시도해주세요.");
        return;
      }

      let status = analysisStatusRef.current;
      if (status === "PROCESSING") {
        status = await waitForAnalysis();
      }
      if (status === "FAILED") {
        Alert.alert("AI 분석 실패", "처음으로 돌아가 다시 시도해주세요.");
        return;
      }

      const body: Record<string, string | number> = {
        title: title.trim(),
        majorCategory: majorCategory ?? "",
        minorCategory: minorCategory ?? "",
        location: location.trim(),
        ...(selectedPlace && {
          latitude: selectedPlace.lat,
          longitude: selectedPlace.lng,
        }),
      };
      if (date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        body.occurredDate = `${y}-${m}-${d}`;
      }
      if (initialText?.trim()) body.description = initialText.trim();

      const path = isFound
        ? `/api/ai/pre-analysis/${pId}/registration/found`
        : `/api/ai/pre-analysis/${pId}/registration/lost`;

      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`오류: ${res.status}`);
      const data = await res.json();

      if (isFound) {
        router.replace(`/detail?id=${data.result.id}&type=found`);
      } else {
        matchStore.set({ matchResults: data.result.matchResults });
        router.replace("/top5?fromRegistration=true");
      }
    } catch (e: any) {
      Alert.alert("등록 실패", e.message ?? "잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
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
            <TouchableOpacity onPress={() => router.back()}>
              <BackIcon width={11} height={19} />
            </TouchableOpacity>
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                alignItems: "center",
              }}
              pointerEvents="none"
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#000",
                  letterSpacing: -0.32,
                }}
              >
                물건 정보 입력
              </Text>
            </View>
            <View style={{ flex: 1 }} />
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
          {/* 등록 유형 표시 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
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
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
                {isFound ? "습득물 등록" : "분실물 등록"}
              </Text>
            </View>
          </View>

          {/* 폼 */}
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
            <InputRow
              label="제목"
              required
              value={title}
              onChangeText={setTitle}
              placeholder="예: 검은색 Kodak 모자"
            />

            {/* 위치 */}
            <View style={{ marginBottom: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#000" }}
                >
                  {isFound ? "습득 위치" : "분실 위치"}
                </Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>
              <TouchableOpacity
                onPress={() => setShowLocationModal(true)}
                style={{
                  height: 44,
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
                <Text
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: location ? "#000" : "#919191",
                  }}
                >
                  {location || "위치를 검색해주세요"}
                </Text>
                <ArrowRight width={5} height={9} />
              </TouchableOpacity>
            </View>

            {/* 날짜 */}
            <View style={{ marginBottom: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#000" }}
                >
                  {isFound ? "습득 날짜" : "분실 날짜"}
                </Text>
                <RequiredDot width={5} height={5} style={{ marginLeft: 2 }} />
              </View>

              {Platform.OS === "web" ? (
                <View
                  style={{
                    height: 44,
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
                  <CalendarIcon
                    width={10}
                    height={11}
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="date"
                    value={date ? date.toISOString().split("T")[0] : ""}
                    onChange={(e: any) =>
                      e.target.value
                        ? setDate(new Date(e.target.value))
                        : setDate(null)
                    }
                    style={
                      {
                        flex: 1,
                        fontSize: 12,
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        color: date ? "#000" : "#919191",
                        fontFamily: "inherit",
                      } as any
                    }
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setTempDate(date ?? new Date());
                      setShowPicker(true);
                    }}
                    style={{
                      height: 44,
                      backgroundColor: "#E5E7EB",
                      borderWidth: 1,
                      borderColor: "#D9D9D9",
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <CalendarIcon
                      width={10}
                      height={11}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: date ? "#000" : "#919191",
                      }}
                    >
                      {dateLabel}
                    </Text>
                    <ArrowRight width={5} height={9} />
                  </TouchableOpacity>

                  {Platform.OS === "android" &&
                    DateTimePicker &&
                    showPicker && (
                      <DateTimePicker
                        value={date ?? new Date()}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event: any, selected?: Date) => {
                          setShowPicker(false);
                          if (selected) setDate(new Date(selected));
                        }}
                      />
                    )}
                </>
              )}
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
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: themeColor,
              height: 46,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "600",
                  letterSpacing: -0.32,
                }}
              >
                {isFound ? "습득물 등록하기" : "분실물 등록하기"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <LocationSearchModal
          visible={showLocationModal}
          onSelect={(place) => {
            setSelectedPlace(place);
            setLocation(place.name);
          }}
          onClose={() => setShowLocationModal(false)}
        />

        {/* 분실물 매칭 로딩 오버레이 */}
        {loading && !isFound && <MatchingLoadingOverlay onCancel={() => { setLoading(false); router.replace("/(tabs)"); }} />}

        {/* iOS 날짜 피커 바텀시트 */}
        {Platform.OS === "ios" && showPicker && DateTimePicker && (
          <>
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
              onPress={() => setShowPicker(false)}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#fff",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 34,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#D9D9D9",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginTop: 12,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingHorizontal: 20,
                  paddingTop: 8,
                  paddingBottom: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setDate(tempDate);
                    setShowPicker(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: themeColor,
                      fontWeight: "600",
                    }}
                  >
                    완료
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center", width: "100%" }}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  style={{ height: 216 }}
                  locale="ko"
                  onChange={(event: any, selected?: Date) => {
                    if (selected) setTempDate(new Date(selected));
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
