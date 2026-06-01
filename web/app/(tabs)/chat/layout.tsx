"use client";
import { useEffect } from "react";
import ChatListPanel from "@/components/ChatListPanel";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      if (window.innerWidth >= 768) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <>
      {/* 모바일: 그냥 children */}
      <div className="md:hidden">{children}</div>

      {/* 데스크탑: 2-패널 */}
      <div className="hidden md:flex justify-center h-[calc(100dvh-72px)] overflow-hidden">
        <div className="w-full max-w-[1200px] flex border border-app-gray-light">
          <div className="w-[360px] shrink-0 border-r border-app-gray-light overflow-y-auto">
            <ChatListPanel />
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
