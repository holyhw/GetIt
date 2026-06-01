import { create } from "zustand";

type NotifStore = {
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
};

export const useNotifStore = create<NotifStore>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (count) =>
    set({ unreadCount: typeof count === "function" ? count(get().unreadCount) : count }),
}));
