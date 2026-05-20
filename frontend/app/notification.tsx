import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import MyInfoBackIcon from "../assets/myinfo-back.svg";

type NotifType = "match" | "chat" | "register" | "system";

type Notification = {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  itemType?: "found" | "lost";
};

const MOCK_NOTIFS: Notification[] = [
  {
    id: 1,
    type: "match",
    title: "AI 매칭 완료",
    body: "등록하신 '검은색 Kodak 모자' 분실물의 유사도 Top5 결과가 준비됐어요.",
    time: "방금 전",
    read: false,
    itemType: "lost",
  },
  {
    id: 2,
    type: "chat",
    title: "새 메시지",
    body: "홍길동님이 메시지를 보냈어요. '혹시 모자 뒷면에 스트랩이 있나요?'",
    time: "5분 전",
    read: false,
    itemType: "found",
  },
  {
    id: 3,
    type: "match",
    title: "AI 매칭 완료",
    body: "등록하신 '흰색 에어팟 프로' 분실물의 유사도 Top5 결과가 준비됐어요.",
    time: "1시간 전",
    read: false,
    itemType: "lost",
  },
  {
    id: 4,
    type: "register",
    title: "등록 완료",
    body: "'루이비통 갈색 장지갑' 습득물이 성공적으로 등록됐어요.",
    time: "어제 14:32",
    read: true,
    itemType: "found",
  },
  {
    id: 5,
    type: "chat",
    title: "새 메시지",
    body: "김민수님이 메시지를 보냈어요. '제 물건인 것 같아요, 확인 부탁드려요!'",
    time: "어제 11:05",
    read: true,
    itemType: "lost",
  },
  {
    id: 6,
    type: "system",
    title: "서비스 안내",
    body: "GET IT 앱이 업데이트됐어요. 새로운 AI 매칭 기능을 확인해 보세요.",
    time: "3일 전",
    read: true,
  },
];

// 알림 타입별 아이콘
function NotifIcon({ type, itemType }: { type: NotifType; itemType?: "found" | "lost" }) {
  const color = itemType === "lost" ? "#FF7A00" : "#1E3A5F";
  const bg = itemType === "lost" ? "#FFF3E8" : "#EEF3FB";

  if (type === "match") {
    return (
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={8} stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M6.5 10.5L9 13L13.5 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }
  if (type === "chat") {
    return (
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path d="M2 4C2 3.45 2.45 3 3 3H17C17.55 3 18 3.45 18 4V13C18 13.55 17.55 14 17 14H6L2 17V4Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
        </Svg>
      </View>
    );
  }
  if (type === "register") {
    return (
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Rect x={3} y={2} width={14} height={16} rx={2} stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M7 7H13M7 10H13M7 13H10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      </View>
    );
  }
  // system
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

// 읽지 않은 알림 수
function unreadCount(notifs: Notification[]) {
  return notifs.filter((n) => !n.read).length;
}

// 날짜 그룹 구분
function getGroup(time: string): "today" | "before" {
  return time === "방금 전" || time.includes("분 전") || time.includes("시간 전") ? "today" : "before";
}

export default function NotificationScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFS);

  const todayNotifs = notifs.filter((n) => getGroup(n.time) === "today");
  const beforeNotifs = notifs.filter((n) => getGroup(n.time) === "before");

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const count = unreadCount(notifs);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MyInfoBackIcon width={11} height={19} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>알림</Text>
            {count > 0 && (
              <View
                style={{
                  backgroundColor: "#F4551E",
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 5,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{count}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 12, color: count > 0 ? "#1E3A5F" : "#C0C0C0", fontWeight: "600", letterSpacing: -0.2 }}>모두 읽음</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 오늘 */}
        {todayNotifs.length > 0 && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#919191", paddingHorizontal: 24, paddingVertical: 10, letterSpacing: -0.2 }}>오늘</Text>
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {todayNotifs.map((notif) => (
                <NotifRow key={notif.id} notif={notif} onPress={() => markRead(notif.id)} />
              ))}
            </View>
          </View>
        )}

        {/* 이전 */}
        {beforeNotifs.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#919191", paddingHorizontal: 24, paddingVertical: 10, letterSpacing: -0.2 }}>이전</Text>
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {beforeNotifs.map((notif) => (
                <NotifRow key={notif.id} notif={notif} onPress={() => markRead(notif.id)} />
              ))}
            </View>
          </View>
        )}

        {/* 빈 상태 */}
        {notifs.length === 0 && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 120 }}>
            <Text style={{ fontSize: 14, color: "#ABABAB", letterSpacing: -0.3 }}>알림이 없어요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotifRow({ notif, onPress }: { notif: Notification; onPress: () => void }) {
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
      <NotifIcon type={notif.type} itemType={notif.itemType} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#000", letterSpacing: -0.3 }}>{notif.title}</Text>
          <Text style={{ fontSize: 10, color: "#ABABAB", letterSpacing: -0.2 }}>{notif.time}</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#434343", lineHeight: 17, letterSpacing: -0.2 }}>{notif.body}</Text>
      </View>

      {/* 읽지 않은 표시 dot */}
      {!notif.read && (
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: "#F4551E",
            marginTop: 4,
          }}
        />
      )}
    </TouchableOpacity>
  );
}
