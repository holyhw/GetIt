import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function OAuthRedirect() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ accessToken?: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (Platform.OS === "web") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("accessToken");
      if (!token) return;
      login(token).then(() => router.replace("/(tabs)"));
      return;
    }

    const raw = params.accessToken;
    const token = Array.isArray(raw) ? raw[0] : (raw ?? null);
    if (!token) return;
    login(token).then(() => router.replace("/(tabs)"));
  }, [mounted, params.accessToken]);

  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: "#F5F7FA" }} />;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
