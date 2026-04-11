import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

type MatchResult = {
  registrationId: number;
  description: string;
  imageUrl: string;
  similarity: number;
  explanation: string;
  rank: number;
};

export default function Result() {
  const router = useRouter();
  const { response } = useLocalSearchParams<{ response: string }>();

  const parsed = response ? JSON.parse(response) : null;
  const matchResults: MatchResult[] = parsed?.result?.matchResults ?? [];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">매칭 결과</Text>

        {matchResults.length === 0 ? (
          <View className="bg-gray-100 rounded-xl p-6 items-center">
            <Text className="text-gray-400 text-base">일치하는 습득물이 없습니다.</Text>
          </View>
        ) : (
          matchResults.map((item) => (
            <View key={item.registrationId} className="mb-4 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
              {/* 이미지 */}
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} className="w-full h-48" resizeMode="cover" /> : null}

              <View className="p-4">
                {/* 순위 + 유사도 */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-blue-500 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">#{item.rank}위</Text>
                  </View>
                  <Text className="text-sm font-semibold text-blue-500">유사도 {Math.round(item.similarity * 100)}%</Text>
                </View>

                {/* 물건 설명 */}
                <Text className="text-gray-800 font-semibold text-base mb-2">{item.description}</Text>

                {/* AI 분석 */}
                <View className="bg-white rounded-xl p-3 border border-gray-100">
                  <Text className="text-xs font-bold text-gray-400 mb-1">AI 분석</Text>
                  <Text className="text-gray-700 text-sm leading-5">{item.explanation}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity onPress={() => router.replace("/")} className="mt-2 border border-gray-300 rounded-xl py-4 items-center">
          <Text className="text-gray-600 font-bold">처음으로</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
