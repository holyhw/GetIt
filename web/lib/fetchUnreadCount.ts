import type { ApiNotification } from "@/types/notification";

const API_BASE = "https://api.getitsju.com";

export async function fetchGroupedUnreadCount(token: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const all: ApiNotification[] = data.result ?? [];
    const seen = new Set<string>();
    const grouped = all.filter((n) => {
      if (n.type !== "CHAT_MESSAGE") return true;
      const key = `chat_${n.targetId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return grouped.filter((n) => !n.read).length;
  } catch {
    return 0;
  }
}
