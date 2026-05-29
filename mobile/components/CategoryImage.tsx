import { Image, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import SmartphoneIcon from "../assets/smartphone.svg";
import BackpackIcon from "../assets/backpack.svg";
import WalletIcon from "../assets/wallet.svg";
import ShirtIcon from "../assets/shirt.svg";
import GemIcon from "../assets/gem.svg";
import BookIcon from "../assets/book.svg";
import KeyIcon from "../assets/key-round.svg";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ width: number; height: number }>> = {
  전자기기: SmartphoneIcon,
  가방: BackpackIcon,
  지갑: WalletIcon,
  패션잡화: ShirtIcon,
  액세서리: GemIcon,
  "도서/문구": BookIcon,
  소지품: KeyIcon,
};

type Props = {
  imageUrl: string | null | undefined;
  majorCategory: string | null | undefined;
  width: number;
  height: number;
  borderRadius?: number;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  iconSizeRatio?: number;
};

export function CategoryImage({
  imageUrl,
  majorCategory,
  width,
  height,
  borderRadius = 0,
  resizeMode = "cover",
  iconSizeRatio = 0.45,
}: Props) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width, height, borderRadius }}
        resizeMode={resizeMode}
      />
    );
  }

  const Icon = (majorCategory && CATEGORY_ICONS[majorCategory]) ?? KeyIcon;
  const iconSize = Math.round(Math.min(width, height) * iconSizeRatio);

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon width={iconSize} height={iconSize} />
    </View>
  );
}
