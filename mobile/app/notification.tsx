import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import MyInfoBackIcon from "../assets/myinfo-back.svg";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import type { ApiNotification } from "../types/notification";


function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
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
  const date = new Date(isoString);
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

function NotifRow({ notif, onPress, onDelete }: { notif: ApiNotification; onPress: () => void; onDelete: () => void }) {
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
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F4551E" }} />
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
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<ApiNotification[]>("/api/notifications", token);
      setNotifs(data ?? []);
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
                <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} />
              ))}
            </View>
          </View>
        )}

        {beforeNotifs.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#919191", paddingHorizontal: 24, paddingVertical: 10, letterSpacing: -0.2 }}>이전</Text>
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {beforeNotifs.map((n) => (
                <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} />
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
