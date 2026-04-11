import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "분실물 신고" }} />
      <Stack.Screen name="post" options={{ title: "물건 정보 입력" }} />
      <Stack.Screen name="result" options={{ title: "결과" }} />
    </Stack>
  );
}