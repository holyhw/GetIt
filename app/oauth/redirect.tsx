import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function OAuthRedirect() {
  const params = useLocalSearchParams<{ accessToken?: string }>();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = Array.isArray(params.accessToken)
      ? params.accessToken[0]
      : params.accessToken;

    if (!token) return;

    login(token).then(() => router.replace("/(tabs)"));
  }, [params.accessToken]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
