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

function parseUTC(iso: string): Date {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
}

function formatTime(dateStr: string): string {
  const date = parseUTC(dateStr);
  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";
  return `${ampm} ${hours % 12 || 12}:${mins}`;
}

function formatDateChip(dateStr: string): string {
  const date = parseUTC(dateStr);
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
    const dateKey = parseUTC(msg.createdDate).toDateString();
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
      <div className="bg-white border border-[#E9ECF0] rounded-[15px] px-3 py-3 max-w-[232px]">
        <p className="text-sm text-[#464646] leading-5">{text}</p>
      </div>
      {time && <span className="text-[10px] text-[#6B7480] ml-1 mb-0.5 shrink-0">{time}</span>}
    </div>
  );
}

function SentBubble({ text, time, read, showUnread }: { text: string; time?: string; read?: boolean; showUnread?: boolean }) {
  return (
    <div className="flex items-end justify-end self-end mb-2 max-w-[85%]">
      <div className="flex flex-col items-end mr-1 mb-0.5">
        {showUnread && <span className="text-[10px] text-app-gray leading-[14px]">1</span>}
        {read === true && <span className="text-[10px] text-navy leading-[14px]">읽음</span>}
        {time && <span className="text-[10px] text-[#6B7480] leading-[14px]">{time}</span>}
      </div>
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
  const [otherUserName, setOtherUserName] = useState(searchParams.get("name") ?? "");
  const [targetTitle, setTargetTitle] = useState(searchParams.get("title") ?? "");
  const [targetItemType, setTargetItemType] = useState<"FOUND" | "LOST" | null>(
    searchParams.get("itemType") as "FOUND" | "LOST" | null
  );
  const [targetRegistrationId, setTargetRegistrationId] = useState(searchParams.get("registrationId"));
  const [otherUserProfileImageUrl, setOtherUserProfileImageUrl] = useState(searchParams.get("profileImage"));

  const [messages, setMessages] = useState<Message[]>([]);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then((d) => setMyUserId(d.id)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!targetRegistrationId || !token) return;
    fetch(`${API_BASE}/api/registration/${targetRegistrationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.result?.imageUrl) setItemImageUrl(d.result.imageUrl); })
      .catch(() => {});
  }, [targetRegistrationId, token]);

  // 알림에서 진입 시 쿼리 파라미터 없으면 룸 정보 조회
  useEffect(() => {
    if (!roomId || !token || otherUserName) return;
    fetch(`${API_BASE}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const room = (d.result ?? []).find((r: { id: number }) => String(r.id) === roomId);
        if (room) {
          setOtherUserName(room.otherUserName);
          setTargetTitle(room.targetTitle);
          setTargetItemType(room.targetItemType);
          setTargetRegistrationId(String(room.targetRegistrationId));
          if (room.otherUserProfileImageUrl) setOtherUserProfileImageUrl(room.otherUserProfileImageUrl);
        }
      })
      .catch(() => {});
  }, [roomId, token, otherUserName]);

  const markRead = useCallback(() => {
    if (!roomId || !token) return;
    fetch(`${API_BASE}/api/chat/rooms/${roomId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [roomId, token]);

  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.result ?? []);
        markRead();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId, token, markRead]);

  useEffect(() => {
    if (!roomId || !token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_HTTP_URL}?access_token=${token}`, null, {
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
      }),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/chat/rooms/${roomId}`, (frame) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
          markRead();
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !imageFile) return;

    if (imageFile && token) {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (trimmed) formData.append("content", trimmed);
      try {
        await fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch {
        if (trimmed && stompClientRef.current?.connected) {
          stompClientRef.current.publish({
            destination: `/app/chat/rooms/${roomId}/messages`,
            body: JSON.stringify({ content: trimmed }),
          });
        }
      }
      clearImage();
      setInputText("");
      return;
    }

    if (!stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: `/app/chat/rooms/${roomId}/messages`,
      body: JSON.stringify({ content: trimmed }),
    });
    setInputText("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, imageFile, roomId, token]);

  const typeColor = targetItemType === "LOST" ? "#FF7A00" : "#1E3A5F";
  const typeLabel = targetItemType === "LOST" ? "분실" : "습득";
  const grouped = groupByDate(messages);
  const lastSentId = [...messages].reverse().find((m) => m.senderId === myUserId)?.id;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-full bg-app-bg">
      {/* 헤더 */}
      <div className="bg-app-bg md:bg-app-bg border-b border-app-gray-light shrink-0">
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

      {/* 아이템 카드 (상단 고정) */}
      {targetTitle && (
        <div className="px-3 pt-3 shrink-0 bg-app-bg md:bg-app-bg">
          <div className="bg-white rounded-[15px] h-[74px] md:h-[88px] flex items-center p-3 shadow-sm">
            <div className="w-[50px] h-[50px] md:w-[62px] md:h-[62px] rounded-[15px] bg-app-gray-light shrink-0 overflow-hidden">
              {itemImageUrl && (
                <Image src={itemImageUrl} alt="" width={62} height={62} className="w-full h-full object-cover" unoptimized />
              )}
            </div>
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
        </div>
      )}

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-4 pb-4 flex flex-col">
        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-6 h-6 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
          </div>
        ) : (
          grouped.map((item, i) =>
            typeof item === "string" ? (
              <DateChip key={`date-${i}`} date={item} />
            ) : item.senderId === myUserId ? (
              <SentBubble key={item.id} text={item.content} time={formatTime(item.createdDate)} read={item.id === lastSentId ? item.read : undefined} showUnread={item.id === lastSentId && !item.read} />
            ) : (
              <ReceivedBubble key={item.id} text={item.content} time={formatTime(item.createdDate)} />
            )
          )
        )}
      </div>

      {/* 입력 바 */}
      <div className="px-6 pt-3 pb-5 bg-app-bg md:bg-app-bg shrink-0 border-t border-app-gray-light sticky bottom-0 z-10">
        {/* 이미지 프리뷰 */}
        {imagePreview && (
          <div className="relative w-[60px] h-[60px] mb-2">
            <Image src={imagePreview} alt="" width={60} height={60} className="w-full h-full object-cover rounded-[10px]" unoptimized />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center cursor-pointer border-none leading-none"
            >×</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-transparent border-none shrink-0">
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
              <path d="M14.5 28C21.9558 28 28 21.9558 28 14.5C28 7.04416 21.9558 1 14.5 1C7.04416 1 1 7.04416 1 14.5C1 21.9558 7.04416 28 14.5 28Z" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.09996 14.5H19.9" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.5 9.1001V19.9001" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
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
              <circle cx="13.5" cy="13.5" r="12.5" fill="white" stroke="#1E3A5F" strokeWidth="1.5" />
              <path d="M14.4728 22.4258C14.5036 22.5025 14.5571 22.5679 14.6261 22.6134C14.6952 22.6588 14.7764 22.682 14.859 22.6798C14.9416 22.6777 15.0216 22.6504 15.0882 22.6015C15.1549 22.5526 15.2049 22.4846 15.2317 22.4064L20.4961 7.01816C20.522 6.9464 20.527 6.86874 20.5104 6.79427C20.4938 6.71979 20.4563 6.65159 20.4023 6.59764C20.3484 6.54369 20.2802 6.50622 20.2057 6.48961C20.1313 6.473 20.0536 6.47795 19.9818 6.50387L4.5936 11.7683C4.51544 11.7951 4.44735 11.8451 4.39847 11.9118C4.34959 11.9784 4.32226 12.0584 4.32014 12.141C4.31802 12.2236 4.34123 12.3048 4.38663 12.3739C4.43204 12.4429 4.49748 12.4964 4.57416 12.5271L10.9967 15.1027C11.1998 15.1839 11.3842 15.3055 11.539 15.46C11.6938 15.6145 11.8157 15.7988 11.8973 16.0016L14.4728 22.4258Z" fill="white" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.3997 6.60059L11.5394 15.4602" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* 더보기 바텀시트 */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMenu(false)} />
          <div className="relative bg-white rounded-t-[20px] pb-8 md:rounded-2xl md:w-[360px] md:pb-2">
            <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3 mb-2 md:hidden" />
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
            <button onClick={() => setShowMenu(false)} className="hidden md:block w-full px-6 py-4 border-t border-[#F0F0F0] text-left cursor-pointer bg-transparent border-none">
              <span className="text-base text-app-gray">닫기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
