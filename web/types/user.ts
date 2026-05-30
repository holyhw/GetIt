export type UserInfo = {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  provider: "KAKAO" | "NAVER" | "GOOGLE";
};
