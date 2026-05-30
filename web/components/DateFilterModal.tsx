"use client";
import { useState, useEffect } from "react";
import type { DateFilter } from "@/lib/filters";

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

export function DateFilterModal({ visible, value, activeColor, onSelect, onClose }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(value.start ? new Date(value.start) : today);
  const [endDate, setEndDate] = useState(value.end ? new Date(value.end) : today);
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");

  useEffect(() => {
    if (visible) {
      setStartDate(value.start ? new Date(value.start) : today);
      setEndDate(value.end ? new Date(value.end) : today);
      setActiveTab("start");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  const handleDateChange = (val: string) => {
    if (!val) return;
    const date = new Date(val + "T00:00:00");
    if (activeTab === "start") {
      setStartDate(date);
      if (date > endDate) setEndDate(date);
    } else {
      setEndDate(date);
      if (date < startDate) setStartDate(date);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-[20px]">
        <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-6 pt-4 pb-5">
          <span className="text-base font-bold text-black">날짜</span>
          <button onClick={onClose} className="text-[22px] text-app-gray leading-none bg-transparent border-none cursor-pointer">×</button>
        </div>

        <div className="flex gap-2.5 px-6 pb-4">
          {(["start", "end"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const date = tab === "start" ? startDate : endDate;
            const label = tab === "start" ? "시작일" : "종료일";
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  border: `1.5px solid ${isActive ? activeColor : "#E5E7EB"}`,
                  backgroundColor: isActive ? activeColor + "10" : "#F5F7FA",
                }}
              >
                <div className="text-[11px] font-semibold mb-1" style={{ color: isActive ? activeColor : "#919191" }}>{label}</div>
                <div className="text-[15px] font-bold" style={{ color: isActive ? activeColor : "#000" }}>{formatDisplay(date)}</div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-2">
          <input
            type="date"
            value={activeTab === "start" ? toYMD(startDate) : toYMD(endDate)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full text-base p-3 rounded-xl border border-app-gray-light bg-app-bg text-black outline-none"
          />
        </div>

        <div className="flex gap-2.5 px-6 pt-4 pb-9">
          <button
            onClick={() => { onSelect({}); onClose(); }}
            className="flex-1 h-[46px] rounded-xl border border-app-border bg-white text-sm font-semibold text-[#434343] cursor-pointer"
          >
            초기화
          </button>
          <button
            onClick={() => { onSelect({ start: toYMD(startDate), end: toYMD(endDate) }); onClose(); }}
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
