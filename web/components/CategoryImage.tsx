import React from "react";
import Image from "next/image";
import { SmartphoneIcon, BackpackIcon, WalletIcon, ShirtIcon, GemIcon, BookIcon, KeyRoundIcon } from "./icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  전자기기: SmartphoneIcon,
  가방: BackpackIcon,
  지갑: WalletIcon,
  패션잡화: ShirtIcon,
  액세서리: GemIcon,
  "도서/문구": BookIcon,
  소지품: KeyRoundIcon,
};

type Props = {
  imageUrl: string | null | undefined;
  majorCategory: string | null | undefined;
  width: number;
  height: number;
  borderRadius?: number;
  priority?: boolean;
};

export function CategoryImage({ imageUrl, majorCategory, width, height, borderRadius = 0, priority = false }: Props) {
  const IconComp = (majorCategory && CATEGORY_ICONS[majorCategory]) ?? KeyRoundIcon;
  const iconSize = Math.round(Math.min(width, height) * 0.45);

  if (imageUrl) {
    return (
      <div className="shrink-0 overflow-hidden" style={{ width, height, borderRadius }}>
        <Image
          src={imageUrl}
          alt=""
          width={width}
          height={height}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 bg-app-bg flex items-center justify-center"
      style={{ width, height, borderRadius }}
    >
      {React.createElement(IconComp, { size: iconSize, color: "#ABABAB" })}
    </div>
  );
}
