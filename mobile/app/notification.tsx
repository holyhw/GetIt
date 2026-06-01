import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import MyInfoBackIcon from "../assets/myinfo-back.svg";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import type { ApiNotification } from "../types/notification";


function parseUTC(iso: string): Date {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
}

function formatRelativeTime(isoString: string): string {
  const date = parseUTC(isoString);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function isToday(isoString: string): boolean {
  const date = parseUTC(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function NotifIcon({ type }: { type: string }) {
  if (type === "MATCH_CANDIDATE") {
    return (
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#EEF3FB", alignItems: "center", justifyContent: "center" }}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={8} stroke="#1E3A5F" strokeWidth={1.8} fill="none" />
          <Path d="M6.5 10.5L9 13L13.5 8" stroke="#1E3A5F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }
  if (type === "CHAT_MESSAGE") {
    return (
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#EEF3FB", alignItems: "center", justifyContent: "center" }}>
        <Svg width={20} height={20} viewBox="0 0 23 25" fill="none">
          <Path d="M15.5889 10.1607C15.5889 10.7497 15.3735 11.3145 14.9901 11.731C14.6067 12.1475 14.0867 12.3814 13.5445 12.3814H6.21308C5.6709 12.3815 5.15097 12.6156 4.76765 13.0321L2.51671 15.4771C2.41521 15.5874 2.2859 15.6624 2.14512 15.6928C2.00435 15.7232 1.85843 15.7076 1.72583 15.648C1.59322 15.5883 1.47987 15.4873 1.40012 15.3577C1.32037 15.228 1.2778 15.0756 1.27778 14.9197V3.49851C1.27778 2.90953 1.49317 2.34468 1.87658 1.92821C2.25999 1.51175 2.78001 1.27778 3.32223 1.27778H13.5445C14.0867 1.27778 14.6067 1.51175 14.9901 1.92821C15.3735 2.34468 15.5889 2.90953 15.5889 3.49851V10.1607Z" stroke="#1E3A5F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M19.6778 9.05026C20.22 9.05026 20.74 9.28423 21.1234 9.7007C21.5068 10.1172 21.7222 10.682 21.7222 11.271V22.6922C21.7222 22.8481 21.6796 23.0005 21.5999 23.1301C21.5201 23.2598 21.4068 23.3608 21.2742 23.4205C21.1416 23.4801 20.9956 23.4957 20.8549 23.4653C20.7141 23.4349 20.5848 23.3598 20.4833 23.2496L18.2323 20.8046C17.849 20.3881 17.3291 20.154 16.7869 20.1539H9.45551C8.91329 20.1539 8.39328 19.9199 8.00987 19.5035C7.62646 19.087 7.41106 18.5222 7.41106 17.9332V16.8228" stroke="#1E3A5F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }
  return (
    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }}>
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Circle cx={10} cy={10} r={8} stroke="#919191" strokeWidth={1.8} fill="none" />
        <Path d="M10 6V11" stroke="#919191" strokeWidth={1.8} strokeLinecap="round" />
        <Circle cx={10} cy={13.5} r={0.8} fill="#919191" />
      </Svg>
    </View>
  );
}

function NotifRow({ notif, onPress, onDelete, unreadCount }: { notif: ApiNotification; onPress: () => void; onDelete: () => void; unreadCount?: number }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: notif.read ? "#fff" : "#EEF3FB",
        borderRadius: 14,
        padding: 14,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <NotifIcon type={notif.type} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#000", letterSpacing: -0.3, flex: 1, marginRight: 8 }}>{notif.title}</Text>
          <Text style={{ fontSize: 10, color: "#ABABAB", letterSpacing: -0.2 }}>{formatRelativeTime(notif.createdDate)}</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#434343", lineHeight: 17, letterSpacing: -0.2 }}>{notif.message}</Text>
      </View>

      <View style={{ alignItems: "center", gap: 8 }}>
        {!notif.read && (
          unreadCount && unreadCount > 1 ? (
            <View style={{ backgroundColor: "#F4551E", borderRadius: 6, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          ) : (
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F4551E" }} />
          )
        )}
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 16, color: "#C0C0C0", lineHeight: 16 }}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [notifs, setNotifs] = useState<ApiNotification[]>([]);
  const [chatUnreadMap, setChatUnreadMap] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<ApiNotification[]>("/api/notifications", token);
      const all = data ?? [];

      // 채팅방별 안읽음 개수 계산
      const unreadMap = new Map<number, number>();
      all.forEach((n) => {
        if (n.type === "CHAT_MESSAGE" && !n.read && n.targetId) {
          unreadMap.set(n.targetId, (unreadMap.get(n.targetId) ?? 0) + 1);
        }
      });

      // 채팅방별 최신 1개만 유지
      const seen = new Set<string>();
      const grouped = all.filter((n) => {
        if (n.type !== "CHAT_MESSAGE") return true;
        const key = `chat_${n.targetId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setNotifs(grouped);
      setChatUnreadMap(unreadMap);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifs();
    }, [fetchNotifs])
  );

  const markRead = async (notif: ApiNotification) => {
    if (!token) return;
    if (!notif.read) {
      try {
        await api.patch(`/api/notifications/${notif.id}/read`, token, {});
        setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      } catch {}
    }
    if (notif.targetType === "REGISTRATION" && notif.targetId) {
      router.push(`/detail?id=${notif.targetId}`);
    } else if (notif.targetType === "CHAT_ROOM" && notif.targetId) {
      router.push(`/chatroom?roomId=${notif.targetId}`);
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await api.patch("/api/notifications/read-all", token, {});
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const deleteNotif = async (id: number) => {
    if (!token) return;
    try {
      await api.delete(`/api/notifications/${id}`, token);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const unread = notifs.filter((n) => !n.read).length;
  const todayNotifs = notifs.filter((n) => isToday(n.createdDate));
  const beforeNotifs = notifs.filter((n) => !isToday(n.createdDate));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F7FA", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MyInfoBackIcon width={11} height={19} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>알림</Text>
            {unread > 0 && (
              <View style={{ backgroundColor: "#F4551E", borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 12, color: unread > 0 ? "#1E3A5F" : "#C0C0C0", fontWeight: "600", letterSpacing: -0.2 }}>모두 읽음</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {todayNotifs.length > 0 && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#919191", paddingHorizontal: 24, paddingVertical: 10, letterSpacing: -0.2 }}>오늘</Text>
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {todayNotifs.map((n) => (
                <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} unreadCount={n.type === "CHAT_MESSAGE" && n.targetId ? chatUnreadMap.get(n.targetId) : undefined} />
              ))}
            </View>
          </View>
        )}

        {beforeNotifs.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#919191", paddingHorizontal: 24, paddingVertical: 10, letterSpacing: -0.2 }}>이전</Text>
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {beforeNotifs.map((n) => (
                <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} unreadCount={n.type === "CHAT_MESSAGE" && n.targetId ? chatUnreadMap.get(n.targetId) : undefined} />
              ))}
            </View>
          </View>
        )}

        {notifs.length === 0 && (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 120 }}>
            <Text style={{ fontSize: 14, color: "#ABABAB", letterSpacing: -0.3 }}>알림이 없어요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
