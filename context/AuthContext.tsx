import { createContext, useContext, useState } from "react";
import { IS_LOGGED_IN } from "../constants/auth";

type AuthContextType = {
  isLoggedIn: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: IS_LOGGED_IN,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(IS_LOGGED_IN);
  const logout = () => setIsLoggedIn(false);
  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
