"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { BellIcon } from "./icons";

const NAVY = "#1E3A5F";
const GRAY = "#919191";

const TABS = [
  { href: "/", label: "홈" },
  { href: "/search", label: "검색" },
  { href: "/register", label: "등록" },
  { href: "/chat", label: "채팅" },
  { href: "/mypage", label: "프로필" },
];

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-[72px] bg-white border-b border-app-gray-light">
      <div className="w-full max-w-[1200px] mx-auto px-8 flex items-center gap-6 h-full">
        <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
          <Image src="/logo-text.svg" alt="" width={42} height={41} />
          <Image src="/logo-icon.svg" alt="GET IT" width={126} height={22} />
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {TABS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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
          className="cursor-pointer bg-transparent border-none p-0 shrink-0"
        >
          <BellIcon size={18} />
        </button>
      </div>
    </header>
  );
}
