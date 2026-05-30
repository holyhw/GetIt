import BottomTabBar from "@/components/BottomTabBar";
import TopHeader from "@/components/TopHeader";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopHeader />
      <main
        className="flex-1 md:pt-[72px] md:pb-0"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
