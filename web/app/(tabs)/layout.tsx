import BottomTabBar from "@/components/BottomTabBar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <main
        className="flex-1"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
