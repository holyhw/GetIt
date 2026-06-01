"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { UserInfo } from "@/types/user";
import TopHeader from "@/components/TopHeader";

const API_BASE = "https://api.getitsju.com";

export default function MyInfoPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [draftNickname, setDraftNickname] = useState("");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    api.get<UserInfo>("/api/users/me", token).then((d) => {
      setUserInfo(d);
      setDraftNickname(d.name);
    }).catch(() => {});
  }, [token]);

  const handleSave = async () => {
    if (!token || !userInfo) return;
    const name = draftNickname.trim() || userInfo.name;
    setSaving(true);
    try {
      const url = `${API_BASE}/api/users/me?name=${encodeURIComponent(name)}`;
      const options: RequestInit = {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      };
      if (draftFile) {
        const formData = new FormData();
        formData.append("profileImage", draftFile);
        options.body = formData;
      }
      const res = await fetch(url, options);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserInfo(data.result);
      setEditingNickname(false);
      router.back();
    } catch {
      alert("저장 실패. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDraftFile(file);
    setDraftImage(URL.createObjectURL(file));
  };

  const provider = userInfo?.provider ?? null;
  const name = userInfo?.name ?? "";
  const email = userInfo?.email ?? "";

  const ACCOUNTS = [
    { key: "KAKAO", label: "카카오", icon: "/myinfo-kakao.svg" },
    { key: "NAVER", label: "네이버", icon: "/myinfo-naver.svg" },
    { key: "GOOGLE", label: "Google", icon: "/myinfo-google.svg" },
  ];

  return (
    <div className="min-h-dvh bg-app-bg md:pt-[72px]">
      <TopHeader />
      {/* 모바일 헤더 */}
      <div className="md:hidden sticky top-0 z-10 bg-app-bg flex items-center px-6 pt-8 pb-4">
        <button onClick={() => router.back()} className="cursor-pointer bg-transparent border-none p-1">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-[20px] font-medium text-black tracking-[-0.32px]">내 정보 관리</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-[46px] h-[26px] rounded-full bg-navy text-white text-xs font-semibold cursor-pointer border-none flex items-center justify-center">
          {saving ? "..." : "저장"}
        </button>
      </div>

      <div className="overflow-y-auto pb-10 md:max-w-[600px] md:mx-auto md:mt-8 md:bg-white md:rounded-xl md:border md:border-[#F1F3F7] md:mb-8">
        {/* 데스크탑 저장 버튼 - 카드 우상단 */}
        <div className="hidden md:flex justify-end px-6 pt-5">
          <button onClick={handleSave} disabled={saving}
            className="px-6 h-[34px] rounded-full bg-navy text-white text-sm font-semibold cursor-pointer border-none">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 프로필 사진 */}
        <div className="flex flex-col items-center mt-4 mb-6 md:mt-2">
          <div className="relative mb-3.5 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-app-gray-light">
              {(draftImage || userInfo?.profileImageUrl) ? (
                <Image src={draftImage ?? userInfo!.profileImageUrl!} alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#ABABAB" strokeWidth="1.8" />
                    <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            {/* 카메라 뱃지 */}
            <Image src="/myinfo-camera.svg" alt="" width={36} height={36} className="absolute right-0 bottom-0" />
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-[20px] font-semibold text-black mb-2">{draftNickname || name}</p>
          <p className="text-sm text-[#757575]">{email}</p>
        </div>

        {/* 프로필 섹션 */}
        <div className="px-6 mb-6">
          <p className="text-sm font-semibold text-[#757575] tracking-[-0.32px] mb-2">프로필</p>
          <button
            onClick={() => { setDraftNickname(name); setEditingNickname(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-full bg-white border rounded-[15px] h-[46px] flex items-center px-4 cursor-pointer text-left"
            style={{ borderColor: editingNickname ? "#1E3A5F" : "#D9D9D9" }}
          >
            <span className="flex-1 text-base font-semibold text-[#434343] tracking-[-0.32px]">닉네임</span>
            {editingNickname ? (
              <input
                ref={inputRef}
                value={draftNickname}
                onChange={(e) => setDraftNickname(e.target.value.slice(0, 6))}
                maxLength={6}
                className="text-sm font-semibold text-black tracking-[-0.32px] text-right outline-none w-20 mr-2"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-semibold text-[#757575] tracking-[-0.32px] mr-2">{name}</span>
            )}
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1L5 5L1 9" stroke="#434343" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 연결된 계정 */}
        <div className="px-6">
          <p className="text-sm font-semibold text-[#757575] tracking-[-0.32px] mb-2">연결된 계정</p>
          {ACCOUNTS.map(({ key, label, icon }, idx) => {
            const isMain = key === provider;
            const isFirst = idx === 0;
            const isLast = idx === ACCOUNTS.length - 1;
            return (
              <div
                key={key}
                className="bg-white flex items-center h-[57px] px-4 border border-[#D9D9D9]"
                style={{
                  borderTopWidth: isFirst ? 1 : 0,
                  borderTopLeftRadius: isFirst ? 15 : 0,
                  borderTopRightRadius: isFirst ? 15 : 0,
                  borderBottomLeftRadius: isLast ? 15 : 0,
                  borderBottomRightRadius: isLast ? 15 : 0,
                }}
              >
                <Image src={icon} alt={label} width={25} height={25} />
                <span className="text-base font-semibold text-[#434343] ml-3 tracking-[-0.32px]">{label}</span>
                {isMain && (
                  <span className="ml-2 bg-[#F4F7FF] rounded-lg text-[10px] font-semibold text-navy px-1.5 py-0.5">주 계정</span>
                )}
                <div className="flex-1" />
                {isMain ? (
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                    <path d="M1 5.5L5.5 10L14 1" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="text-xs text-[#757575]">연결되지 않음</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 회원탈퇴 */}
        <div className="flex justify-end px-6 mt-5">
          <button className="text-xs font-semibold text-red-500 cursor-pointer bg-transparent border-none">회원탈퇴</button>
        </div>


      </div>
    </div>
  );
}
