import { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Modal, Alert, ActivityIndicator, Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { API_BASE_URL } from "../constants/auth";
import { Client } from "@stomp/stompjs";
import BackIcon from "../assets/myinfo-back.svg";
import MoreIcon from "../assets/chatroom-more.svg";
import PlusIcon from "../assets/chatroom-plus.svg";
import SendIcon from "../assets/chatroom-send.svg";
import OnlineDotIcon from "../assets/chat-online.svg";

type Message = {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  read: boolean;
  createdDate: string;
};

type UserInfo = { id: number; name: string };

function parseUTC(iso: string): Date {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
}

function formatTime(dateStr: string): string {
  const date = parseUTC(dateStr);
  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";
  return `${ampm} ${hours % 12 || 12}:${mins}`;
}

function formatDateChip(dateStr: string): string {
  const date = parseUTC(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}  ${days[date.getDay()]}`;
}

function groupByDate(messages: Message[]): (Message | string)[] {
  const result: (Message | string)[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const dateKey = parseUTC(msg.createdDate).toDateString();
    if (dateKey !== lastDate) {
      result.push(formatDateChip(msg.createdDate));
      lastDate = dateKey;
    }
    result.push(msg);
  }
  return result;
}

function ReceivedBubble({ text, time }: { text: string; time?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", alignSelf: "flex-start", marginBottom: 8, maxWidth: "85%" }}>
      <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E9ECF0", borderRadius: 15, paddingHorizontal: 12, paddingVertical: 12, maxWidth: 232 }}>
        <Text style={{ fontSize: 14, color: "#464646", lineHeight: 20 }}>{text}</Text>
      </View>
      {time && <Text style={{ fontSize: 10, color: "#6B7480", marginLeft: 4, marginBottom: 2 }}>{time}</Text>}
    </View>
  );
}

function SentBubble({ text, time, read, showUnread }: { text: string; time?: string; read?: boolean; showUnread?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", alignSelf: "flex-end", marginBottom: 8, maxWidth: "85%" }}>
      <View style={{ alignItems: "flex-end", marginRight: 4, marginBottom: 2 }}>
        {showUnread && <Text style={{ fontSize: 10, color: "#919191", lineHeight: 14 }}>1</Text>}
        {read === true && <Text style={{ fontSize: 10, color: "#1E3A5F", lineHeight: 14 }}>읽음</Text>}
        {time && <Text style={{ fontSize: 10, color: "#6B7480", lineHeight: 14 }}>{time}</Text>}
      </View>
      <View style={{ backgroundColor: "#1E3A5F", borderWidth: 1, borderColor: "#7E8FA5", borderRadius: 15, paddingHorizontal: 12, paddingVertical: 12, maxWidth: 232 }}>
        <Text style={{ fontSize: 14, color: "#fff", lineHeight: 20 }}>{text}</Text>
      </View>
    </View>
  );
}

function DateChip({ date }: { date: string }) {
  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      <View style={{ backgroundColor: "#E5E7EB", borderRadius: 15, paddingHorizontal: 12, height: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 12, fontWeight: "500", color: "#434343" }}>{date}</Text>
      </View>
    </View>
  );
}

export default function ChatRoomScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    roomId: string;
    name: string;
    title: string;
    itemType: string;
    registrationId: string;
    profileImage?: string;
  }>();

  const roomId = params.roomId;
  const [otherUserName, setOtherUserName] = useState(params.name ?? "");
  const [targetTitle, setTargetTitle] = useState(params.title ?? "");
  const [targetItemType, setTargetItemType] = useState<"FOUND" | "LOST">((params.itemType ?? "FOUND") as "FOUND" | "LOST");
  const [targetRegistrationId, setTargetRegistrationId] = useState(params.registrationId ?? "");
  const [otherUserProfileImageUrl, setOtherUserProfileImageUrl] = useState(params.profileImage ?? null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const stompClientRef = useRef<Client | null>(null);

  const typeColor = targetItemType === "LOST" ? "#FF7A00" : "#1E3A5F";
  const typeLabel = targetItemType === "LOST" ? "분실" : "습득";

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then((d) => setMyUserId(d.id)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!targetRegistrationId || !token) return;
    fetch(`${API_BASE_URL}/api/registration/${targetRegistrationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.result?.imageUrl) setItemImageUrl(d.result.imageUrl); })
      .catch(() => {});
  }, [targetRegistrationId, token]);

  // 룸 정보 없을 때 (알림에서 진입)
  useEffect(() => {
    if (!roomId || !token || otherUserName) return;
    fetch(`${API_BASE_URL}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const room = (d.result ?? []).find((r: { id: number }) => String(r.id) === roomId);
        if (room) {
          setOtherUserName(room.otherUserName);
          setTargetTitle(room.targetTitle);
          setTargetItemType(room.targetItemType);
          setTargetRegistrationId(String(room.targetRegistrationId));
          if (room.otherUserProfileImageUrl) setOtherUserProfileImageUrl(room.otherUserProfileImageUrl);
        }
      })
      .catch(() => {});
  }, [roomId, token, otherUserName]);

  const markRead = useCallback(() => {
    if (!roomId || !token) return;
    fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [roomId, token]);

  // 메시지 히스토리 로드
  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.result ?? []);
        markRead();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId, token, markRead]);

  // WebSocket STOMP 연결
  useEffect(() => {
    if (!roomId || !token) return;
    const client = new Client({
      brokerURL: `wss://api.getitsju.com/ws/chat?access_token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/chat/rooms/${roomId}`, (frame) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
          markRead();
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [roomId, token, markRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages]);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    return () => sub.remove();
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !token || !roomId) return;
    setInputText("");

    // WebSocket 연결됐으면 STOMP로, 아니면 REST로
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/chat/rooms/${roomId}/messages`,
        body: JSON.stringify({ content: trimmed }),
      });
    } else {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        });
        const data = await res.json();
        const msg: Message = data.result;
        if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      } catch {}
    }
  }, [inputText, roomId, token]);

  const grouped = groupByDate(messages);
  const lastSentId = [...messages].reverse().find((m) => m.senderId === myUserId)?.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>

        {/* 헤더 */}
        <View style={{ backgroundColor: "#F5F7FA", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <View style={{ height: 60 }} />
          <View style={{ height: 51, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 20 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <BackIcon width={11} height={19} />
            </TouchableOpacity>
            <View style={{ marginRight: 10 }}>
              <View style={{ width: 37, height: 37, borderRadius: 15, backgroundColor: "#7487FF", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {otherUserProfileImageUrl ? (
                  <Image source={{ uri: otherUserProfileImageUrl }} style={{ width: 37, height: 37 }} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>
                    {otherUserName.charAt(0)}
                  </Text>
                )}
              </View>
              <View style={{ position: "absolute", right: -1, bottom: 0 }}>
                <OnlineDotIcon width={12} height={12} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", letterSpacing: -0.32 }}>{otherUserName}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowMenu(true)} style={{ padding: 8 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MoreIcon width={3} height={15} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 아이템 카드 (상단 고정) */}
        {targetTitle ? (
          <View style={{ backgroundColor: "#F5F7FA", paddingHorizontal: 12, paddingTop: 12 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 15, height: 74, flexDirection: "row", alignItems: "center", padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }}>
              <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: "#E5E7EB", overflow: "hidden", marginRight: 12 }}>
                {itemImageUrl && <Image source={{ uri: itemImageUrl }} style={{ width: 50, height: 50 }} resizeMode="cover" />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: typeColor, borderRadius: 9, paddingHorizontal: 6, height: 18, alignSelf: "flex-start", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{typeLabel}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", letterSpacing: -0.32 }} numberOfLines={1}>{targetTitle}</Text>
              </View>
              {targetRegistrationId && (
                <TouchableOpacity
                  onPress={() => router.push(`/detail?id=${targetRegistrationId}`)}
                  style={{ backgroundColor: "#D9D9D9", borderRadius: 10, width: 47, height: 26, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#000" }}>상세</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* 메시지 영역 */}
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#1E3A5F" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 16 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {grouped.map((item, i) =>
              typeof item === "string" ? (
                <DateChip key={`date-${i}`} date={item} />
              ) : item.senderId === myUserId ? (
                <SentBubble
                  key={item.id}
                  text={item.content}
                  time={formatTime(item.createdDate)}
                  read={item.id === lastSentId ? item.read : undefined}
                  showUnread={item.id === lastSentId && !item.read}
                />
              ) : (
                <ReceivedBubble key={item.id} text={item.content} time={formatTime(item.createdDate)} />
              )
            )}
          </ScrollView>
        )}

        {/* 더보기 바텀시트 */}
        <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 }}>
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
                Alert.alert("채팅방 나가기", "채팅방을 나가면 대화 내용이 모두 삭제됩니다. 나가시겠어요?", [
                  { text: "취소", style: "cancel" },
                  {
                    text: "나가기", style: "destructive",
                    onPress: async () => {
                      try {
                        await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                      } catch {}
                      router.replace("/(tabs)/chat");
                    },
                  },
                ]);
              }}
              style={{ paddingHorizontal: 24, paddingVertical: 16 }}
            >
              <Text style={{ fontSize: 16, color: "#434343" }}>채팅방 나가기</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* 입력 바 */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 20, backgroundColor: "#F5F7FA", gap: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
          <TouchableOpacity>
            <PlusIcon width={29} height={29} />
          </TouchableOpacity>
          <View style={{ flex: 1, height: 39, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              placeholder="메세지 입력"
              placeholderTextColor="#B2B6BD"
              style={{ fontSize: 12, fontWeight: "600", color: "#000", padding: 0, letterSpacing: -0.32 }}
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
