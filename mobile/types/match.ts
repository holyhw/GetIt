export type MatchResultResponse = {
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

export type PendingMatch = {
  matchResults: MatchResultResponse[];
};
