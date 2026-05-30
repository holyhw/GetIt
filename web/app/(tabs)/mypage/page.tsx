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

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then(setUserInfo).catch(() => {});
    api.get<{ id: number }[]>("/api/registration/me?itemType=FOUND", token)
      .then((d) => setFoundCount(d.length)).catch(() => {});
    api.get<{ id: number }[]>("/api/registration/me?itemType=LOST", token)
      .then((d) => setLostCount(d.length)).catch(() => {});
  }, [token]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-dvh bg-app-bg">
      {/* 헤더 */}
      <div className="flex items-center px-6 pt-8 pb-4">
        <div className="flex-1" />
        <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">마이페이지</h1>
        <div className="flex-1 flex justify-end">
          <button onClick={() => router.push("/notification")} className="cursor-pointer bg-transparent border-none p-0">
            <BellIcon size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto pb-6">
        {/* 프로필 카드 */}
        <div className="mx-[22px] bg-white rounded-lg border border-[#F1F3F7]">
          <div className="flex pt-5 px-[21px] mb-5">
            {/* 아바타 */}
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-app-gray-light shrink-0 mr-2.5">
              {userInfo?.profileImageUrl ? (
                <Image src={userInfo.profileImageUrl} alt="" width={60} height={60} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#ABABAB" strokeWidth="1.8" />
                    <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            {/* 이름/이메일 */}
            <div className="flex-1 pt-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-black">{userInfo?.name ?? ""}</span>
                <button onClick={handleLogout} className="text-xs text-[#464646] cursor-pointer bg-transparent border-none">로그아웃</button>
              </div>
              <span className="text-sm text-black">{userInfo?.email ?? ""}</span>
            </div>
          </div>

          {/* 통계 */}
          <div className="flex gap-2.5 px-[21px] pb-5">
            <button
              onClick={() => router.push("/myitems?type=found")}
              className="flex-1 bg-[#F4F7FF] rounded-lg py-5 flex flex-col items-center gap-3 cursor-pointer border-none"
            >
              <span className="text-sm font-semibold text-navy">{foundCount}</span>
              <span className="text-xs text-navy">등록한 습득물</span>
            </button>
            <button
              onClick={() => router.push("/myitems?type=lost")}
              className="flex-1 bg-[#FFF7EF] rounded-lg py-5 flex flex-col items-center gap-3 cursor-pointer border-none"
            >
              <span className="text-sm font-semibold text-orange">{lostCount}</span>
              <span className="text-xs text-orange">등록한 분실물</span>
            </button>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="mx-6 mt-5">
          {MENU_ITEMS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => href && router.push(href)}
              className="w-full h-14 flex items-center justify-between pr-5 border-b border-[#E1E4ED] bg-transparent cursor-pointer text-left"
              style={{ cursor: href ? "pointer" : "default" }}
            >
              <span className="text-base text-black">{label}</span>
              <ArrowRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
