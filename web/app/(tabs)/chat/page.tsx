"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ChatType = "분실" | "습득";
type FilterKey = "전체" | "분실" | "습득";

const CHATS = [
  { id: 1, name: "이찬원", initial: "이", avatarColor: "#7487FF", type: "분실" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
  { id: 2, name: "박지원", initial: "박", avatarColor: "#D8BF92", type: "습득" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
  { id: 3, name: "김석진", initial: "김", avatarColor: "#FF9A9A", type: "습득" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
  { id: 4, name: "최인규", initial: "최", avatarColor: "#96D49F", type: "분실" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
  { id: 5, name: "강민석", initial: "강", avatarColor: "#B882B1", type: "습득" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
  { id: 6, name: "정우성", initial: "정", avatarColor: "#FFE374", type: "분실" as ChatType, itemName: "검은색 kodak 모자", lastMessage: "혹시 모자 안쪽에 이름 같은거 적혀있나요? 확인..", time: "방금", unread: 2 },
];

const TYPE_COLOR: Record<ChatType, string> = { 분실: "#FF7A00", 습득: "#1E3A5F" };
const FILTERS: { key: FilterKey; count: number }[] = [
  { key: "전체", count: 6 },
  { key: "분실", count: 3 },
  { key: "습득", count: 3 },
];

function OnlineDot({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="white" />
      <circle cx="10" cy="10" r="8" fill="#22C55E" />
    </svg>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");

  const filtered = activeFilter === "전체" ? CHATS : CHATS.filter((c) => c.type === activeFilter);

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 헤더 */}
      <div className="pt-8 pb-0 flex justify-center">
        <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">채팅</h1>
      </div>

      {/* 필터 탭 */}
      <div className="h-[50px] flex items-end gap-5 px-6 border-b border-app-gray-light bg-app-bg">
        {FILTERS.map(({ key, count }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="relative pb-2 bg-transparent border-none cursor-pointer"
            >
              <span className="text-sm font-bold tracking-[-0.32px]" style={{ color: isActive ? "#000" : "#757575" }}>
                {key} {count}
              </span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
            </button>
          );
        })}
      </div>

      {/* 채팅 목록 */}
      <div>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(`/chatroom/${item.id}`)}
            className="w-full h-[105px] flex items-center px-6 border-b border-app-gray-light bg-app-bg cursor-pointer text-left"
          >
            {/* 아바타 */}
            <div className="relative mr-3 shrink-0">
              <div
                className="w-[60px] h-[60px] rounded-[15px] flex items-center justify-center"
                style={{ backgroundColor: item.avatarColor }}
              >
                <span className="text-base font-semibold text-white tracking-[-0.32px]">{item.initial}</span>
              </div>
              <div className="absolute right-0 bottom-0">
                <OnlineDot size={20} />
              </div>
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base font-semibold text-black tracking-[-0.32px]">{item.name}</span>
                <span className="text-xs text-app-gray tracking-[-0.32px]">{item.time}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="text-xs font-bold text-white rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: TYPE_COLOR[item.type], width: 35, height: 20, lineHeight: "14px" }}
                >
                  {item.type}
                </span>
                <span className="text-xs text-app-gray tracking-[-0.32px] truncate">{item.itemName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex-1 text-xs text-[#464646] tracking-[-0.32px] truncate mr-2">{item.lastMessage}</span>
                {item.unread > 0 && (
                  <span
                    className="text-xs font-bold text-white rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#F4551E", width: 35, height: 20 }}
                  >
                    {item.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
