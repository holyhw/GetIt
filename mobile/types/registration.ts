export type ItemType = "LOST" | "FOUND";

export type FilterType = "습득물" | "분실물";

export type RegistrationItem = {
  id: number;
  itemType: ItemType;
  title: string;
  majorCategory: string | null;
  minorCategory: string | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  occurredDate: string;
  description: string;
  imageUrl: string | null;
  matched: boolean;
  createdDate: string;
};

export type RegistrationDetail = RegistrationItem & {
  userId: number;
  userName: string;
  userProfileImageUrl: string | null;
  items?: { crop_image_url: string | null; vlm_result: { caption: string } | null }[];
};

export type PagedResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  size: number;
};
