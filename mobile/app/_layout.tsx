import "../global.css";
import { Stack, useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { setUnauthorizedHandler } from "../utils/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AuthHandler() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      router.replace("/login");
    });
  }, [logout, router]);

  return null;
}

function NotificationNavigator() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (data?.targetType === "REGISTRATION" && data?.targetId) {
        router.push(`/detail?id=${data.targetId}`);
      } else {
        router.push("/notification");
      }
    });
    return () => responseListener.current?.remove();
  }, [router]);

  return null;
}

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
    <AuthProvider>
    <AuthHandler />
    <NotificationNavigator />
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
        <Stack.Screen name="edit" options={{ headerShown: false }} />
        <Stack.Screen name="register-photo" options={{ headerShown: false }} />
        <Stack.Screen name="register-detail" options={{ headerShown: false }} />
        <Stack.Screen name="oauth/redirect" options={{ headerShown: false }} />
      </Stack>
    </PhoneFrame>
    </AuthProvider>
  );
}
