import type { MatchResultResponse, PendingMatch } from "../types/match";

export type { MatchResultResponse, PendingMatch };

let pending: PendingMatch | null = null;

export const matchStore = {
  set: (data: PendingMatch) => { pending = data; },
  get: () => pending,
  clear: () => { pending = null; },
};
