import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MyInfoBackIcon from "../assets/myinfo-back.svg";
import MyInfoCameraIcon from "../assets/myinfo-camera.svg";
import MyInfoNaverIcon from "../assets/myinfo-naver.svg";
import MyInfoKakaoIcon from "../assets/myinfo-kakao.svg";
import MyInfoGoogleIcon from "../assets/myinfo-google.svg";
import MyInfoCheckIcon from "../assets/myinfo-check.svg";
import MyInfoArrowIcon from "../assets/myinfo-arrow.svg";
import { useAuth, UserInfo } from "../context/AuthContext";

const API_BASE_URL = "https://api.getitsju.com";
const profilePlaceholder = require("../assets/profile-placeholder.png");

export default function MyInfoScreen() {
  const router = useRouter();
  const { token, userInfo, updateUserInfo } = useAuth();

  const [editingNickname, setEditingNickname] = useState(false);
  const [draftNickname, setDraftNickname] = useState(userInfo?.name ?? "");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setDraftImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!token || !userInfo) return;
    const name = draftNickname.trim() || userInfo.name;
    setSaving(true);
    try {
      const formData = new FormData();
      if (draftImage) {
        if (Platform.OS === "web") {
          const res = await fetch(draftImage);
          const blob = await res.blob();
          formData.append("profileImage", blob, "profile.jpg");
        } else {
          formData.append("profileImage", { uri: draftImage, type: "image/jpeg", name: "profile.jpg" } as any);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/users/me?name=${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`오류: ${res.status}`);
      const data = await res.json();
      updateUserInfo(data.result);
      setEditingNickname(false);
      router.back();
    } catch {
      Alert.alert("저장 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const name = userInfo?.name ?? "";
  const email = userInfo?.email ?? "";
  const provider = userInfo?.provider ?? null;

  const accounts = [
    { key: "KAKAO" as const, label: "카카오", icon: <MyInfoKakaoIcon width={25} height={25} /> },
    { key: "NAVER" as const, label: "네이버", icon: <MyInfoNaverIcon width={25} height={25} /> },
    {
      key: "GOOGLE" as const,
      label: "Google",
      icon: (
        <View style={{ width: 25, height: 25, borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 3, alignItems: "center", justifyContent: "center" }}>
          <MyInfoGoogleIcon width={15} height={15} />
        </View>
      ),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MyInfoBackIcon width={11} height={19} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>
            내 정보 관리
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: "#1E3A5F", width: 46, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" }}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>저장</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 프로필 사진 + 이름 + 이메일 */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={{ marginBottom: 14 }}>
            <Image
              source={draftImage ? { uri: draftImage } : userInfo?.profileImageUrl ? { uri: userInfo.profileImageUrl } : profilePlaceholder}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
            <View style={{ position: "absolute", right: 0, bottom: 0 }}>
              <MyInfoCameraIcon width={36} height={36} />
            </View>
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 8 }}>
            {draftNickname || name}
          </Text>
          <Text style={{ fontSize: 14, color: "#757575" }}>{email}</Text>
        </View>

        {/* 프로필 섹션 */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#757575", letterSpacing: -0.32, marginBottom: 8 }}>
            프로필
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setDraftNickname(name);
              setEditingNickname(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: editingNickname ? "#1E3A5F" : "#D9D9D9",
              borderRadius: 15,
              height: 46,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: "#434343", letterSpacing: -0.32 }}>
              닉네임
            </Text>
            {editingNickname ? (
              <TextInput
                ref={inputRef}
                value={draftNickname}
                onChangeText={(v) => setDraftNickname(v.slice(0, 6))}
                maxLength={6}
                style={{ fontSize: 14, fontWeight: "600", color: "#000", letterSpacing: -0.32, marginRight: 8, width: 84, textAlign: "right", padding: 0 }}
              />
            ) : (
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#757575", letterSpacing: -0.32, marginRight: 8 }}>
                {name}
              </Text>
            )}
            <MyInfoArrowIcon width={6} height={10} />
          </TouchableOpacity>
        </View>

        {/* 연결된 계정 섹션 */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#757575", letterSpacing: -0.32, marginBottom: 8 }}>
            연결된 계정
          </Text>

          {accounts.map((account, idx) => {
            const isMain = account.key === provider;
            const isFirst = idx === 0;
            const isLast = idx === accounts.length - 1;
            return (
              <View
                key={account.key}
                style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#D9D9D9",
                  borderTopWidth: isFirst ? 1 : 0,
                  borderTopLeftRadius: isFirst ? 15 : 0,
                  borderTopRightRadius: isFirst ? 15 : 0,
                  borderBottomLeftRadius: isLast ? 15 : 0,
                  borderBottomRightRadius: isLast ? 15 : 0,
                  height: 57,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
              >
                {account.icon}
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#434343", marginLeft: 12, letterSpacing: -0.32 }}>
                  {account.label}
                </Text>
                {isMain && (
                  <View style={{ marginLeft: 8, backgroundColor: "#F4F7FF", borderRadius: 8, width: 38, height: 16, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#1E3A5F" }}>주 계정</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                {isMain
                  ? <MyInfoCheckIcon width={15} height={11} />
                  : <Text style={{ fontSize: 10, color: "#757575" }}>연결되지 않음</Text>
                }
              </View>
            );
          })}
        </View>

        {/* 회원탈퇴 */}
        <View style={{ alignItems: "flex-end", paddingHorizontal: 24, marginTop: 20 }}>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#EF4444" }}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
