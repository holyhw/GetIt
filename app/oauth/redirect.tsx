import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function OAuthRedirect() {
  const { login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");
    if (!token) return;
    login(token).then(() => router.replace("/(tabs)"));
  }, []);

  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: "#F5F7FA" }} />;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
