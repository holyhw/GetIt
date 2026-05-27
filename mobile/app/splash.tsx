import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import GetItLogo from "../assets/getit-logo.svg";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/(tabs)"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", alignItems: "center", justifyContent: "center" }}>
      <GetItLogo width="46%" height={120} />
    </View>
  );
}
