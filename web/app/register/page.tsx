"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { SmartphoneIcon, BackpackIcon, WalletIcon, ShirtIcon, GemIcon, BookIcon, KeyRoundIcon } from "@/components/icons";

const CATEGORIES = [
  { label: "전자기기", Icon: SmartphoneIcon, subcategories: ["스마트폰", "이어폰", "헤드셋", "키보드", "태블릿", "마우스", "보조배터리", "기타"] },
  { label: "가방", Icon: BackpackIcon, subcategories: ["백팩", "토트백", "에코백", "크로스백", "파우치", "기타"] },
  { label: "지갑", Icon: WalletIcon, subcategories: ["반지갑", "장지갑", "카드지갑", "기타"] },
  { label: "패션잡화", Icon: ShirtIcon, subcategories: ["신발", "의류", "안경", "선글라스", "모자", "기타"] },
  { label: "액세서리", Icon: GemIcon, subcategories: ["반지", "목걸이", "팔찌", "기타"] },
  { label: "도서/문구", Icon: BookIcon, subcategories: ["책", "기타"] },
  { label: "소지품", Icon: KeyRoundIcon, subcategories: ["열쇠", "텀블러", "우산", "기타"] },
];

export default function RegisterPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [type, setType] = useState<"found" | "lost">("found");
  const [selected, setSelected] = useState<{ main: string; sub: string } | null>(null);

  const isFound = type === "found";
  const themeColor = isFound ? "#1E3A5F" : "#FF7A00";

  const handleNext = () => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    if (!selected) { alert("카테고리를 선택해주세요."); return; }
    router.push(`/register/photo?type=${type}&majorCategory=${encodeURIComponent(selected.main)}&minorCategory=${encodeURIComponent(selected.sub)}`);
  };

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center h-[51px] px-6 mt-4">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1 mr-2">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">물건 등록하기</h1>
        </div>
        <div className="w-[19px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-24">
        {/* 토글 */}
        <div className="h-[34px] flex bg-[#F7F7F7] border border-app-border rounded-[10px] p-0.5 mb-5">
          {(["found", "lost"] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => { setType(t); setSelected(null); }}
                className="flex-1 flex items-center justify-center rounded-[8px] text-xs font-bold cursor-pointer border-none transition-colors"
                style={{ backgroundColor: active ? (t === "found" ? "#1E3A5F" : "#FF7A00") : "transparent", color: active ? "#fff" : "#919191" }}
              >
                {t === "found" ? "습득물 등록" : "분실물 등록"}
              </button>
            );
          })}
        </div>

        {/* 안내 배너 */}
        <div
          className="rounded-2xl py-3.5 px-4 flex items-center gap-3.5 mb-5 border"
          style={{ backgroundColor: themeColor + "12", borderColor: themeColor + "25" }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor + "20" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke={themeColor} strokeWidth="1.8" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={themeColor} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-app-text tracking-[-0.3px]">
              {isFound ? "습득하신 물건의 종류를 선택해 주세요" : "분실하신 물건의 종류를 선택해 주세요"}
            </p>
            <p className="text-[11px] font-medium mt-0.5 tracking-[-0.2px]" style={{ color: themeColor }}>
              {isFound ? "AI가 분실자를 찾아드릴게요" : "AI가 비슷한 습득물을 찾아드릴게요"}
            </p>
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div className="flex flex-col gap-3">
          {CATEGORIES.map(({ label, Icon, subcategories }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-[52px] flex flex-col items-center gap-1 shrink-0 pt-3">
                <Icon size={24} color="#434343" />
                <span className="text-[11px] font-semibold text-[#434343] text-center">{label}</span>
              </div>
              <div className="flex-1 bg-white rounded-xl p-3 shadow-sm flex flex-wrap gap-2">
                {subcategories.map((sub) => {
                  const isSelected = selected?.main === label && selected?.sub === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelected(isSelected ? null : { main: label, sub })}
                      className="py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                      style={{
                        width: "calc(50% - 4px)",
                        border: `1px solid ${isSelected ? themeColor : "#E5E7EB"}`,
                        backgroundColor: isSelected ? themeColor + "15" : "#F5F7FA",
                        color: isSelected ? themeColor : "#434343",
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
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg px-7 pt-3 pb-6 z-10">
        <button
          onClick={handleNext}
          className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold tracking-[-0.32px] cursor-pointer border-none transition-colors"
          style={{ backgroundColor: selected ? themeColor : "#D9D9D9" }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
