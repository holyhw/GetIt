export type PreAnalysisStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type PreAnalysisResult = {
  id: number;
  status: PreAnalysisStatus;
  itemType: "FOUND" | "LOST";
  text: string | null;
  imageUrl: string | null;
  cropImageUrl: string | null;
  vlmResult: { caption: string } | null;
  errorMessage: string | null;
  createdDate: string;
  lastModifiedDate: string;
};
