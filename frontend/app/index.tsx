import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const handleSelect = (type: "finder" | "loser") => {
    router.push({ pathname: "/post", params: { type } });
  };

  return (
    <View className="flex-1 bg-white justify-center px-6 gap-5">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
        어떤 분이신가요?
      </Text>

      {/* 습득자 */}
      <TouchableOpacity
        onPress={() => handleSelect("finder")}
        className="bg-blue-500 rounded-2xl p-8 items-center shadow-md"
        activeOpacity={0.85}
      >
        <Text className="text-5xl mb-3">🔍</Text>
        <Text className="text-white text-xl font-bold">습득자</Text>
        <Text className="text-blue-100 text-sm mt-1">물건을 주우셨나요?</Text>
      </TouchableOpacity>

      {/* 분실자 */}
      <TouchableOpacity
        onPress={() => handleSelect("loser")}
        className="bg-orange-400 rounded-2xl p-8 items-center shadow-md"
        activeOpacity={0.85}
      >
        <Text className="text-5xl mb-3">😢</Text>
        <Text className="text-white text-xl font-bold">분실자</Text>
        <Text className="text-orange-100 text-sm mt-1">물건을 잃어버리셨나요?</Text>
      </TouchableOpacity>
    </View>
  );
}
