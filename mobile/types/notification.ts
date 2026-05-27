export type ApiNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  targetType: string | null;
  targetId: number | null;
  relatedId: number | null;
  read: boolean;
  createdDate: string;
};
