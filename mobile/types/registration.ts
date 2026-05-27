export type ItemType = "LOST" | "FOUND";

export type FilterType = "습득물" | "분실물";

export type Category = "전체" | "의류" | "전자기기" | "지갑/가방" | "귀중품" | "기타";

export type RegistrationItem = {
  id: number;
  itemType: ItemType;
  title: string;
  category: string;
  location: string;
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
};
