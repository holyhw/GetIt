import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import DetailBackIcon from "../assets/detail-back.svg";
import DetailShareIcon from "../assets/detail-share.svg";
import DetailMoreIcon from "../assets/detail-more.svg";
import DetailChatIcon from "../assets/detail-chat.svg";
import DetailPinIcon from "../assets/detail-pin.svg";
import DetailArrowIcon from "../assets/detail-arrow-right.svg";
import Top5DetailIcon from "../assets/top5-detail.svg";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const profilePlaceholder = require("../assets/profile-placeholder.png");
const mapImage = require("../assets/map-placeholder.jpg");

type RegistrationDetail = {
  id: number;
  userId: number;
  itemType: "LOST" | "FOUND";
  title: string;
  category: string;
  location: string;
  occurredDate: string;
  description: string;
  imageUrl: string | null;
  matched: boolean;
  createdDate: string;
  userName: string;
  userProfileImageUrl: string | null;
};

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#E5E5E5" }} />;
}

function OverlayButton({ left, children, onPress }: { left: number; children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ position: "absolute", top: 59, left, zIndex: 10 }}>
      {children}
    </TouchableOpacity>
  );
}

function DarkBtn({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "rgba(0,0,0,0.59)", borderRadius: 10, width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
      {children}
    </View>
  );
}

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, userInfo } = useAuth();

  const [item, setItem] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<RegistrationDetail>(`/api/registration/${id}`, token ?? "")
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <Text style={{ color: "#919191" }}>게시물을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const isLost = item.itemType === "LOST";
  const isOwner = userInfo?.id === item.userId;

  const handleShare = async () => {
    const type = isLost ? "lost" : "found";
    const typeLabel = isLost ? "분실물" : "습득물";
    const url = `https://www.getitsju.com/detail?id=${item.id}&type=${type}`;
    const category = item.category?.split(">").pop()?.trim() ?? item.category;
    await Share.share({
      message: `[GET IT - ${typeLabel}] ${item.title}\n카테고리: ${category} · 📍 ${item.location}\n\n👉 ${url}`,
    });
  };

  const handleMatchComplete = async () => {
    if (!token) return;
    setShowMore(false);
    setActionLoading(true);
    try {
      const updated = await api.patch<RegistrationDetail>(`/api/registration/${item.id}/matched`, token, {});
      setItem(updated);
    } catch {
      Alert.alert("오류", "처리 중 문제가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = () => {
    setShowMore(false);
    Alert.alert("신고하기", "이 게시물을 신고하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "신고", style: "destructive",
        onPress: async () => {
          if (!token) return;
          try {
            await api.post(`/api/registration/${item.id}/report`, token, {});
            Alert.alert("신고 완료", "신고가 접수되었습니다.");
          } catch {
            Alert.alert("오류", "신고 처리 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    setShowMore(false);
    Alert.alert("게시물 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제", style: "destructive",
        onPress: async () => {
          if (!token) return;
          setActionLoading(true);
          try {
            await api.delete(`/api/registration/${item.id}`, token);
            router.back();
          } catch {
            Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };
  const ctaColor = isLost ? "#FF7A00" : "#1E3A5F";
  const ctaText = isLost ? "이 물건을 주운 것 같아요" : "이 물건 제 것 같아요";
  const dateLabel = `${item.occurredDate?.replace(/-/g, ".") ?? ""} ${isLost ? "분실" : "습득"}`;
  const ogUrl = `https://www.getitsju.com/detail?id=${item.id}&type=${isLost ? "lost" : "found"}`;
  const category = item.category?.split(">").pop()?.trim() ?? item.category;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Head>
        <title>{item.title}</title>
        <meta property="og:title" content={item.title} />
        <meta property="og:description" content={item.description ?? ""} />
        <meta property="og:image" content={item.imageUrl ?? ""} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={item.title} />
        <meta name="twitter:description" content={item.description ?? ""} />
        <meta name="twitter:image" content={item.imageUrl ?? ""} />
      </Head>
      <OverlayButton left={24} onPress={() => router.back()}>
        <DetailBackIcon width={30} height={30} />
      </OverlayButton>
      <OverlayButton left={293} onPress={handleShare}>
        <DarkBtn><DetailShareIcon width={13} height={15} /></DarkBtn>
      </OverlayButton>
      <OverlayButton left={339} onPress={() => setShowMore(true)}>
        <DarkBtn><DetailMoreIcon width={14} height={4} /></DarkBtn>
      </OverlayButton>

      {/* 더보기 모달 */}
      <Modal visible={showMore} transparent animationType="fade" onRequestClose={() => setShowMore(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setShowMore(false)} />
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 }}>
          <View style={{ width: 40, height: 4, backgroundColor: "#D9D9D9", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 }} />
          {isOwner ? (
            <>
              {!item.matched && (
                <TouchableOpacity
                  onPress={handleMatchComplete}
                  style={{ paddingVertical: 18, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}
                >
                  <Text style={{ fontSize: 16, color: "#1E3A5F", fontWeight: "600" }}>매칭 완료</Text>
                  <Text style={{ fontSize: 12, color: "#919191", marginTop: 2 }}>물건을 찾았어요</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => { setShowMore(false); router.push(`/edit?id=${item.id}`); }}
                style={{ paddingVertical: 18, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}
              >
                <Text style={{ fontSize: 16, color: "#434343", fontWeight: "600" }}>수정하기</Text>
                <Text style={{ fontSize: 12, color: "#919191", marginTop: 2 }}>게시물 내용을 수정합니다</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ paddingVertical: 18, paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 16, color: "#EF4444", fontWeight: "600" }}>게시물 삭제</Text>
                <Text style={{ fontSize: 12, color: "#919191", marginTop: 2 }}>이 게시물을 삭제합니다</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleReport} style={{ paddingVertical: 18, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 16, color: "#EF4444", fontWeight: "600" }}>신고하기</Text>
              <Text style={{ fontSize: 12, color: "#919191", marginTop: 2 }}>부적절한 게시물을 신고합니다</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {actionLoading && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)", zIndex: 100 }}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 히어로 이미지 */}
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/cap.jpg")}
          style={{ width: "100%", height: 317 }}
          resizeMode="cover"
        />

        {/* 컨텐츠 카드 */}
        <View style={{
          marginHorizontal: 4,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#F5F7FA",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}>
          {/* 카테고리 태그 */}
          <View style={{ backgroundColor: "#E5E5E5", borderRadius: 20, paddingHorizontal: 12, height: 27, alignSelf: "flex-start", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#000" }}>{category}</Text>
          </View>

          {/* 제목 */}
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 22 }}>
            {item.title}
          </Text>

          <Divider />

          {/* 프로필 */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
            <Image
              source={item.userProfileImageUrl ? { uri: item.userProfileImageUrl } : profilePlaceholder}
              style={{ width: 45, height: 45, borderRadius: 22.5 }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>{item.userName}</Text>
              <Text style={{ fontSize: 10, color: "#464646", marginTop: 4 }}>{dateLabel}</Text>
            </View>
          </View>

          <Divider />

          {/* 상세 설명 */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#000", marginTop: 16, marginBottom: 8 }}>상세 설명</Text>
          <Text style={{ fontSize: 12, color: "#434343", lineHeight: 16, marginBottom: 16 }}>{item.description}</Text>

          <Divider />

          {/* 위치 */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#000", marginTop: 16, marginBottom: 18 }}>
            {isLost ? "분실 위치" : "습득 위치"}
          </Text>
          <View style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden", height: 74 }}>
              <Image source={mapImage} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>
            <View style={{ backgroundColor: "#F5F7FA", height: 33, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
              <DetailPinIcon width={9} height={11} />
              <Text style={{ flex: 1, marginLeft: 7, fontSize: 10, color: "#000" }}>{item.location}</Text>
              {!isLost && <DetailArrowIcon width={5} height={9} />}
            </View>
          </View>

          <Divider />

          {/* AI 매칭 섹션 */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>AI 매칭</Text>
              {item.matched && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: isLost ? "#FF7A00" : "#1E3A5F" }} />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: isLost ? "#FF7A00" : "#1E3A5F", letterSpacing: -0.32 }}>
                    매칭 완료
                  </Text>
                </View>
              )}
            </View>

            <View style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#000", marginBottom: 4, letterSpacing: -0.32 }}>
                  {item.matched ? "유사도 Top5 결과가 준비됐어요!" : "유사도 Top5를 확인해보세요!"}
                </Text>
                <Text style={{ fontSize: 11, color: "#757575", lineHeight: 15, letterSpacing: -0.32 }}>
                  {"AI가 분석한 가장 유사한 5개 결과를\n확인해보세요."}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/top5?id=${item.id}`)}
                style={{
                  backgroundColor: isLost ? "#FF7A00" : "#1E3A5F",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Top5DetailIcon width={11} height={13} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>결과 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 CTA */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#F5F7FA", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ backgroundColor: ctaColor, height: 46, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <DetailChatIcon width={18} height={18} />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
