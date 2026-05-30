"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/notification";

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "방금 전";
  if (diff < 60) return `${diff}분 전`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}시간 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function NotifIcon({ type }: { type: string }) {
  const isMatch = type === "MATCH_CANDIDATE";
  return (
    <div
      className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: isMatch ? "#EEF3FB" : "#F0F0F0" }}
    >
      {isMatch ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#1E3A5F" strokeWidth="1.8" />
          <path d="M6.5 10.5L9 13L13.5 8" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function NotifRow({ notif, onPress, onDelete }: { notif: ApiNotification; onPress: () => void; onDelete: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-start gap-3 rounded-[14px] p-3.5 text-left cursor-pointer border-none shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
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
        {!notif.read && <div className="w-[7px] h-[7px] rounded-full bg-[#F4551E]" />}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-base text-[#C0C0C0] leading-none bg-transparent border-none cursor-pointer p-1"
        >
          ×
        </button>
      </div>
    </button>
  );
}

export default function NotificationPage() {
  const router = useRouter();
  const { token } = useAuthStore();
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

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const markRead = async (notif: ApiNotification) => {
    if (!token) return;
    if (!notif.read) {
      try {
        await api.patch(`/api/notifications/${notif.id}/read`, token, {});
        setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
      } catch {}
    }
    if (notif.targetType === "REGISTRATION" && notif.targetId) {
      router.push(`/detail/${notif.targetId}`);
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
      <div className="min-h-dvh bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 헤더 */}
      <div className="flex items-center px-6 pt-8 pb-3">
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
        <button
          onClick={markAllRead}
          className="text-xs font-semibold tracking-[-0.2px] cursor-pointer bg-transparent border-none"
          style={{ color: unread > 0 ? "#1E3A5F" : "#C0C0C0" }}
        >
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
                    <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} />
                  ))}
                </div>
              </div>
            )}
            {beforeNotifs.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-bold text-app-gray px-6 py-2.5 tracking-[-0.2px]">이전</p>
                <div className="px-4 flex flex-col gap-2">
                  {beforeNotifs.map((n) => (
                    <NotifRow key={n.id} notif={n} onPress={() => markRead(n)} onDelete={() => deleteNotif(n.id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
