import ChatListPanel from "@/components/ChatListPanel";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 모바일: 그냥 children */}
      <div className="md:hidden">{children}</div>

      {/* 데스크탑: 2-패널 */}
      <div className="hidden md:flex justify-center h-[calc(100dvh-72px)]">
        <div className="w-full max-w-[1200px] flex border-x border-app-gray-light">
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
