"use client";
import { useState, useEffect } from "react";
import { SmartphoneIcon, BackpackIcon, WalletIcon, ShirtIcon, GemIcon, BookIcon, KeyRoundIcon } from "./icons";

export type CategoryFilterValue = { major: string; minor: string } | null;

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

const CATEGORIES: { label: string; Icon: IconComponent; subcategories: string[] }[] = [
  { label: "전자기기", Icon: SmartphoneIcon, subcategories: ["스마트폰", "이어폰", "헤드셋", "키보드", "태블릿", "노트북", "보조배터리", "기타"] },
  { label: "가방", Icon: BackpackIcon, subcategories: ["백팩", "토트백", "에코백", "크로스백", "파우치", "기타"] },
  { label: "지갑", Icon: WalletIcon, subcategories: ["반지갑", "장지갑", "카드지갑", "기타"] },
  { label: "패션잡화", Icon: ShirtIcon, subcategories: ["신발", "의류", "안경", "선글라스", "모자", "기타"] },
  { label: "액세서리", Icon: GemIcon, subcategories: ["반지", "목걸이", "귀걸이", "팔찌", "시계", "기타"] },
  { label: "도서/문구", Icon: BookIcon, subcategories: ["책", "기타"] },
  { label: "소지품", Icon: KeyRoundIcon, subcategories: ["열쇠", "텀블러", "우산", "기타"] },
];

type Props = {
  visible: boolean;
  value: CategoryFilterValue;
  activeColor: string;
  onSelect: (value: CategoryFilterValue) => void;
  onClose: () => void;
};

export function CategoryFilterModal({ visible, value, activeColor, onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<CategoryFilterValue>(value);

  useEffect(() => {
    if (visible) setSelected(value);
  }, [visible, value]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-app-bg rounded-t-[20px] max-h-[80vh] flex flex-col">
        <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <span className="text-base font-bold text-black">카테고리</span>
          <button onClick={onClose} className="text-[22px] text-app-gray leading-none bg-transparent border-none cursor-pointer">×</button>
        </div>

        <div className="overflow-y-auto px-6 pb-4 flex flex-col gap-3">
          {CATEGORIES.map(({ label, Icon, subcategories }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-[52px] flex flex-col items-center gap-1 pt-3 shrink-0">
                <Icon size={24} color="#434343" />
                <span className="text-[11px] font-semibold text-[#434343] text-center">{label}</span>
              </div>
              <div className="flex-1 bg-white rounded-xl p-3 shadow-sm flex flex-wrap gap-2">
                {subcategories.map((sub) => {
                  const isSelected = selected?.major === label && selected?.minor === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelected(isSelected ? null : { major: label, minor: sub })}
                      className="py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                      style={{
                        width: "calc(50% - 4px)",
                        border: `1px solid ${isSelected ? activeColor : "#E5E7EB"}`,
                        backgroundColor: isSelected ? activeColor + "15" : "#F5F7FA",
                        color: isSelected ? activeColor : "#434343",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 px-6 pt-3 pb-9">
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="flex-1 h-[46px] rounded-xl border border-app-border bg-white text-sm font-semibold text-[#434343] cursor-pointer"
          >
            초기화
          </button>
          <button
            onClick={() => { onSelect(selected); onClose(); }}
            className="flex-1 h-[46px] rounded-xl border-none text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: activeColor }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
