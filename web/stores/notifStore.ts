import { create } from "zustand";

type NotifStore = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
};

export const useNotifStore = create<NotifStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
