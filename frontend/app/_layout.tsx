import "../global.css";
import { Stack } from "expo-router";
import { Platform, View } from "react-native";

function PhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" }}>
      <View
        style={
          {
            width: 393,
            height: "100%",
            maxHeight: 852,
            backgroundColor: "#fff",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            borderRadius: 40,
          } as any
        }
      >
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PhoneFrame>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail" options={{ headerShown: false }} />
        <Stack.Screen name="myinfo" options={{ headerShown: false }} />
        <Stack.Screen name="myitems" options={{ headerShown: false }} />
        <Stack.Screen name="chatroom" options={{ headerShown: false }} />
        <Stack.Screen name="top5" options={{ headerShown: false }} />
        <Stack.Screen name="notification" options={{ headerShown: false }} />
      </Stack>
    </PhoneFrame>
  );
}
