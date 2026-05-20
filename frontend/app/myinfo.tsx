import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import MyInfoBackIcon from "../assets/myinfo-back.svg";
import MyInfoCameraIcon from "../assets/myinfo-camera.svg";
import MyInfoNaverIcon from "../assets/myinfo-naver.svg";
import MyInfoKakaoIcon from "../assets/myinfo-kakao.svg";
import MyInfoGoogleIcon from "../assets/myinfo-google.svg";
import MyInfoCheckIcon from "../assets/myinfo-check.svg";
import MyInfoArrowIcon from "../assets/myinfo-arrow.svg";

const profileImage = require("../assets/profile-placeholder.png");

export default function MyInfoScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더: 뒤로가기 | 내 정보 관리 | 저장 */}
      {/* Figma: 모든 요소 center y=84, 저장버튼 y=71 h=26 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MyInfoBackIcon width={11} height={19} />
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
            내 정보 관리
          </Text>
        </View>

        {/* 저장 버튼: w=46, h=26, bg=#1E3A5F, borderRadius=13 */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            backgroundColor: "#1E3A5F",
            width: 46,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 프로필 사진 + 이름 + 이메일 */}
        {/* Figma: avatar top=120 (header ~96 + gap 24), 120×120 centered */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
          {/* 아바타 + 카메라 뱃지 (right:0, bottom:0) */}
          <View style={{ marginBottom: 14 }}>
            <Image
              source={profileImage}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
            <View style={{ position: "absolute", right: 0, bottom: 0 }}>
              <MyInfoCameraIcon width={36} height={36} />
            </View>
          </View>

          {/* 이름: 20px SemiBold, Figma center y=265 (name ~25px below avatar bottom) */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            홍길동
          </Text>

          {/* 이메일: 14px Regular, #757575 */}
          <Text style={{ fontSize: 14, color: "#757575" }}>
            baroyeogi@email.com
          </Text>
        </View>

        {/* 프로필 섹션 */}
        {/* Figma: label y=326, row y=341 h=46 w=345 left=24 */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#757575",
              letterSpacing: -0.32,
              marginBottom: 8,
            }}
          >
            프로필
          </Text>

          {/* 닉네임 입력 행: bg=white, border #D9D9D9, borderRadius=15, h=46 */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#D9D9D9",
              borderRadius: 15,
              height: 46,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "600",
                color: "#434343",
                letterSpacing: -0.32,
              }}
            >
              닉네임
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#757575",
                letterSpacing: -0.32,
                marginRight: 8,
              }}
            >
              홍길동
            </Text>
            <MyInfoArrowIcon width={6} height={10} />
          </TouchableOpacity>
        </View>

        {/* 연결된 계정 섹션 */}
        {/* Figma: label y=418, rows y=434/490/546, each h=57 w=345 */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#757575",
              letterSpacing: -0.32,
              marginBottom: 8,
            }}
          >
            연결된 계정
          </Text>

          {/* 카카오: 첫 행 rounded top 15, 주 계정 + 체크 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#D9D9D9",
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              height: 57,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <MyInfoKakaoIcon width={25} height={25} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#434343",
                marginLeft: 12,
                letterSpacing: -0.32,
              }}
            >
              카카오
            </Text>
            {/* 주 계정 뱃지: bg=#F4F7FF, text #1E3A5F 10px, w=38 h=16 */}
            <View
              style={{
                marginLeft: 8,
                backgroundColor: "#F4F7FF",
                borderRadius: 8,
                width: 38,
                height: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#1E3A5F" }}>
                주 계정
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <MyInfoCheckIcon width={15} height={11} />
          </View>

          {/* 네이버: 중간 행, top border 없음 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#D9D9D9",
              borderTopWidth: 0,
              height: 57,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <MyInfoNaverIcon width={25} height={25} />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#434343",
                  letterSpacing: -0.32,
                }}
              >
                네이버
              </Text>
              <Text style={{ fontSize: 10, color: "#757575" }}>연결되지 않음</Text>
            </View>
          </View>

          {/* Google: 마지막 행, rounded bottom 15, top border 없음 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#D9D9D9",
              borderTopWidth: 0,
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 15,
              height: 57,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            {/* Google 아이콘: 흰색 보더 박스(25×25, borderRadius 3) 안에 G icon */}
            <View
              style={{
                width: 25,
                height: 25,
                borderWidth: 1,
                borderColor: "#D9D9D9",
                borderRadius: 3,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MyInfoGoogleIcon width={15} height={15} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#434343",
                  letterSpacing: -0.32,
                }}
              >
                Google
              </Text>
              <Text style={{ fontSize: 10, color: "#757575" }}>연결되지 않음</Text>
            </View>
          </View>
        </View>

        {/* 회원탈퇴: 우측 정렬, Figma: right:24, y=622 */}
        <View
          style={{ alignItems: "flex-end", paddingHorizontal: 24, marginTop: 20 }}
        >
          <TouchableOpacity>
            <Text
              style={{ fontSize: 12, fontWeight: "600", color: "#EF4444" }}
            >
              회원탈퇴
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
