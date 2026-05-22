type MatchResultResponse = {
  registrationId: number;
  title: string;
  category: string;
  location: string;
  occurredDate: string;
  description: string;
  imageUrl: string | null;
  similarity: number;
  explanation: string;
  rank: number;
};

type PendingMatch = {
  matchResults: MatchResultResponse[];
};

let pending: PendingMatch | null = null;

export const matchStore = {
  set: (data: PendingMatch) => { pending = data; },
  get: () => pending,
  clear: () => { pending = null; },
};

export type { MatchResultResponse, PendingMatch };
