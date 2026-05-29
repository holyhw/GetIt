import { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import BackIcon from "../assets/myinfo-back.svg";
import MoreIcon from "../assets/chatroom-more.svg";
import PlusIcon from "../assets/chatroom-plus.svg";
import SendIcon from "../assets/chatroom-send.svg";
import SmallDotIcon from "../assets/chatroom-dot.svg";
import OnlineDotIcon from "../assets/chat-online.svg";

const capImage = require("../assets/cap.jpg");

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function ReceivedBubble({ text, time }: { text: string; time?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        alignSelf: "flex-start",
        marginBottom: 8,
        maxWidth: "85%",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E9ECF0",
          borderRadius: 15,
          paddingHorizontal: 12,
          paddingVertical: 12,
          maxWidth: 232,
        }}
      >
        <Text style={{ fontSize: 14, color: "#464646", lineHeight: 20 }}>{text}</Text>
      </View>
      {time && <Text style={{ fontSize: 10, color: "#6B7480", marginLeft: 4, marginBottom: 2 }}>{time}</Text>}
    </View>
  );
}

function SentBubble({ text, time, read }: { text: string; time?: string; read?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        alignSelf: "flex-end",
        marginBottom: 8,
        maxWidth: "85%",
      }}
    >
      {/* 읽음 + 시간 (왼쪽) */}
      {(read || time) && (
        <View style={{ alignItems: "flex-end", marginRight: 4, marginBottom: 2 }}>
          {read && <Text style={{ fontSize: 10, color: "#1E3A5F", lineHeight: 14 }}>읽음</Text>}
          {time && <Text style={{ fontSize: 10, color: "#6B7480", lineHeight: 14 }}>{time}</Text>}
        </View>
      )}
      {/* 말풍선 */}
      <View
        style={{
          backgroundColor: "#1E3A5F",
          borderWidth: 1,
          borderColor: "#7E8FA5",
          borderRadius: 15,
          paddingHorizontal: 12,
          paddingVertical: 12,
          maxWidth: 232,
        }}
      >
        <Text style={{ fontSize: 14, color: "#fff", lineHeight: 20 }}>{text}</Text>
      </View>
    </View>
  );
}

function SentPhoto() {
  return (
    <View style={{ alignSelf: "flex-end", marginBottom: 8 }}>
      <Image source={capImage} style={{ width: 167, height: 167, borderRadius: 15 }} resizeMode="cover" />
    </View>
  );
}

