import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";

interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

type PersistedState = { token: string | null };

const tokenStorage = {
  getItem: (_: string): StorageValue<PersistedState> | null => {
    try {
      const token = localStorage.getItem("accessToken");
      return token ? { state: { token }, version: 0 } : null;
    } catch {
      return null;
    }
  },
  setItem: (_: string, value: StorageValue<PersistedState>) => {
    try {
      if (value.state.token) {
        localStorage.setItem("accessToken", value.state.token);
      } else {
        localStorage.removeItem("accessToken");
      }
    } catch {}
  },
  removeItem: (_: string) => {
    try {
      localStorage.removeItem("accessToken");
    } catch {}
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      login: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    {
      name: "accessToken",
      storage: tokenStorage,
    }
  )
);
