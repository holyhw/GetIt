import "../global.css";
import { Stack, useRouter } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

function BackButton({ to }: { to: "/" | "/post" }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.replace(to)} style={{ paddingHorizontal: 12 }}>
      <Text style={{ fontSize: 30 }}>←</Text>
    </TouchableOpacity>
  );
}

const screenOptions = {
  post: {
    title: "물건 정보 입력",
    headerLeft: () => <BackButton to="/" />,
  },
  result: {
    title: "결과",
    headerLeft: () => <BackButton to="/" />,
  },
};

export default function RootLayout() {
  if (Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#e5e7eb",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={
            {
              width: 390,
              height: "100%",
              maxHeight: 844,
              backgroundColor: "#fff",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              borderRadius: 40,
            } as any
          }
        >
          <Stack>
            <Stack.Screen name="index" options={{ title: "분실물 신고" }} />
            <Stack.Screen name="post" options={screenOptions.post} />
            <Stack.Screen name="result" options={screenOptions.result} />
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "분실물 신고" }} />
      <Stack.Screen name="post" options={screenOptions.post} />
      <Stack.Screen name="result" options={screenOptions.result} />
    </Stack>
  );
}
