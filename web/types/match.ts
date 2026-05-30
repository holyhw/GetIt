export type MatchResultResponse = {
  rank: number;
  similarity: number;
  registrationId: number;
  title: string;
  category: string;
  imageUrl: string | null;
  location: string;
  occurredDate: string | null;
  explanation: string;
};

export type PreAnalysisStatus = "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING_IMAGE_SELECTION";

export type ReferenceImage = {
  imageUrl: string;
  title: string;
};
