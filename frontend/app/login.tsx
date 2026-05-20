import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import GetItLogo from "../assets/getit-logo.svg";
import KakaoIcon from "../assets/kakao-icon.svg";
import NaverIcon from "../assets/naver-icon.svg";
import GoogleIcon from "../assets/google-icon.svg";
import BackArrow from "../assets/back-arrow.svg";

export default function Login() {
  const router = useRouter();
  const handleLogin = () => { router.replace("/(tabs)"); };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 뒤로가기 */}
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : null}
        style={{ position: "absolute", top: 60, left: 24, zIndex: 10, padding: 4 }}
      >
        <BackArrow width={10} height={18} />
      </TouchableOpacity>

      {/* 로고 */}
      <View style={{ alignItems: "center", marginTop: 262 }}>
        <GetItLogo width="46%" height={120} />
      </View>

      {/* 하단 버튼 영역 */}
      <View style={{ position: "absolute", bottom: 72, left: 24, right: 24 }}>
        {/* 구분선 */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#D9D9D9" }} />
          <Text style={{ marginHorizontal: 12, color: "#919191", fontSize: 12, fontWeight: "600" }}>
            로그인/회원가입
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#D9D9D9" }} />
        </View>

        {/* 카카오 */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#FEE500",
            height: 48,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <KakaoIcon width={20} height={20} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#3C1E1E" }}>카카오 로그인</Text>
        </TouchableOpacity>

        {/* 네이버 */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#03C75A",
            height: 48,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <NaverIcon width={20} height={20} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>네이버 로그인</Text>
        </TouchableOpacity>

        {/* 구글 */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#fff",
            height: 48,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <GoogleIcon width={18} height={18} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1E3A5F" }}>구글 로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