function DateChip({ date }: { date: string }) {
  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      <View
        style={{
          backgroundColor: "#E5E7EB",
          borderRadius: 15,
          paddingHorizontal: 12,
          height: 24,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "500", color: "#434343" }}>{date}</Text>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────

export default function ChatRoomScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
      <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
        {/* ── 헤더 ────────────────────────────────────── */}
        {/* Figma: bg=#F5F7FA, border-bottom #E5E7EB, h=51 at y=59 */}
        <View
          style={{
            backgroundColor: "#F5F7FA",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <View style={{ height: 60 }} />
          <View
            style={{
              height: 51,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            {/* 뒤로가기 */}
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 20 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <BackIcon width={11} height={19} />
            </TouchableOpacity>

            {/* 아바타 37×37 + 온라인 도트 */}
            <View style={{ marginRight: 10 }}>
              <View
                style={{
                  width: 37,
                  height: 37,
                  borderRadius: 15,
                  backgroundColor: "#7487FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>이</Text>
              </View>
              <View style={{ position: "absolute", right: -1, bottom: 0 }}>
                <OnlineDotIcon width={12} height={12} />
              </View>
            </View>

            {/* 이름 + 지금 활동중 */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", letterSpacing: -0.32 }}>이찬원</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <SmallDotIcon width={6} height={6} />
                <Text style={{ fontSize: 10, color: "#919191", marginLeft: 4, letterSpacing: -0.32 }}>지금 활동중</Text>
              </View>
            </View>

            {/* 더보기 3점 */}
            <TouchableOpacity onPress={() => setShowMenu(true)} style={{ padding: 8 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MoreIcon width={3} height={15} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 메시지 스크롤 영역 ────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 17,
            paddingBottom: 16,
          }}
        >
          {/* 아이템 카드: white, borderRadius=15, h=74, shadow */}
          {/* Figma: left=12, top=127, w=369, h=74 */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              height: 74,
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 2, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
              marginBottom: 17,
            }}
          >
            {/* 아이템 이미지: 50×50 */}
            <Image source={capImage} style={{ width: 50, height: 50, borderRadius: 15 }} resizeMode="cover" />

            {/* 타입 배지 + 매칭 유사도 + 제목 */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                {/* 습득 배지: h=18, w=30 */}
                <View
                  style={{
                    backgroundColor: "#1E3A5F",
                    borderRadius: 9,
                    width: 30,
                    height: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff", lineHeight: 12 }}>습득</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: "600", color: "#000", letterSpacing: -0.32 }}>매칭 유사도 </Text>
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#FF7A00", letterSpacing: -0.32 }}>92%</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", letterSpacing: -0.32 }}>검은색 kodak 모자</Text>
            </View>

            {/* 상세 버튼: bg=#D9D9D9, borderRadius=10, w=47, h=26 */}
            <TouchableOpacity
              onPress={() => router.push("/detail")}
              style={{
                backgroundColor: "#D9D9D9",
                borderRadius: 10,
                width: 47,
                height: 26,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#000" }}>상세</Text>
            </TouchableOpacity>
          </View>

          {/* 날짜 구분 칩 */}
          <DateChip date="2026.05.12  화" />

          {/* ── 메시지들 ── */}
          {/* 받은 메시지 1 */}
          <ReceivedBubble text="안녕하세요, 강남역에서 잃어버린 모자 사진 보고 연락드렸어요!" />

          {/* 받은 메시지 2 + 시간 */}
          <ReceivedBubble text="혹시 모자 챙 안쪽에 작은 얼룩 같은거 있을까요?" time="오후 2:34" />

          {/* 보낸 메시지 1 */}
          <SentBubble text="네 안녕하세여. 잠시만요, 사진 한 번 더 찍어볼게요" />

          {/* 보낸 사진 */}
          <SentPhoto />

          {/* 보낸 메시지 2 + 읽음 + 시간 */}
          <SentBubble text="여기 챙 안쪽이에요. 이거 맞으실까요?" read time="오후 2:34" />

          {messages.map((msg) => (
            <SentBubble key={msg.id} text={msg.text} />
          ))}
        </ScrollView>

        {/* ── 더보기 메뉴 바텀시트 ───────────────────────── */}
        <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 34,
          }}>
            <View style={{ width: 40, height: 4, backgroundColor: "#D9D9D9", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 }} />
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                Alert.alert("신고하기", "이 사용자를 신고하시겠어요?", [
                  { text: "취소", style: "cancel" },
                  { text: "신고", style: "destructive", onPress: () => {} },
                ]);
              }}
              style={{ paddingHorizontal: 24, paddingVertical: 16 }}
            >
              <Text style={{ fontSize: 16, color: "#FF3B30" }}>신고하기</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: "#F0F0F0", marginHorizontal: 24 }} />
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                router.back();
              }}
              style={{ paddingHorizontal: 24, paddingVertical: 16 }}
            >
              <Text style={{ fontSize: 16, color: "#434343" }}>채팅방 나가기</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* ── 입력 바 ────────────────────────────────────── */}
        {/* Figma: y=773, h=79, bg=#F5F7FA */}
        {/* Plus(29×29) | Input(h=39, borderRadius=20) | Send(27×27) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 20,
            backgroundColor: "#F5F7FA",
            gap: 8,
          }}
        >
          {/* + 버튼 */}
          <TouchableOpacity>
            <PlusIcon width={29} height={29} />
          </TouchableOpacity>

          {/* 텍스트 입력 */}
          <View
            style={{
              flex: 1,
              height: 39,
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingHorizontal: 14,
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              placeholder="메세지 입력"
              placeholderTextColor="#B2B6BD"
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#000",
                padding: 0,
                letterSpacing: -0.32,
              }}
            />
          </View>

          <TouchableOpacity onPress={handleSend}>
            <SendIcon width={27} height={27} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
