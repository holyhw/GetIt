import type { MatchResultResponse } from "@/types/match";

let _data: { matchResults: MatchResultResponse[] } | null = null;

export const matchStore = {
  set: (data: { matchResults: MatchResultResponse[] }) => { _data = data; },
  get: () => _data,
  clear: () => { _data = null; },
};
