import { Tabs, useRouter } from "expo-router";
import TabHomeIcon from "../../assets/tab-home.svg";
import TabSearchIcon from "../../assets/tab-search.svg";
import TabRegisterIcon from "../../assets/tab-register.svg";
import TabChatIcon from "../../assets/tab-chat.svg";
import TabProfileIcon from "../../assets/tab-profile.svg";
import { useAuth } from "../../context/AuthContext";

function useAuthGuard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  return (e: { preventDefault: () => void }) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/login");
    }
  };
}

export default function TabsLayout() {
  const authGuard = useAuthGuard();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F5F7FA",
          height: 80,
          paddingTop: 4,
          paddingBottom: 20,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: "#1E3A5F",
        tabBarInactiveTintColor: "#1E3A5F",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: () => <TabHomeIcon />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: () => <TabSearchIcon />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "등록",
          tabBarIcon: () => <TabRegisterIcon />,
          tabBarStyle: { display: "none" },
        }}
        listeners={{ tabPress: authGuard }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarIcon: () => <TabChatIcon />,
        }}
        listeners={{ tabPress: authGuard }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: () => <TabProfileIcon />,
        }}
        listeners={{ tabPress: authGuard }}
      />
    </Tabs>
  );
}
