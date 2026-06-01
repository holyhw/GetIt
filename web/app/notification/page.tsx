"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotifStore } from "@/stores/notifStore";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/notification";
import TopHeader from "@/components/TopHeader";

function parseUTC(iso: string): Date {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
}

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - parseUTC(iso).getTime()) / 60000);
  if (diff < 1) return "방금 전";
  if (diff < 60) return `${diff}분 전`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}시간 전`;
  const d = parseUTC(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(iso: string): boolean {
  const d = parseUTC(iso), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function NotifIcon({ type }: { type: string }) {
  const isMatch = type === "MATCH_CANDIDATE";
  const isChat = type === "CHAT_MESSAGE";
  const bgColor = isMatch ? "#EEF3FB" : isChat ? "#EEF3FB" : "#F0F0F0";
  return (
    <div
      className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      {isMatch ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#1E3A5F" strokeWidth="1.8" />
          <path d="M6.5 10.5L9 13L13.5 8" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : isChat ? (
        <svg width="20" height="20" viewBox="0 0 23 25" fill="none">
          <path d="M15.5889 10.1607C15.5889 10.7497 15.3735 11.3145 14.9901 11.731C14.6067 12.1475 14.0867 12.3814 13.5445 12.3814H6.21308C5.6709 12.3815 5.15097 12.6156 4.76765 13.0321L2.51671 15.4771C2.41521 15.5874 2.2859 15.6624 2.14512 15.6928C2.00435 15.7232 1.85843 15.7076 1.72583 15.648C1.59322 15.5883 1.47987 15.4873 1.40012 15.3577C1.32037 15.228 1.2778 15.0756 1.27778 14.9197V3.49851C1.27778 2.90953 1.49317 2.34468 1.87658 1.92821C2.25999 1.51175 2.78001 1.27778 3.32223 1.27778H13.5445C14.0867 1.27778 14.6067 1.51175 14.9901 1.92821C15.3735 2.34468 15.5889 2.90953 15.5889 3.49851V10.1607Z" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.6778 9.05026C20.22 9.05026 20.74 9.28423 21.1234 9.7007C21.5068 10.1172 21.7222 10.682 21.7222 11.271V22.6922C21.7222 22.8481 21.6796 23.0005 21.5999 23.1301C21.5201 23.2598 21.4068 23.3608 21.2742 23.4205C21.1416 23.4801 20.9956 23.4957 20.8549 23.4653C20.7141 23.4349 20.5848 23.3598 20.4833 23.2496L18.2323 20.8046C17.849 20.3881 17.3291 20.154 16.7869 20.1539H9.45551C8.91329 20.1539 8.39328 19.9199 8.00987 19.5035C7.62646 19.087 7.41106 18.5222 7.41106 17.9332V16.8228" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#919191" strokeWidth="1.8" />
          <path d="M10 6V11" stroke="#919191" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="13.5" r="0.8" fill="#919191" />
        </svg>
      )}
    </div>
  );
}

function NotifRow({ notif, onPress, onDelete, unreadCount }: { notif: ApiNotification; onPress: () => void; onDelete: () => void; unreadCount?: number }) {
  return (
    <div
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPress()}
      className="w-full flex items-start gap-3 rounded-[14px] p-3.5 text-left cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: notif.read ? "#fff" : "#EEF3FB" }}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-[3px]">
          <span className="text-[13px] font-bold text-black tracking-[-0.3px] flex-1 mr-2 truncate">{notif.title}</span>
          <span className="text-[10px] text-[#ABABAB] tracking-[-0.2px] shrink-0">{formatRelativeTime(notif.createdDate)}</span>
        </div>
        <p className="text-xs text-[#434343] leading-[17px] tracking-[-0.2px]">{notif.message}</p>
      </div>
      <div className="flex flex-col items-center gap-2 shrink-0">
        {!notif.read && (
          unreadCount && unreadCount > 1
            ? <span className="text-[10px] font-bold text-white bg-[#F4551E] rounded-md min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">{unreadCount > 99 ? "99+" : unreadCount}</span>
            : <div className="w-[7px] h-[7px] rounded-full bg-[#F4551E]" />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-base text-[#C0C0C0] leading-none bg-transparent border-none cursor-pointer p-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function NotificationPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [notifs, setNotifs] = useState<ApiNotification[]>([]);
  const [chatUnreadMap, setChatUnreadMap] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<ApiNotification[]>("/api/notifications", token);
      const all = data ?? [];
      // 채팅방별 안읽음 개수 계산
      const chatUnreadMap = new Map<number, number>();
      all.forEach((n) => {
        if (n.type === "CHAT_MESSAGE" && !n.read && n.targetId) {
          chatUnreadMap.set(n.targetId, (chatUnreadMap.get(n.targetId) ?? 0) + 1);
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
      setChatUnreadMap(chatUnreadMap);
      const groupedUnread = grouped.filter((n) => !n.read).length;
      setUnreadCount(groupedUnread);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, [token, setUnreadCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifs();
  }, [fetchNotifs]);

  const markRead = async (notif: ApiNotification) => {
    if (!token) return;
    if (!notif.read) {
      try {
        await api.patch(`/api/notifications/${notif.id}/read`, token, {});
        setNotifs((prev) => {
          const updated = prev.map((n) => n.id === notif.id ? { ...n, read: true } : n);
          setUnreadCount(updated.filter((n) => !n.read).length);
          return updated;
        });
      } catch {}
    }
    if (notif.targetType === "REGISTRATION" && notif.targetId) {
      router.push(`/detail/${notif.targetId}`);
    } else if (notif.targetType === "CHAT_ROOM" && notif.targetId) {
      router.push(`/chat/${notif.targetId}`);
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await api.patch("/api/notifications/read-all", token, {});
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id: number) => {
    if (!token) return;
    try {
      await api.delete(`/api/notifications/${id}`, token);
      setNotifs((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        setUnreadCount(updated.filter((n) => !n.read).length);
        return updated;
      });
    } catch {}
  };

  const unread = notifs.filter((n) => !n.read).length;
  const todayNotifs = notifs.filter((n) => isToday(n.createdDate));
  const beforeNotifs = notifs.filter((n) => !isToday(n.createdDate));

  if (loading) {
    return (
      <div className="min-h-dvh bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app-bg md:pt-[72px]">
      <TopHeader />

      {/* 모바일 헤더 */}
      <div className="md:hidden flex items-center px-6 pt-8 pb-3">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center items-center gap-1.5">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">알림</h1>
          {unread > 0 && (
            <div className="bg-[#F4551E] rounded-[10px] min-w-5 h-5 px-1.5 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">{unread}</span>
            </div>
          )}
        </div>
        <button onClick={markAllRead}
          className="text-xs font-semibold tracking-[-0.2px] cursor-pointer bg-transparent border-none"
          style={{ color: unread > 0 ? "#1E3A5F" : "#C0C0C0" }}>
          모두 읽음
        </button>
      </div>

      <div className="md:max-w-[600px] md:mx-auto">
        {/* 데스크탑 헤더 */}
        <div className="hidden md:flex items-center justify-end pt-6 pb-3">
          <button onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-1.5 px-4 h-[34px] rounded-full text-xs font-semibold cursor-pointer border-none transition-colors"
            style={{
              backgroundColor: unread > 0 ? "#1E3A5F" : "#E5E7EB",
              color: unread > 0 ? "#fff" : "#ABABAB",
            }}>
            <svg width="12" height="10" viewBox="0 0 15 11" fill="none">
              <path d="M1 5.5L5.5 10L14 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            모두 읽음
          </button>
        </div>

      {/* 목록 */}
      <div className="overflow-y-auto pb-24">
        {notifs.length === 0 ? (
          <div className="flex justify-center mt-[120px]">
            <p className="text-sm text-[#ABABAB] tracking-[-0.3px]">알림이 없어요</p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-app-gray px-6 py-2.5 tracking-[-0.2px]">오늘</p>
                <div className="px-4 flex flex-col gap-2">
                  {todayNotifs.map((n) => (
                    <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} unreadCount={n.type === "CHAT_MESSAGE" && n.targetId ? chatUnreadMap.get(n.targetId) : undefined} />
                  ))}
                </div>
              </div>
            )}
            {beforeNotifs.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-bold text-app-gray px-6 py-2.5 tracking-[-0.2px]">이전</p>
                <div className="px-4 flex flex-col gap-2">
                  {beforeNotifs.map((n) => (
                    <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} unreadCount={n.type === "CHAT_MESSAGE" && n.targetId ? chatUnreadMap.get(n.targetId) : undefined} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div> {/* md:max-w-[600px] */}
    </div>
  );
}
