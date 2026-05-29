export type PreAnalysisStatus =
  | "PROCESSING"
  | "PENDING_IMAGE_SELECTION"
  | "COMPLETED"
  | "FAILED";

export type ReferenceImage = {
  title: string;
  imageUrl: string;
  pageUrl: string;
  provider: string;
  query: string;
  position: number;
  score: number;
  relevanceScore: number;
};

export type PreAnalysisResult = {
  id: number;
  status: PreAnalysisStatus;
  itemType: "FOUND" | "LOST";
  text: string | null;
  imageUrl: string | null;
  cropImageUrl: string | null;
  selectedReferenceImageUrl: string | null;
  referenceImages: ReferenceImage[];
  vlmResult: { caption: string } | null;
  errorMessage: string | null;
  createdDate: string;
  lastModifiedDate: string;
};
