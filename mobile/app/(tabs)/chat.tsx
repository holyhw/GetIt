import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/auth";
import OnlineDot from "../../assets/chat-online.svg";
import type { ChatFilterKey } from "../../types/chat";

type ItemType = "FOUND" | "LOST";

type ChatRoom = {
  id: number;
  targetRegistrationId: number;
  targetTitle: string;
  targetItemType: ItemType;
  otherUserId: number;
  otherUserName: string;
  otherUserProfileImageUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

function parseUTC(iso: string): Date {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = parseUTC(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return "방금";
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

const TYPE_COLOR: Record<ItemType, string> = { LOST: "#FF7A00", FOUND: "#1E3A5F" };
const TYPE_LABEL: Record<ItemType, string> = { LOST: "분실", FOUND: "습득" };
const FILTERS: ChatFilterKey[] = ["전체", "분실", "습득"];

function ChatRow({ room, onPress }: { room: ChatRoom; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        height: 105,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#F5F7FA",
      }}
    >
      <View style={{ marginRight: 12 }}>
        <View style={{ width: 60, height: 60, borderRadius: 15, backgroundColor: "#7487FF", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {room.otherUserProfileImageUrl ? (
            <Image source={{ uri: room.otherUserProfileImageUrl }} style={{ width: 60, height: 60 }} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>
              {room.otherUserName.charAt(0)}
            </Text>
          )}
        </View>
        <View style={{ position: "absolute", right: 0, bottom: 0 }}>
          <OnlineDot width={20} height={20} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", letterSpacing: -0.32 }}>{room.otherUserName}</Text>
          <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.32 }}>{formatTime(room.lastMessageAt)}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View style={{ backgroundColor: TYPE_COLOR[room.targetItemType], borderRadius: 10, width: 35, height: 20, alignItems: "center", justifyContent: "center", marginRight: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff", lineHeight: 14 }}>{TYPE_LABEL[room.targetItemType]}</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.32, flex: 1 }} numberOfLines={1}>
            {room.targetTitle}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ flex: 1, fontSize: 12, color: "#464646", letterSpacing: -0.32, marginRight: 8 }} numberOfLines={1}>
            {room.lastMessage ?? ""}
          </Text>
          {room.unreadCount > 0 && (
            <View style={{ backgroundColor: "#F4551E", borderRadius: 10, width: 35, height: 20, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff", lineHeight: 14 }}>{room.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { token, isLoggedIn } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ChatFilterKey>("전체");

  const fetchRooms = useCallback(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE_URL}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setRooms(d.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filtered = activeFilter === "전체" ? rooms
    : rooms.filter((r) => activeFilter === "분실" ? r.targetItemType === "LOST" : r.targetItemType === "FOUND");

  const getCount = (key: ChatFilterKey) =>
    key === "전체" ? rooms.length
    : key === "분실" ? rooms.filter(r => r.targetItemType === "LOST").length
    : rooms.filter(r => r.targetItemType === "FOUND").length;

  const handleChatPress = (room: ChatRoom) => {
    setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, unreadCount: 0 } : r));
    router.push({
      pathname: "/chatroom",
      params: {
        roomId: room.id,
        name: room.otherUserName,
        title: room.targetTitle,
        itemType: room.targetItemType,
        registrationId: room.targetRegistrationId,
        ...(room.otherUserProfileImageUrl && { profileImage: room.otherUserProfileImageUrl }),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <View style={{ paddingTop: 60, paddingBottom: 0, alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>채팅</Text>
      </View>

      <View style={{ height: 50, flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 24, gap: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", backgroundColor: "#F5F7FA" }}>
        {FILTERS.map((key) => {
          const isActive = activeFilter === key;
          return (
            <TouchableOpacity key={key} onPress={() => setActiveFilter(key)} style={{ paddingBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: isActive ? "#000" : "#757575", letterSpacing: -0.32 }}>
                {key} {getCount(key)}
              </Text>
              {isActive && <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#1E3A5F" }} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#1E3A5F" />
        </View>
      ) : !isLoggedIn ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ fontSize: 14, color: "#919191" }}>로그인 후 채팅을 이용하세요</Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{ backgroundColor: "#1E3A5F", borderRadius: 10, paddingHorizontal: 24, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 14, color: "#919191" }}>채팅이 없어요</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((room) => (
            <ChatRow key={room.id} room={room} onPress={() => handleChatPress(room)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
