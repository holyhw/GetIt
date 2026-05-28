import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Platform, Pressable, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateFilter } from "../utils/filters";

type Props = {
  visible: boolean;
  value: DateFilter;
  activeColor: string;
  onSelect: (value: DateFilter) => void;
  onClose: () => void;
};

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplay(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function midnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DateFilterModal({ visible, value, activeColor, onSelect, onClose }: Props) {
  const today = midnight(new Date());
  const [startDate, setStartDate] = useState(value.start ? midnight(new Date(value.start)) : today);
  const [endDate, setEndDate] = useState(value.end ? midnight(new Date(value.end)) : today);
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleApply = () => {
    onSelect({ start: toYMD(startDate), end: toYMD(endDate) });
    onClose();
  };

  const handleReset = () => {
    setStartDate(today);
    setEndDate(today);
    onSelect({});
    onClose();
  };

  const handleDateChange = (_: any, date?: Date) => {
    if (!date) return;
    if (Platform.OS === "android") setShowAndroidPicker(false);
    if (activeTab === "start") {
      setStartDate(date);
      if (date > endDate) setEndDate(date);
    } else {
      setEndDate(date);
      if (date < startDate) setStartDate(date);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={[StyleSheet.absoluteFillObject, { backgroundColor: "#00000050" }]} onPress={onClose} />
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 36 }}>
            {/* 헤더 */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>날짜</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 22, color: "#919191", lineHeight: 24 }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 시작일 / 종료일 탭 */}
            <View style={{ flexDirection: "row", paddingHorizontal: 24, gap: 10, marginBottom: 16 }}>
              {(["start", "end"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const date = tab === "start" ? startDate : endDate;
                const label = tab === "start" ? "시작일" : "종료일";
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => { setActiveTab(tab); if (Platform.OS === "android") setShowAndroidPicker(true); }}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: isActive ? activeColor : "#E5E7EB",
                      backgroundColor: isActive ? activeColor + "10" : "#F5F7FA",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: isActive ? activeColor : "#919191", fontWeight: "600", marginBottom: 4 }}>{label}</Text>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: isActive ? activeColor : "#000" }}>{formatDisplay(date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* iOS 인라인 캘린더 */}
            {Platform.OS === "ios" && (
              <View style={{ marginHorizontal: 8 }}>
                <DateTimePicker
                  key={activeTab}
                  value={activeTab === "start" ? startDate : endDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  locale="ko"
                  themeVariant="light"
                />
              </View>
            )}

            {/* Android 피커 다이얼로그 */}
            {Platform.OS === "android" && showAndroidPicker && (
              <DateTimePicker
                value={activeTab === "start" ? startDate : endDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* 웹 날짜 입력 */}
            {Platform.OS === "web" && (
              <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
                <input
                  type="date"
                  value={activeTab === "start" ? toYMD(startDate) : toYMD(endDate)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    handleDateChange(null as any, new Date(y, m - 1, d));
                  }}
                  style={{
                    fontSize: 16,
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    width: "100%",
                    boxSizing: "border-box",
                    color: "#000",
                    backgroundColor: "#F5F7FA",
                    outline: "none",
                  } as any}
                />
              </View>
            )}

            {/* 버튼 */}
            <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingTop: 16, gap: 10 }}>
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
      </View>
    </Modal>
  );
}
