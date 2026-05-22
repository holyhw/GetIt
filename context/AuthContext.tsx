import { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { api } from "../utils/api";

const TOKEN_KEY = "accessToken";

export type UserInfo = {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  provider: "KAKAO" | "NAVER" | "GOOGLE";
};

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (info: UserInfo) => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  userInfo: null,
  login: async () => {},
  logout: async () => {},
  updateUserInfo: () => {},
});

async function saveToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function loadToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function deleteToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadToken().then((t) => {
      if (t) {
        setToken(t);
        setIsLoggedIn(true);
        api.get<UserInfo>("/api/users/me", t).then(setUserInfo).catch(() => {});
      }
    });
  }, []);

  const login = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    api.get<UserInfo>("/api/users/me", newToken).then(setUserInfo).catch(() => {});
  };

  const logout = async () => {
    await deleteToken();
    setToken(null);
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const updateUserInfo = (info: UserInfo) => setUserInfo(info);

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, userInfo, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
