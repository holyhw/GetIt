"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import Image from "next/image";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE = "https://api.getitsju.com";
const WS_HTTP_URL = "https://api.getitsju.com/ws/chat";

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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";
  return `${ampm} ${hours % 12 || 12}:${mins}`;
}

function formatDateChip(dateStr: string): string {
  const date = new Date(dateStr);
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
    const dateKey = new Date(msg.createdDate).toDateString();
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
    <div className="flex items-end self-start mb-2 max-w-[85%]">
      <div className="bg-app-bg rounded-[15px] px-3 py-3 max-w-[232px]">
        <p className="text-sm text-[#464646] leading-5">{text}</p>
      </div>
      {time && <span className="text-[10px] text-[#6B7480] ml-1 mb-0.5 shrink-0">{time}</span>}
    </div>
  );
}

function SentBubble({ text, time, read }: { text: string; time?: string; read?: boolean }) {
  return (
    <div className="flex items-end justify-end self-end mb-2 max-w-[85%]">
      {(read || time) && (
        <div className="flex flex-col items-end mr-1 mb-0.5">
          {read && <span className="text-[10px] text-navy leading-[14px]">읽음</span>}
          {time && <span className="text-[10px] text-[#6B7480] leading-[14px]">{time}</span>}
        </div>
      )}
      <div className="bg-navy border border-[#7E8FA5] rounded-[15px] px-3 py-3 max-w-[232px]">
        <p className="text-sm text-white leading-5">{text}</p>
      </div>
    </div>
  );
}

