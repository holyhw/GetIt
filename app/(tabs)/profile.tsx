import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Svg, { Circle, Path } from "react-native-svg";
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
  const { isLoggedIn, logout, userInfo } = useAuth();
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
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 23,
                  height: 23,
                  borderRadius: 11.5,
                  backgroundColor: "#F5F7FA",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Svg width={11} height={10} viewBox="0 0 11 10" fill="none">
                  <Path d="M10.3177 1.20168H7.505L7.38615 0.532613C7.38615 0.237695 7.14846 0 6.85354 0H4.14206C3.84714 0 3.60944 0.237695 3.60944 0.532613L3.5126 1.20168H0.677872C0.303722 1.20168 0 1.5054 0 1.87955V8.83433C0 9.20848 0.303722 9.5122 0.677872 9.5122H10.3221C10.6963 9.5122 11 9.20848 11 8.83433V1.87955C10.9956 1.5098 10.6919 1.20168 10.3177 1.20168ZM5.4934 7.94077C4.06723 7.94077 2.90956 6.78311 2.90956 5.35694C2.90956 3.93077 4.06723 2.77311 5.4934 2.77311C6.91957 2.77311 8.07723 3.93077 8.07723 5.35694C8.07723 6.78751 6.91957 7.94077 5.4934 7.94077ZM8.98399 2.91397C8.7419 2.91397 8.54382 2.71589 8.54382 2.47379C8.54382 2.23169 8.7419 2.03361 8.98399 2.03361C9.22609 2.03361 9.42417 2.23169 9.42417 2.47379C9.42417 2.71589 9.22609 2.91397 8.98399 2.91397Z" fill="#919191" />
                  <Path d="M7.59305 5.36111C7.59305 6.52318 6.65107 7.46075 5.49341 7.46075C4.33575 7.46075 3.39377 6.51878 3.39377 5.36111C3.39377 4.20345 4.33575 3.26147 5.49341 3.26147C6.65107 3.26147 7.59305 4.19905 7.59305 5.36111Z" fill="#919191" />
                </Svg>
              </View>
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
                0
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
                0
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
