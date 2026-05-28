import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import SmartphoneIcon from "../assets/smartphone.svg";
import BackpackIcon from "../assets/backpack.svg";
import WalletIcon from "../assets/wallet.svg";
import ShirtIcon from "../assets/shirt.svg";
import GemIcon from "../assets/gem.svg";
import BookIcon from "../assets/book.svg";
import KeyIcon from "../assets/key-round.svg";

export type CategoryFilterValue = { major: string; minor: string } | null;

const CATEGORIES = [
  { label: "전자기기", Icon: SmartphoneIcon, subcategories: ["스마트폰", "이어폰", "헤드셋", "키보드", "태블릿", "노트북", "보조배터리", "기타"] },
  { label: "가방", Icon: BackpackIcon, subcategories: ["백팩", "토트백", "에코백", "크로스백", "파우치", "기타"] },
  { label: "지갑", Icon: WalletIcon, subcategories: ["반지갑", "장지갑", "카드지갑", "기타"] },
  { label: "패션잡화", Icon: ShirtIcon, subcategories: ["신발", "의류", "안경", "선글라스", "모자", "기타"] },
  { label: "액세서리", Icon: GemIcon, subcategories: ["반지", "목걸이", "귀걸이", "팔찌", "시계", "기타"] },
  { label: "도서/문구", Icon: BookIcon, subcategories: ["책", "기타"] },
  { label: "소지품", Icon: KeyIcon, subcategories: ["열쇠", "텀블러", "우산", "기타"] },
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

  const handleOpen = () => setSelected(value);

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

  const handleReset = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={handleOpen}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "#00000050", justifyContent: "flex-end" }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ backgroundColor: "#F5F7FA", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: 600 }}>
            {/* 헤더 */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>카테고리</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 22, color: "#919191", lineHeight: 24 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16, gap: 12 }}
            >
              {CATEGORIES.map((cat) => {
                const { Icon } = cat;
                return (
                  <View key={cat.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 52, alignItems: "center", gap: 4 }}>
                      <Icon width={24} height={24} />
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#434343", textAlign: "center" }}>{cat.label}</Text>
                    </View>
                    <View style={{
                      flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12,
                      shadowColor: "#000", shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                      flexDirection: "row", flexWrap: "wrap", gap: 8,
                    }}>
                      {cat.subcategories.map((sub) => {
                        const isSelected = selected?.major === cat.label && selected?.minor === sub;
                        return (
                          <TouchableOpacity
                            key={sub}
                            onPress={() => setSelected(isSelected ? null : { major: cat.label, minor: sub })}
                            style={{
                              width: "47%", paddingVertical: 10,
                              borderRadius: 8, alignItems: "center", justifyContent: "center",
                              backgroundColor: isSelected ? activeColor + "15" : "#F5F7FA",
                              borderWidth: 1,
                              borderColor: isSelected ? activeColor : "#E5E7EB",
                            }}
                          >
                            <Text style={{ fontSize: 12, color: isSelected ? activeColor : "#434343", fontWeight: isSelected ? "600" : "400" }}>
                              {sub}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* 버튼 */}
            <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingTop: 12, paddingBottom: 36, gap: 10 }}>
              <TouchableOpacity
                onPress={handleReset}
                style={{ flex: 1, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#fff" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#434343" }}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                style={{ flex: 1, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: activeColor }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>적용</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
