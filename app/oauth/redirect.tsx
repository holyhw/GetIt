import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function OAuthRedirect() {
  const params = useLocalSearchParams<{ accessToken?: string }>();
  const { login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = Array.isArray(params.accessToken)
      ? params.accessToken[0]
      : params.accessToken;

    if (!token) return;

    if (Platform.OS === "web") {
      login(token).then(() => router.replace("/(tabs)"));
    } else {
      // 네이티브 딥링크 직접 진입
      login(token).then(() => router.replace("/(tabs)"));
    }
  }, [mounted, params.accessToken]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