function DateChip({ date }: { date: string }) {
  return (
    <div className="flex justify-center my-3">
      <span className="bg-app-gray-light rounded-[15px] px-3 h-6 flex items-center text-xs font-medium text-[#434343]">{date}</span>
    </div>
  );
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();

  const roomId = params?.id;
  const otherUserName = searchParams.get("name") ?? "";
  const targetTitle = searchParams.get("title") ?? "";
  const targetItemType = searchParams.get("itemType") as "FOUND" | "LOST" | null;
  const targetRegistrationId = searchParams.get("registrationId");
  const otherUserProfileImageUrl = searchParams.get("profileImage");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then((d) => setMyUserId(d.id)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setMessages(d.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId, token]);

  useEffect(() => {
    if (!roomId || !token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_HTTP_URL}?access_token=${token}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/chat/rooms/${roomId}`, (frame) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [roomId, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || !stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: `/app/chat/rooms/${roomId}/messages`,
      body: JSON.stringify({ content: trimmed }),
    });
    setInputText("");
  }, [inputText, roomId]);

  const typeColor = targetItemType === "LOST" ? "#FF7A00" : "#1E3A5F";
  const typeLabel = targetItemType === "LOST" ? "분실" : "습득";
  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-dvh md:h-full bg-app-bg md:bg-white">
      {/* 헤더 */}
      <div className="bg-app-bg md:bg-white border-b border-app-gray-light shrink-0">
        <div className="h-[51px] md:h-[80px] flex items-center px-6 gap-5">
          <button onClick={() => router.push("/chat")} className="md:hidden cursor-pointer bg-transparent border-none p-1 shrink-0">
            <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
              <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative shrink-0">
            <div className="w-[37px] h-[37px] md:w-[48px] md:h-[48px] rounded-[15px] overflow-hidden bg-[#7487FF] flex items-center justify-center">
              {otherUserProfileImageUrl ? (
                <Image src={otherUserProfileImageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-base md:text-xl font-semibold text-white tracking-[-0.32px]">
                  {otherUserName.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base md:text-lg font-semibold text-black tracking-[-0.32px]">{otherUserName}</p>
          </div>

          <button onClick={() => setShowMenu(true)} className="cursor-pointer bg-transparent border-none p-2 shrink-0">
            <svg width="3" height="15" viewBox="0 0 3 15" fill="none">
              <path d="M1.5 1.50684V1.50008" stroke="black" strokeWidth="3" strokeLinecap="round" />
              <path d="M1.5 7.50342V7.49666" stroke="black" strokeWidth="3" strokeLinecap="round" />
              <path d="M1.5 13.5V13.4932" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-4 pb-4 flex flex-col">
        {targetTitle && (
          <div className="bg-white rounded-[15px] h-[74px] md:h-[88px] flex items-center p-3 shadow-sm mb-4 shrink-0">
            <div className="w-[50px] h-[50px] md:w-[62px] md:h-[62px] rounded-[15px] bg-app-gray-light shrink-0" />
            <div className="flex-1 ml-3 min-w-0">
              <div className="mb-1.5">
                <span className="rounded-[9px] px-2 h-[18px] inline-flex items-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: typeColor }}>
                  {typeLabel}
                </span>
              </div>
              <p className="text-base md:text-lg font-bold text-black tracking-[-0.32px] truncate">{targetTitle}</p>
            </div>
            {targetRegistrationId && (
              <button
                onClick={() => router.push(`/detail/${targetRegistrationId}?type=${targetItemType?.toLowerCase() ?? "found"}`)}
                className="bg-[#D9D9D9] rounded-[10px] w-[47px] md:w-[56px] h-[26px] md:h-[32px] text-xs md:text-sm font-semibold text-black cursor-pointer border-none shrink-0">
                상세
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-6 h-6 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
          </div>
        ) : (
          grouped.map((item, i) =>
            typeof item === "string" ? (
              <DateChip key={`date-${i}`} date={item} />
            ) : item.senderId === myUserId ? (
              <SentBubble key={item.id} text={item.content} time={formatTime(item.createdDate)} read={item.read} />
            ) : (
              <ReceivedBubble key={item.id} text={item.content} time={formatTime(item.createdDate)} />
            )
          )
        )}
      </div>

      {/* 입력 바 */}
      <div className="flex items-center px-6 py-5 bg-app-bg md:bg-white gap-2 shrink-0 border-t border-app-gray-light md:border-none">
        <div className="flex-1 h-[39px] bg-white border border-app-border rounded-[20px] px-3.5 flex items-center shadow-[0_0_4px_rgba(0,0,0,0.08)]">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메세지 입력"
            className="w-full text-xs font-semibold text-black tracking-[-0.32px] outline-none bg-transparent placeholder:text-[#B2B6BD]"
          />
        </div>
        <button onClick={handleSend} className="cursor-pointer bg-transparent border-none shrink-0">
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
            <circle cx="13.5" cy="13.5" r="13.5" fill="white" />
            <path d="M14.4728 22.4258C14.5036 22.5025 14.5571 22.5679 14.6261 22.6134C14.6952 22.6588 14.7764 22.682 14.859 22.6798C14.9416 22.6777 15.0216 22.6504 15.0882 22.6015C15.1549 22.5526 15.2049 22.4846 15.2317 22.4064L20.4961 7.01816C20.522 6.9464 20.527 6.86874 20.5104 6.79427C20.4938 6.71979 20.4563 6.65159 20.4023 6.59764C20.3484 6.54369 20.2802 6.50622 20.2057 6.48961C20.1313 6.473 20.0536 6.47795 19.9818 6.50387L4.5936 11.7683C4.51544 11.7951 4.44735 11.8451 4.39847 11.9118C4.34959 11.9784 4.32226 12.0584 4.32014 12.141C4.31802 12.2236 4.34123 12.3048 4.38663 12.3739C4.43204 12.4429 4.49748 12.4964 4.57416 12.5271L10.9967 15.1027C11.1998 15.1839 11.3842 15.3055 11.539 15.46C11.6938 15.6145 11.8157 15.7988 11.8973 16.0016L14.4728 22.4258Z" fill="white" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.3997 6.60059L11.5394 15.4602" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 더보기 바텀시트 */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMenu(false)} />
          <div className="relative bg-white rounded-t-[20px] pb-8">
            <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3 mb-2" />
            <button
              onClick={() => { setShowMenu(false); if (confirm("이 사용자를 신고하시겠어요?")) {} }}
              className="w-full px-6 py-4 text-left cursor-pointer bg-transparent border-none">
              <span className="text-base text-red-500">신고하기</span>
            </button>
            <div className="h-px bg-[#F0F0F0] mx-6" />
            <button
              onClick={() => { setShowMenu(false); router.push("/chat"); }}
              className="w-full px-6 py-4 text-left cursor-pointer bg-transparent border-none">
              <span className="text-base text-[#434343]">채팅방 나가기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
