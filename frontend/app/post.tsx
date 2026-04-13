import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const BASE_URL = "https://538a-54-116-116-211.ngrok-free.app";

export default function Post() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: "finder" | "loser" }>();
  const isFinder = type === "finder";

  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImages((prev) => [...prev, result.assets[0].uri]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert("사진 필요", "사진을 최소 1장 선택해 주세요.");
      return;
    }

    const endpoint = isFinder ? `${BASE_URL}/api/registration/found` : `${BASE_URL}/api/registration/lost`;

    const formData = new FormData();
    if (images.length > 0) {
      formData.append("image", {
        uri: images[0],
        type: "image/jpeg",
        name: "image.jpg",
      } as any);
    }

    const query = isFinder ? `description=${encodeURIComponent(content)}` : `text=${encodeURIComponent(content)}`;

    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?${query}`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`서버 오류 (${response.status})`);

      if (isFinder) {
        Alert.alert("등록 완료", "등록이 완료되었습니다.", [{ text: "확인", onPress: () => router.replace("/") }]);
      } else {
        const data = await response.json();
        router.push({
          pathname: "/result",
          params: { images: JSON.stringify(images), content, type, response: JSON.stringify(data) },
        });
      }
    } catch (e: any) {
      Alert.alert("전송 실패", e.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isFinder ? "bg-blue-500" : "bg-orange-400";
  const placeholder = isFinder ? "습득한 물건의 특징을 자세히 입력해 주세요" : "잃어버린 물건의 특징을 자세히 입력해 주세요";

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* 타입 배지 */}
        <View className={`${accentColor} rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2`}>
          <Text className="text-white text-base font-bold">{isFinder ? "🔍 습득자" : "😢 분실자"}</Text>
          <Text className="text-white text-sm opacity-80">{isFinder ? "— 물건을 주우셨군요!" : "— 물건을 잃어버리셨군요!"}</Text>
        </View>

        {/* 선택된 이미지 목록 */}
        {images.length > 0 && (
          <FlatList
            data={images}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            renderItem={({ item, index }) => (
              <View className="mr-2">
                <Image source={{ uri: item }} className="w-24 h-24 rounded-xl" resizeMode="cover" />
                <TouchableOpacity onPress={() => removeImage(index)} className="absolute top-1 right-1 bg-black rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* 사진 버튼 */}
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={takePhoto} className="flex-1 h-20 bg-gray-100 rounded-xl items-center justify-center border border-dashed border-gray-300">
            <Text className="text-2xl">📷</Text>
            <Text className="text-gray-400 text-sm mt-1">카메라</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImages} className="flex-1 h-20 bg-gray-100 rounded-xl items-center justify-center border border-dashed border-gray-300">
            <Text className="text-2xl">🖼️</Text>
            <Text className="text-gray-400 text-sm mt-1">갤러리</Text>
          </TouchableOpacity>
        </View>

        {/* 내용 입력 */}
        <TextInput
          className="mt-4 w-full h-40 bg-gray-100 rounded-xl p-4 text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        {/* 제출 버튼 */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} className={`mt-4 ${accentColor} rounded-xl py-4 items-center ${loading ? "opacity-60" : ""}`}>
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">제출</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
