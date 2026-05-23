import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import BellIcon from "../../assets/bell-icon.svg";
import ArrowRight from "../../assets/detail-arrow-right.svg";

const profileImage = require("../../assets/profile-placeholder.png");

const MENU_ITEMS = [
  "내 정보 관리",
  "설정",
  "공지사항",
  "FAQ",
  "고객센터",
  "서비스 이용 약관",
];

function MenuItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: "#E1E4ED",
      }}
    >
      <Text style={{ fontSize: 16, color: "#000" }}>{label}</Text>
      <View
        style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}
      >
        <ArrowRight width={5} height={9} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoggedIn, logout, userInfo, token } = useAuth();
  const [foundCount, setFoundCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      api.get<{ id: number }[]>("/api/registration/me?itemType=FOUND", token)
        .then((data) => setFoundCount(data.length)).catch(() => {});
      api.get<{ id: number }[]>("/api/registration/me?itemType=LOST", token)
        .then((data) => setLostCount(data.length)).catch(() => {});
    }, [token])
  );
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더: "마이페이지" centered, 벨 아이콘 right */}
      {/* Figma: title center y=84, bell at x=355(right:24) y=76 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 16,
        }}
      >
        <View style={{ flex: 1 }} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "500",
            color: "#000",
            letterSpacing: -0.32,
          }}
        >
          마이페이지
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => isLoggedIn ? router.push("/notification") : router.push("/login")}>
            <BellIcon width={16} height={18} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
      >
        {/* 프로필 카드: w=350, centered (marginHorizontal ≈ 21.5) */}
        {/* bg=white, border=#F1F3F7, borderRadius=8, h=191 */}
        <View
          style={{
            marginHorizontal: 22,
            backgroundColor: "#fff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#F1F3F7",
          }}
        >
          {/* 아바타 + 이름/이메일 행 */}
          <View
            style={{
              flexDirection: "row",
              paddingTop: 20,
              paddingHorizontal: 21,
              marginBottom: 20,
            }}
          >
            {/* 아바타 60×60 + 카메라 뱃지 (right:0, bottom:0) */}
            <View style={{ marginRight: 10 }}>
              <Image
                source={userInfo?.profileImageUrl ? { uri: userInfo.profileImageUrl } : profileImage}
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            </View>

            {/* 이름 + 로그아웃 + 이메일 */}
            <View style={{ flex: 1, paddingTop: 8, gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                  {userInfo?.name ?? ""}
                </Text>
                <TouchableOpacity onPress={() => { logout(); router.replace("/(tabs)"); }}>
                  <Text style={{ fontSize: 12, color: "#464646" }}>로그아웃</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, color: "#000" }}>
                {userInfo?.email ?? ""}
              </Text>
            </View>
          </View>

          {/* 통계 박스 2개: 등록한 습득물 / 등록한 분실물 */}
          {/* gap=10, 각 flex:1, py=20, borderRadius=8 */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 21,
              paddingBottom: 20,
            }}
          >
            {/* 습득물: bg=#F4F7FF, color=#1E3A5F */}
            <TouchableOpacity
              onPress={() => router.push("/myitems?type=found")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: "#F4F7FF",
                borderRadius: 8,
                paddingVertical: 20,
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E3A5F" }}>
                {foundCount}
              </Text>
              <Text style={{ fontSize: 12, color: "#1E3A5F" }}>등록한 습득물</Text>
            </TouchableOpacity>

            {/* 분실물: bg=#FFF7EF, color=#FF7A00 */}
            <TouchableOpacity
              onPress={() => router.push("/myitems?type=lost")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: "#FFF7EF",
                borderRadius: 8,
                paddingVertical: 20,
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#FF7A00" }}>
                {lostCount}
              </Text>
              <Text style={{ fontSize: 12, color: "#FF7A00" }}>등록한 분실물</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 메뉴 리스트: w=345 → marginHorizontal=24 ((393-345)/2=24) */}
        {/* 각 항목: h=56, borderBottom 0.5px #E1E4ED, text 16px, arrow 20×20 */}
        <View style={{ marginHorizontal: 24, marginTop: 20 }}>
          {MENU_ITEMS.map((label) => (
            <MenuItem
              key={label}
              label={label}
              onPress={label === "내 정보 관리" ? () => router.push("/myinfo") : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
