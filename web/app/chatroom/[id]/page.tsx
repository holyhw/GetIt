"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-dvh bg-app-bg">
      {/* 헤더 */}
      <div className="bg-app-bg border-b border-app-gray-light shrink-0">
        <div className="h-[51px] flex items-center px-6 gap-5">
          <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1 shrink-0">
            <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
              <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative shrink-0">
            <div className="w-[37px] h-[37px] rounded-[15px] bg-[#7487FF] flex items-center justify-center">
              <span className="text-base font-semibold text-white tracking-[-0.32px]">이</span>
            </div>
            <div className="absolute -right-0.5 bottom-0">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="white" />
                <circle cx="10" cy="10" r="8" fill="#22C55E" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-black tracking-[-0.32px]">이찬원</p>
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <circle cx="3" cy="3" r="3" fill="#22C55E" />
              </svg>
              <span className="text-[10px] text-app-gray tracking-[-0.32px]">지금 활동중</span>
            </div>
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
        {/* 아이템 카드 */}
        <div className="bg-white rounded-[15px] h-[74px] flex items-center p-3 shadow-sm mb-4 shrink-0">
          <div className="w-[50px] h-[50px] rounded-[15px] bg-app-gray-light shrink-0" />
          <div className="flex-1 ml-3 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="bg-navy rounded-[9px] w-[30px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white shrink-0">습득</span>
              <span className="text-[10px] font-semibold text-black tracking-[-0.32px]">매칭 유사도 </span>
              <span className="text-[10px] font-black text-orange tracking-[-0.32px]">92%</span>
            </div>
            <p className="text-base font-bold text-black tracking-[-0.32px] truncate">검은색 kodak 모자</p>
          </div>
          <button
            onClick={() => router.push("/detail/1")}
            className="bg-[#D9D9D9] rounded-[10px] w-[47px] h-[26px] text-xs font-semibold text-black cursor-pointer border-none shrink-0"
          >
            상세
          </button>
        </div>

        <DateChip date="2026.05.12  화" />

        <ReceivedBubble text="안녕하세요, 강남역에서 잃어버린 모자 사진 보고 연락드렸어요!" />
        <ReceivedBubble text="혹시 모자 챙 안쪽에 작은 얼룩 같은거 있을까요?" time="오후 2:34" />
        <SentBubble text="네 안녕하세여. 잠시만요, 사진 한 번 더 찍어볼게요" />
        <SentBubble text="여기 챙 안쪽이에요. 이거 맞으실까요?" read time="오후 2:34" />

        {messages.map((msg) => (
          <SentBubble key={msg.id} text={msg.text} />
        ))}
      </div>

      {/* 입력 바 */}
      <div className="flex items-center px-6 py-5 bg-app-bg gap-2 shrink-0">
        <button className="cursor-pointer bg-transparent border-none shrink-0">
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
            <path d="M14.5 28C21.9558 28 28 21.9558 28 14.5C28 7.04416 21.9558 1 14.5 1C7.04416 1 1 7.04416 1 14.5C1 21.9558 7.04416 28 14.5 28Z" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.09996 14.5H19.9" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 9.1001V19.9001" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 h-[39px] bg-white rounded-[20px] px-3.5 flex items-center shadow-[0_0_4px_rgba(0,0,0,0.08)]">
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
              className="w-full px-6 py-4 text-left cursor-pointer bg-transparent border-none"
            >
              <span className="text-base text-red-500">신고하기</span>
            </button>
            <div className="h-px bg-[#F0F0F0] mx-6" />
            <button
              onClick={() => { setShowMenu(false); router.back(); }}
              className="w-full px-6 py-4 text-left cursor-pointer bg-transparent border-none"
            >
              <span className="text-base text-[#434343]">채팅방 나가기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
