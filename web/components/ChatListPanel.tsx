"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

const API_BASE = "https://api.getitsju.com";

type ItemType = "FOUND" | "LOST";
type FilterKey = "전체" | "분실" | "습득";

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
const FILTERS: FilterKey[] = ["전체", "분실", "습득"];

export default function ChatListPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");

  const fetchRooms = useCallback(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setRooms(d.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // 채팅방에서 나와 목록으로 돌아올 때 재조회
  useEffect(() => {
    if (pathname === "/chat") fetchRooms();
  }, [pathname, fetchRooms]);

  // 탭/창 포커스 시 재조회
  useEffect(() => {
    window.addEventListener("focus", fetchRooms);
    return () => window.removeEventListener("focus", fetchRooms);
  }, [fetchRooms]);

  const filtered = activeFilter === "전체" ? rooms
    : rooms.filter((r) => activeFilter === "분실" ? r.targetItemType === "LOST" : r.targetItemType === "FOUND");

  const getCount = (key: FilterKey) =>
    key === "전체" ? rooms.length
    : key === "분실" ? rooms.filter(r => r.targetItemType === "LOST").length
    : rooms.filter(r => r.targetItemType === "FOUND").length;

  const handleChatClick = (room: ChatRoom) => {
    setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, unreadCount: 0 } : r));
    const params = new URLSearchParams({
      name: room.otherUserName,
      title: room.targetTitle,
      itemType: room.targetItemType,
      registrationId: String(room.targetRegistrationId),
    });
    if (room.otherUserProfileImageUrl) params.set("profileImage", room.otherUserProfileImageUrl);
    router.push(`/chat/${room.id}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full bg-app-bg md:bg-white">
      {/* 헤더 */}
      <div className="pt-8 pb-0 flex justify-center md:hidden">
        <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">채팅 목록</h1>
      </div>
      <div className="hidden md:flex items-center px-5 pt-5 pb-0">
        <h2 className="text-base font-bold text-black">채팅 목록</h2>
      </div>

      {/* 필터 탭 */}
      <div className="flex items-end gap-5 px-6 h-[50px] border-b border-app-gray-light">
        {FILTERS.map((key) => {
          const isActive = activeFilter === key;
          return (
            <button key={key} onClick={() => setActiveFilter(key)}
              className="relative pb-2 bg-transparent border-none cursor-pointer">
              <span className="text-sm font-bold tracking-[-0.32px]" style={{ color: isActive ? "#000" : "#757575" }}>
                {key} {getCount(key)}
              </span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
            </button>
          );
        })}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
          </div>
        ) : !token ? (
          <div className="flex flex-col items-center pt-24 gap-3">
            <p className="text-sm text-app-gray">로그인 후 채팅을 이용하세요</p>
            <button onClick={() => router.push("/login")}
              className="h-10 px-6 rounded-[10px] bg-navy text-white text-sm font-semibold cursor-pointer">
              로그인하기
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center pt-24">
            <p className="text-sm text-app-gray">채팅이 없어요</p>
          </div>
        ) : (
          filtered.map((room) => {
            const isActive = pathname === `/chat/${room.id}`;
            return (
              <button key={room.id} onClick={() => handleChatClick(room)}
                className={`w-full flex items-center px-6 border-b border-app-gray-light text-left cursor-pointer transition-colors ${isActive ? "bg-navy/5" : "bg-app-bg md:bg-white md:hover:bg-app-bg"}`}
                style={{ height: 105 }}>
                <div className="relative mr-3 shrink-0">
                  <div className="w-[60px] h-[60px] rounded-[15px] overflow-hidden bg-[#7487FF] flex items-center justify-center">
                    {room.otherUserProfileImageUrl ? (
                      <Image src={room.otherUserProfileImageUrl} alt="" width={60} height={60} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-base font-semibold text-white tracking-[-0.32px]">
                        {room.otherUserName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-semibold text-black tracking-[-0.32px]">{room.otherUserName}</span>
                    <span className="text-xs text-app-gray tracking-[-0.32px]">{formatTime(room.lastMessageAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-bold text-white rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: TYPE_COLOR[room.targetItemType], width: 35, height: 20 }}>
                      {TYPE_LABEL[room.targetItemType]}
                    </span>
                    <span className="text-xs text-app-gray tracking-[-0.32px] truncate">{room.targetTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-xs text-[#464646] tracking-[-0.32px] truncate mr-2">{room.lastMessage ?? ""}</span>
                    {room.unreadCount > 0 && (
                      <span className="text-xs font-bold text-white rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#F4551E", width: 35, height: 20 }}>
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
