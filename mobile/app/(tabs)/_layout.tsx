import { Tabs, useRouter } from "expo-router";
import Svg, { Path, Line, Circle } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";

const NAVY = "#1E3A5F";
const GRAY = "#919191";

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 23 23" fill="none">
      <Path d="M14.7842 21.7328V13.1159C14.7842 12.8302 14.6655 12.5563 14.4542 12.3543C14.243 12.1523 13.9565 12.0388 13.6578 12.0388H9.15214C8.8534 12.0388 8.5669 12.1523 8.35565 12.3543C8.14441 12.5563 8.02574 12.8302 8.02574 13.1159V21.7328" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1.2672 9.88457C1.26713 9.57121 1.33854 9.2616 1.47648 8.97734C1.61441 8.69309 1.81553 8.44103 2.06582 8.23875L9.95065 1.77611C10.3573 1.4475 10.8724 1.2672 11.4048 1.2672C11.9372 1.2672 12.4524 1.4475 12.859 1.77611L20.7438 8.23875C20.9941 8.44103 21.1953 8.69309 21.3332 8.97734C21.4711 9.2616 21.5425 9.57121 21.5425 9.88457V19.5785C21.5425 20.1499 21.3051 20.6978 20.8826 21.1018C20.4602 21.5058 19.8871 21.7327 19.2897 21.7327H3.52001C2.92253 21.7327 2.34952 21.5058 1.92704 21.1018C1.50455 20.6978 1.2672 20.1499 1.2672 19.5785V9.88457Z" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 23 23" fill="none">
      <Path d="M21.7222 21.7221L16.7929 16.7928" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3642 19.4506C15.3824 19.4506 19.4505 15.3824 19.4505 10.3642C19.4505 5.34589 15.3824 1.27778 10.3642 1.27778C5.34588 1.27778 1.27778 5.34589 1.27778 10.3642C1.27778 15.3824 5.34588 19.4506 10.3642 19.4506Z" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RegisterIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 23 23" fill="none">
      <Path d="M11.5 21.7222C17.1456 21.7222 21.7222 17.1456 21.7222 11.5C21.7222 5.85442 17.1456 1.27778 11.5 1.27778C5.85442 1.27778 1.27778 5.85442 1.27778 11.5C1.27778 17.1456 5.85442 21.7222 11.5 21.7222Z" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7.41106 11.5H15.5888" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M11.5 7.41111V15.5889" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={25} viewBox="0 0 23 25" fill="none">
      <Path d="M15.5889 10.1607C15.5889 10.7497 15.3735 11.3145 14.9901 11.731C14.6067 12.1475 14.0867 12.3814 13.5445 12.3814H6.21308C5.6709 12.3815 5.15097 12.6156 4.76765 13.0321L2.51671 15.4771C2.41521 15.5874 2.2859 15.6624 2.14512 15.6928C2.00435 15.7232 1.85843 15.7076 1.72583 15.648C1.59322 15.5883 1.47987 15.4873 1.40012 15.3577C1.32037 15.228 1.2778 15.0756 1.27778 14.9197V3.49851C1.27778 2.90953 1.49317 2.34468 1.87658 1.92821C2.25999 1.51175 2.78001 1.27778 3.32223 1.27778H13.5445C14.0867 1.27778 14.6067 1.51175 14.9901 1.92821C15.3735 2.34468 15.5889 2.90953 15.5889 3.49851V10.1607Z" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19.6778 9.05026C20.22 9.05026 20.74 9.28423 21.1234 9.7007C21.5068 10.1172 21.7222 10.682 21.7222 11.271V22.6922C21.7222 22.8481 21.6796 23.0005 21.5999 23.1301C21.5201 23.2598 21.4068 23.3608 21.2742 23.4205C21.1416 23.4801 20.9956 23.4957 20.8549 23.4653C20.7141 23.4349 20.5848 23.3598 20.4833 23.2496L18.2323 20.8046C17.849 20.3881 17.3291 20.154 16.7869 20.1539H9.45551C8.91329 20.1539 8.39328 19.9199 8.00987 19.5035C7.62646 19.087 7.41106 18.5222 7.41106 17.9332V16.8228" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={25} viewBox="0 0 23 25" fill="none">
      <Path d="M11.5 13.6639C15.0285 13.6639 17.8889 10.8912 17.8889 7.47084C17.8889 4.05051 15.0285 1.27778 11.5 1.27778C7.97151 1.27778 5.11111 4.05051 5.11111 7.47084C5.11111 10.8912 7.97151 13.6639 11.5 13.6639Z" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21.7222 23.5728C21.7222 20.9448 20.6452 18.4244 18.7282 16.5661C16.8112 14.7078 14.2111 13.6639 11.5 13.6639C8.7889 13.6639 6.18884 14.7078 4.2718 16.5661C2.35476 18.4244 1.27778 20.9448 1.27778 23.5728" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

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
        tabBarActiveTintColor: NAVY,
        tabBarInactiveTintColor: GRAY,
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
          tabBarIcon: ({ focused }) => <HomeIcon color={focused ? NAVY : GRAY} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: ({ focused }) => <SearchIcon color={focused ? NAVY : GRAY} />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "등록",
          tabBarIcon: ({ focused }) => <RegisterIcon color={focused ? NAVY : GRAY} />,
          tabBarStyle: { display: "none" },
        }}
        listeners={{ tabPress: authGuard }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarIcon: ({ focused }) => <ChatIcon color={focused ? NAVY : GRAY} />,
        }}
        listeners={{ tabPress: authGuard }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ focused }) => <ProfileIcon color={focused ? NAVY : GRAY} />,
        }}
        listeners={{ tabPress: authGuard }}
      />
    </Tabs>
  );
}
