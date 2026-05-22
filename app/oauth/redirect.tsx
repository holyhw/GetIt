import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function OAuthRedirect() {
  const { accessToken } = useLocalSearchParams<{ accessToken: string }>();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;

    const token = Array.isArray(accessToken) ? accessToken[0] : accessToken;

    if (Platform.OS === "web") {
      // 네이티브 앱이 openAuthSessionAsync로 열었을 경우 딥링크로 토큰 전달
      try {
        window.location.href = `getit://oauth/redirect?accessToken=${token}`;
      } catch {}

      // 일반 웹 브라우저 fallback
      setTimeout(async () => {
        await login(token);
        router.replace("/(tabs)");
      }, 300);
    } else {
      // 네이티브 딥링크로 직접 진입
      login(token).then(() => {
        router.replace("/(tabs)");
      });
    }
  }, [accessToken]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
