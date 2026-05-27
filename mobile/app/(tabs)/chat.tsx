import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import OnlineDot from "../../assets/chat-online.svg";

type ChatType = "분실" | "습득";
type FilterKey = "전체" | "분실" | "습득";

const CHATS: {
  id: number;
  name: string;
  initial: string;
  avatarColor: string;
  type: ChatType;
  itemName: string;
  lastMessage: string;
  time: string;
  unread: number;
}[] = [
  {
    id: 1,
    name: "이찬원",
    initial: "이",
    avatarColor: "#7487FF",
    type: "분실",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
  {
    id: 2,
    name: "박지원",
    initial: "박",
    avatarColor: "#D8BF92",
    type: "습득",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
  {
    id: 3,
    name: "김석진",
    initial: "김",
    avatarColor: "#FF9A9A",
    type: "습득",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
  {
    id: 4,
    name: "최인규",
    initial: "최",
    avatarColor: "#96D49F",
    type: "분실",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
  {
    id: 5,
    name: "강민석",
    initial: "강",
    avatarColor: "#B882B1",
    type: "습득",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
  {
    id: 6,
    name: "정우성",
    initial: "정",
    avatarColor: "#FFE374",
    type: "분실",
    itemName: "검은색 kodak 모자",
    lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..",
    time: "방금",
    unread: 2,
  },
];

const TYPE_COLOR: Record<ChatType, string> = {
  분실: "#FF7A00",
  습득: "#1E3A5F",
};

const FILTERS: { key: FilterKey; count: number }[] = [
  { key: "전체", count: 6 },
  { key: "분실", count: 3 },
  { key: "습득", count: 3 },
];

function ChatRow({ item, onPress }: { item: (typeof CHATS)[0]; onPress?: () => void }) {
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
      {/* 아바타: 60×60, borderRadius=15 + 온라인 도트(우하단) */}
      <View style={{ marginRight: 12 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 15,
            backgroundColor: item.avatarColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", letterSpacing: -0.32 }}>{item.initial}</Text>
        </View>
        {/* 온라인 도트: right=0, bottom=0 */}
        <View style={{ position: "absolute", right: 0, bottom: 0 }}>
          <OnlineDot width={20} height={20} />
        </View>
      </View>

      {/* 텍스트 컨텐츠 */}
      <View style={{ flex: 1 }}>
        {/* 1행: 이름 + 시간 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", letterSpacing: -0.32 }}>{item.name}</Text>
          <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.32 }}>{item.time}</Text>
        </View>

        {/* 2행: 타입 배지(분실/습득) + 아이템명 */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          {/* 타입 배지: h=20, w=35, borderRadius=10 */}
          <View
            style={{
              backgroundColor: TYPE_COLOR[item.type],
              borderRadius: 10,
              width: 35,
              height: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff", lineHeight: 14 }}>{item.type}</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#919191", letterSpacing: -0.32 }} numberOfLines={1}>
            {item.itemName}
          </Text>
        </View>

        {/* 3행: 마지막 메시지 + 미읽음 배지 */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              color: "#464646",
              letterSpacing: -0.32,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {/* 미읽음 배지: h=20, w=35, orange */}
          {item.unread > 0 && (
            <View
              style={{
                backgroundColor: "#F4551E",
                borderRadius: 10,
                width: 35,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff", lineHeight: 14 }}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");

  const filtered = activeFilter === "전체" ? CHATS : CHATS.filter((c) => c.type === activeFilter);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* 헤더: "채팅" centered, 20px Medium */}
      <View
        style={{
          paddingTop: 60,
          paddingBottom: 0,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "500", color: "#000", letterSpacing: -0.32 }}>채팅</Text>
      </View>

      {/* 필터 탭바: h=50, borderBottom #E5E7EB */}
      {/* Figma centers: 전체 x=44, 분실 x=100, 습득 x=156 (gap 56px) */}
      <View
        style={{
          height: 50,
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 24,
          gap: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          backgroundColor: "#F5F7FA",
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity key={f.key} onPress={() => setActiveFilter(f.key)} style={{ paddingBottom: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isActive ? "#000" : "#757575",
                  letterSpacing: -0.32,
                }}
              >
                {f.key} {f.count}
              </Text>
              {isActive && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: "#1E3A5F",
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 채팅 목록 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <ChatRow key={item.id} item={item} onPress={() => router.push("/chatroom")} />
        ))}
      </ScrollView>
    </View>
  );
}
