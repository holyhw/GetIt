import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import DetailBackIcon from "../assets/detail-back.svg";
import DetailShareIcon from "../assets/detail-share.svg";
import DetailMoreIcon from "../assets/detail-more.svg";
import DetailChatIcon from "../assets/detail-chat.svg";
import DetailPinIcon from "../assets/detail-pin.svg";
import DetailArrowIcon from "../assets/detail-arrow-right.svg";
import Top5DetailIcon from "../assets/top5-detail.svg";

const capImage = require("../assets/cap.jpg");
const profileImage = require("../assets/profile-placeholder.png");
const mapImage = require("../assets/map-placeholder.jpg");

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#E5E5E5" }} />;
}

function OverlayButton({
  left,
  children,
  onPress,
}: {
  left: number;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ position: "absolute", top: 59, left, zIndex: 10 }}
    >
      {children}
    </TouchableOpacity>
  );
}

function DarkBtn({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.59)",
        borderRadius: 10,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

export default function DetailScreen() {
  const router = useRouter();
  const { type, matchStatus } = useLocalSearchParams<{
    type?: "found" | "lost";
    matchStatus?: "pending" | "complete";
  }>();
  const isMatchComplete = matchStatus === "complete";

  // 습득(found): navy 버튼, "이 물건 제 것 같아요", 날짜 "습득", 주소 화살표 O
  // 분실(lost):  orange 버튼, "이 물건을 주운 것 같아요", 날짜 "분실", 주소 화살표 X
  const isLost = type === "lost";
  const ctaColor = isLost ? "#FF7A00" : "#1E3A5F";
  const ctaText = isLost ? "이 물건을 주운 것 같아요" : "이 물건 제 것 같아요";
  const dateLabel = isLost ? "2026.04.22 분실" : "2026.04.22 습득";
  const descAction = isLost ? "분실했습니다" : "습득했습니다";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 오버레이 버튼 3개 (스크롤 위에 고정) */}
      <OverlayButton left={24} onPress={() => router.back()}>
        <DetailBackIcon width={30} height={30} />
      </OverlayButton>
      <OverlayButton left={293}>
        <DarkBtn>
          <DetailShareIcon width={13} height={15} />
        </DarkBtn>
      </OverlayButton>
      <OverlayButton left={339}>
        <DarkBtn>
          <DetailMoreIcon width={14} height={4} />
        </DarkBtn>
      </OverlayButton>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 히어로 이미지: 393×317 */}
        <Image
          source={capImage}
          style={{ width: "100%", height: 317 }}
          resizeMode="cover"
        />

        {/* 컨텐츠 카드 */}
        <View
          style={{
            marginHorizontal: 4,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#F5F7FA",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* 카테고리 태그 */}
          <View
            style={{
              backgroundColor: "#E5E5E5",
              borderRadius: 20,
              width: 55,
              height: 27,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#000" }}>모자</Text>
          </View>

          {/* 제목 */}
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 22 }}>
            Kodak 검은색 모자
          </Text>

          <Divider />

          {/* 프로필 */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
            <Image
              source={profileImage}
              style={{ width: 45, height: 45, borderRadius: 22.5 }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>홍길동</Text>
              <Text style={{ fontSize: 10, color: "#464646", marginTop: 4 }}>
                {dateLabel}
              </Text>
            </View>
          </View>

          <Divider />

          {/* 상세 설명 */}
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: "#000", marginTop: 16, marginBottom: 8 }}
          >
            상세 설명
          </Text>
          <Text style={{ fontSize: 12, color: "#434343", lineHeight: 16, marginBottom: 8 }}>
            {`강남역 4번 출구 근처에서 검은색 Kodak 모자를 ${descAction}.\n모자 앞면에는 노란색 패치에 빨간색으로 Kodak이라고 적혀있습니다.`}
          </Text>
          <Text style={{ fontSize: 12, color: "#434343", lineHeight: 16, marginBottom: 16 }}>
            챙 부분은 약간 휘어 있는 일반적인 볼캡 형태이고, 사이즈 조절이 가능한 스트랩이
            뒤쪽에 달려 있습니다. 분실하신 분은 모자의 추가적인 특징을 말씀해 주시면 확인
            후 전달해 드리겠습니다.
          </Text>

          <Divider />

          {/* 습득 위치 */}
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: "#000", marginTop: 16, marginBottom: 18 }}
          >
            습득 위치
          </Text>

          {/* 지도 + 주소바 */}
          <View
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View
              style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden", height: 74 }}
            >
              <Image
                source={mapImage}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>

            {/* 주소바: 분실 화면은 화살표 없음 */}
            <View
              style={{
                backgroundColor: "#F5F7FA",
                height: 33,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
              }}
            >
              <DetailPinIcon width={9} height={11} />
              <Text style={{ flex: 1, marginLeft: 7, fontSize: 10, color: "#000" }}>
                강남역 신분당선 4번출구
              </Text>
              {!isLost && <DetailArrowIcon width={5} height={9} />}
            </View>
          </View>
          <Divider />

          {/* AI 매칭 섹션 */}
          <View style={{ marginTop: 16 }}>
            {/* 섹션 헤더: 타이틀 + 상태 dot+텍스트 */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>AI 매칭</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: isLost ? "#FF7A00" : "#1E3A5F",
                  }}
                />
                <Text style={{ fontSize: 11, fontWeight: "600", color: isLost ? "#FF7A00" : "#1E3A5F", letterSpacing: -0.32 }}>
                  {isMatchComplete ? "매칭 완료" : "분석 중"}
                </Text>
              </View>
            </View>

            {/* 상태 카드 */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#000", marginBottom: 4, letterSpacing: -0.32 }}>
                  {isMatchComplete
                    ? "유사도 Top5 결과가 준비됐어요!"
                    : isLost
                    ? "등록된 습득물과 유사도 분석 중..."
                    : "등록된 분실물과 유사도 분석 중..."}
                </Text>
                <Text style={{ fontSize: 11, color: "#757575", lineHeight: 15, letterSpacing: -0.32 }}>
                  {isMatchComplete
                    ? "AI가 선정한 가장 유사한 5개 습득물을\n확인해 보세요."
                    : "잠시 후 AI 매칭 결과를 확인할 수\n있어요."}
                </Text>
              </View>

              {/* 결과 보기 버튼 */}
              <TouchableOpacity
                activeOpacity={isMatchComplete ? 0.8 : 1}
                disabled={!isMatchComplete}
                onPress={() => isMatchComplete && router.push("/top5")}
                style={{
                  backgroundColor: isMatchComplete ? (isLost ? "#FF7A00" : "#1E3A5F") : "#D9D9D9",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Top5DetailIcon
                  width={11}
                  height={13}
                  style={{ opacity: isMatchComplete ? 1 : 0.5 }}
                />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>
                  결과 보기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 CTA: 색상/텍스트 타입별 분기 */}
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
          <DetailChatIcon width={18} height={18} />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            {ctaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
