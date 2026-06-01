"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { BellIcon } from "@/components/icons";
import type { UserInfo } from "@/types/user";

const MENU_ITEMS = [
  { label: "내 정보 관리", href: "/myinfo" },
  { label: "설정", href: null },
  { label: "공지사항", href: null },
  { label: "FAQ", href: null },
  { label: "고객센터", href: null },
  { label: "서비스 이용 약관", href: null },
];

function ArrowRight() {
  return (
    <svg width="5" height="9" viewBox="0 0 5 9" fill="none">
      <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [foundCount, setFoundCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then(setUserInfo).catch(() => {});
    api.get<{ id: number }[]>("/api/registration/me?itemType=FOUND", token)
      .then((d) => setFoundCount(d.length)).catch(() => {});
    api.get<{ id: number }[]>("/api/registration/me?itemType=LOST", token)
      .then((d) => setLostCount(d.length)).catch(() => {});
    api.get<{ count: number }>("/api/notifications/unread-count", token)
      .then((d) => setUnreadCount(d.count)).catch(() => {});
  }, [token]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const Avatar = () => (
    <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden bg-app-gray-light shrink-0">
      {userInfo?.profileImageUrl ? (
        <Image src={userInfo.profileImageUrl} alt="" width={80} height={80} className="w-full h-full object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#ABABAB" strokeWidth="1.8" />
            <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-dvh bg-app-bg flex flex-col items-center justify-center gap-4 px-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#ABABAB" strokeWidth="1.8" />
          <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-app-gray text-center">로그인 후 이용할 수 있어요</p>
        <button
          onClick={() => router.push("/login")}
          className="h-11 px-8 rounded-[10px] bg-navy text-white text-sm font-semibold cursor-pointer"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 모바일 헤더 */}
      <div className="flex items-center px-6 pt-8 pb-4 md:hidden">
        <div className="flex-1" />
        <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">마이페이지</h1>
        <div className="flex-1 flex justify-end">
          <button onClick={() => router.push("/notification")} className="relative cursor-pointer bg-transparent border-none p-0">
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F4551E] text-white text-[8px] font-bold rounded-md min-w-3 h-3 px-0.5 flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="md:max-w-[1200px] md:mx-auto md:px-8 md:py-8">

        {/* 모바일 레이아웃 */}
        <div className="md:hidden">
          <div className="overflow-y-auto pb-6">
            <div className="mx-[22px] bg-white rounded-lg border border-[#F1F3F7]">
              <div className="flex pt-5 px-[21px] mb-5">
                <div className="mr-2.5"><Avatar /></div>
                <div className="flex-1 pt-2 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-black">{userInfo?.name ?? ""}</span>
                    <button onClick={handleLogout} className="text-xs text-[#464646] cursor-pointer bg-transparent border-none">로그아웃</button>
                  </div>
                  <span className="text-sm text-black">{userInfo?.email ?? ""}</span>
                </div>
              </div>
              <div className="flex gap-2.5 px-[21px] pb-5">
                <button onClick={() => router.push("/myitems?type=found")}
                  className="flex-1 bg-[#F4F7FF] rounded-lg py-5 flex flex-col items-center gap-3 cursor-pointer border-none">
                  <span className="text-sm font-semibold text-navy">{foundCount}</span>
                  <span className="text-xs text-navy">등록한 습득물</span>
                </button>
                <button onClick={() => router.push("/myitems?type=lost")}
                  className="flex-1 bg-[#FFF7EF] rounded-lg py-5 flex flex-col items-center gap-3 cursor-pointer border-none">
                  <span className="text-sm font-semibold text-orange">{lostCount}</span>
                  <span className="text-xs text-orange">등록한 분실물</span>
                </button>
              </div>
            </div>
            <div className="mx-6 mt-5">
              {MENU_ITEMS.map(({ label, href }) => (
                <button key={label} onClick={() => href && router.push(href)}
                  className="w-full h-14 flex items-center justify-between pr-5 border-b border-[#E1E4ED] bg-transparent text-left"
                  style={{ cursor: href ? "pointer" : "default" }}>
                  <span className="text-base text-black">{label}</span>
                  <ArrowRight />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 데스크탑 레이아웃 */}
        <div className="hidden md:block max-w-[600px] mx-auto">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-xl border border-[#F1F3F7] p-6 mb-4">
            <div className="flex items-center gap-5 pb-5 border-b border-[#F1F3F7]">
              <Avatar />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-black mb-1">{userInfo?.name ?? ""}</h2>
                <p className="text-sm text-app-gray">{userInfo?.email ?? ""}</p>
              </div>
              <button onClick={handleLogout}
                className="text-sm text-[#464646] cursor-pointer bg-transparent border border-app-border rounded-full px-4 py-1.5 shrink-0">
                로그아웃
              </button>
            </div>
            <div className="flex gap-3 pt-5">
              <button onClick={() => router.push("/myitems?type=found")}
                className="flex-1 bg-[#F4F7FF] rounded-xl py-5 flex flex-col items-center gap-2 cursor-pointer border-none">
                <span className="text-xl font-bold text-navy">{foundCount}</span>
                <span className="text-sm text-navy">등록한 습득물</span>
              </button>
              <button onClick={() => router.push("/myitems?type=lost")}
                className="flex-1 bg-[#FFF7EF] rounded-xl py-5 flex flex-col items-center gap-2 cursor-pointer border-none">
                <span className="text-xl font-bold text-orange">{lostCount}</span>
                <span className="text-sm text-orange">등록한 분실물</span>
              </button>
            </div>
          </div>

          {/* 메뉴 */}
          <div className="bg-white rounded-xl border border-[#F1F3F7] overflow-hidden">
            {MENU_ITEMS.map(({ label, href }, idx) => (
              <button key={label} onClick={() => href && router.push(href)}
                className={`w-full h-[60px] flex items-center justify-between px-6 bg-transparent text-left transition-colors ${href ? "hover:bg-app-bg cursor-pointer" : "cursor-default"} ${idx < MENU_ITEMS.length - 1 ? "border-b border-[#E1E4ED]" : ""}`}>
                <span className="text-base text-black">{label}</span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
