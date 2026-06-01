"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotifStore } from "@/stores/notifStore";
import { BellIcon } from "./icons";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const NAVY = "#1E3A5F";
const GRAY = "#919191";

const TABS = [
  { href: "/", label: "홈", protected: false },
  { href: "/search", label: "검색", protected: false },
  { href: "/register", label: "등록", protected: true },
  { href: "/chat", label: "채팅", protected: true },
  { href: "/mypage", label: "프로필", protected: true },
];

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const storeCount = useNotifStore((s) => s.unreadCount);
  const setStoreCount = useNotifStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!token) return;
    api.get<{ count: number }>("/api/notifications/unread-count", token)
      .then((d) => setStoreCount(d.count))
      .catch(() => {});
  }, [token, setStoreCount]);

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-[72px] bg-white border-b border-app-gray-light">
      <div className="w-full max-w-[1200px] mx-auto px-8 flex items-center gap-6 h-full">
        <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
          <Image src="/logo-text.svg" alt="" width={42} height={41} />
          <Image src="/logo-icon.svg" alt="GET IT" width={126} height={22} />
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {TABS.map(({ href, label, protected: isProtected }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const handleClick = (e: React.MouseEvent) => {
              if (isProtected && !token) {
                e.preventDefault();
                router.push("/login");
              }
            };
            return (
              <Link
                key={href}
                href={href}
                onClick={handleClick}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  color: active ? NAVY : GRAY,
                  backgroundColor: active ? NAVY + "12" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => router.push(token ? "/notification" : "/login")}
          className="relative cursor-pointer bg-transparent border-none p-0 shrink-0"
        >
          <BellIcon size={18} />
          {token && storeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F4551E] text-white text-[8px] font-bold rounded-md min-w-3 h-3 px-0.5 flex items-center justify-center leading-none">
              {storeCount > 99 ? "99+" : storeCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
