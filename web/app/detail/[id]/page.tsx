"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import React from "react";
import type { RegistrationDetail } from "@/types/registration";
import type { UserInfo } from "@/types/user";
import { SmartphoneIcon, BackpackIcon, WalletIcon, ShirtIcon, GemIcon, BookIcon, KeyRoundIcon } from "@/components/icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  전자기기: SmartphoneIcon, 가방: BackpackIcon, 지갑: WalletIcon,
  패션잡화: ShirtIcon, 액세서리: GemIcon, "도서/문구": BookIcon, 소지품: KeyRoundIcon,
};
import { NaverMapView } from "@/components/NaverMapView";
import TopHeader from "@/components/TopHeader";

function BackIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect width="30" height="30" rx="10" fill="black" fillOpacity="0.59" />
      <path d="M17 21L11 15L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M10.5 4.5C11.6046 4.5 12.5 3.60457 12.5 2.5C12.5 1.39543 11.6046 0.5 10.5 0.5C9.39543 0.5 8.5 1.39543 8.5 2.5C8.5 3.60457 9.39543 4.5 10.5 4.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 9.16663C3.60457 9.16663 4.5 8.2712 4.5 7.16663C4.5 6.06206 3.60457 5.16663 2.5 5.16663C1.39543 5.16663 0.5 6.06206 0.5 7.16663C0.5 8.2712 1.39543 9.16663 2.5 9.16663Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 13.8333C11.6046 13.8333 12.5 12.9378 12.5 11.8333C12.5 10.7287 11.6046 9.83325 10.5 9.83325C9.39543 9.83325 8.5 10.7287 8.5 11.8333C8.5 12.9378 9.39543 13.8333 10.5 13.8333Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.22668 8.17334L8.78002 10.8267" stroke="white" strokeLinecap="round" />
      <path d="M8.77335 3.50659L4.22668 6.15992" stroke="white" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
      <path d="M12.9933 2H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.99667 2H7.00333" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 2H1.00667" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DarkBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center cursor-pointer"
      style={{ backgroundColor: "rgba(0,0,0,0.59)" }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[#E5E5E5] my-0" />;
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.79335 12.4733C1.91098 12.77 1.93717 13.0951 1.86855 13.4069L1.01655 16.0388C0.9891 16.1723 0.996198 16.3106 1.03717 16.4406C1.07815 16.5705 1.15164 16.6879 1.25069 16.7815C1.34973 16.8751 1.47104 16.9418 1.60311 16.9754C1.73518 17.0089 1.87364 17.0082 2.00535 16.9732L4.73575 16.1748C5.02992 16.1165 5.33457 16.142 5.61495 16.2484C7.32325 17.0462 9.25844 17.215 11.0791 16.725C12.8997 16.235 14.4888 15.1178 15.5659 13.5704C16.643 12.0229 17.139 10.1448 16.9664 8.26734C16.7937 6.38987 15.9635 4.6337 14.6222 3.30869C13.2809 1.98369 11.5147 1.17498 9.63525 1.02527C7.75579 0.87556 5.88385 1.39446 4.3497 2.49041C2.81555 3.58637 1.71778 5.18896 1.25007 7.01542C0.782357 8.84188 0.974768 10.7748 1.79335 12.4733Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const fromRegistration = searchParams.get("fromRegistration") === "true";
  const { token } = useAuthStore();

  const [item, setItem] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const id = params?.id;

  useEffect(() => {
    if (!token) return;
    api.get<UserInfo>("/api/users/me", token).then((d) => setMyUserId(d.id)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!id) return;
    api.get<RegistrationDetail>(`/api/registration/${id}`, token ?? "")
      .then((data) => {
        setItem(data);
        if (data.latitude && data.longitude) {
          setMapCoords({ lat: data.latitude, lng: data.longitude });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (!item || mapCoords || !item.location) return;
    api.get<{ items: { mapy: string; mapx: string }[] }>(
      `/api/search/local?query=${encodeURIComponent(item.location)}`,
      token ?? ""
    )
      .then((data) => {
        const doc = data.items?.[0];
        if (doc) setMapCoords({ lat: parseInt(doc.mapy) / 1e7, lng: parseInt(doc.mapx) / 1e7 });
      })
      .catch(() => {});
  }, [item, mapCoords, token]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <p className="text-sm text-app-gray">게시물을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const isLost = item.itemType === "LOST";
  const isOwner = myUserId !== null && myUserId === item.userId;
  const ctaColor = isLost ? "#FF7A00" : "#1E3A5F";
  const ctaText = isLost ? "이 물건을 주운 것 같아요" : "이 물건 제 것 같아요";
  const dateLabel = `${item.occurredDate?.replace(/-/g, ".") ?? ""} ${isLost ? "분실" : "습득"}`;
  const category = `${item.majorCategory ?? ""} > ${item.minorCategory ?? ""}`;

  const handleBack = () => fromRegistration ? router.replace("/") : router.back();

  const handleShare = async () => {
    const url = `${window.location.origin}/detail/${item.id}`;
    if (navigator.share) {
      await navigator.share({ title: item.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요!");
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/registration/${item.id}`, token);
      setShowDeleteConfirm(false);
      router.replace("/");
    } catch {
      setShowDeleteConfirm(false);
      setShowDeleteError(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMatchComplete = async () => {
    if (!token) return;
    setShowMore(false);
    setActionLoading(true);
    try {
      const updated = await api.patch<RegistrationDetail>(`/api/registration/${item.id}/matched`, token, {});
      setItem(updated);
    } catch {
      alert("처리 중 문제가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    setShowMore(false);
    if (!confirm("이 게시물을 신고하시겠습니까?")) return;
    if (!token) return;
    try {
      await api.post(`/api/registration/${item.id}/report`, token, {});
      alert("신고가 접수되었습니다.");
    } catch {
      alert("신고 처리 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="relative min-h-dvh bg-white md:bg-app-bg">
      <TopHeader />
      {/* 메인 레이아웃 */}
      <div className="md:max-w-[1200px] md:mx-auto md:px-8 md:pt-[88px] md:pb-16 md:flex md:gap-8 md:items-start">

        {/* 히어로 이미지 */}
        <div className="relative w-full h-[317px] overflow-hidden bg-white md:flex-1 md:aspect-square md:h-auto md:rounded-2xl md:sticky md:top-[88px]">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill className="object-cover" priority unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {React.createElement(CATEGORY_ICONS[item.majorCategory ?? ""] ?? KeyRoundIcon, { size: 80, color: "#ABABAB" })}
            </div>
          )}
          {/* 오버레이 버튼들 (모바일만) */}
          <div className="md:hidden">
            <div className="absolute top-8 left-6 z-10">
              <DarkBtn onClick={handleBack}><BackIcon /></DarkBtn>
            </div>
            <div className="absolute top-8 right-[70px] z-10">
              <DarkBtn onClick={handleShare}><ShareIcon /></DarkBtn>
            </div>
            <div className="absolute top-8 right-6 z-10">
              <DarkBtn onClick={() => setShowMore(true)}><MoreIcon /></DarkBtn>
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="-mt-px md:mt-0 mx-1 md:mx-0 rounded-t-[20px] md:rounded-2xl bg-app-bg md:bg-white px-6 md:px-8 pt-6 pb-32 md:pb-8 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] md:shadow-none md:flex-1 md:min-w-0">

          {/* 카테고리 태그 + 데스크탑 액션 버튼 */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center bg-[#E5E5E5] rounded-full px-3 h-[27px]">
              <span className="text-xs font-medium text-black">{category}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-app-bg hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg width="14" height="16" viewBox="0 0 13 15" fill="none">
                  <path d="M10.5 4.5C11.6046 4.5 12.5 3.60457 12.5 2.5C12.5 1.39543 11.6046 0.5 10.5 0.5C9.39543 0.5 8.5 1.39543 8.5 2.5C8.5 3.60457 9.39543 4.5 10.5 4.5Z" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 9.16663C3.60457 9.16663 4.5 8.2712 4.5 7.16663C4.5 6.06206 3.60457 5.16663 2.5 5.16663C1.39543 5.16663 0.5 6.06206 0.5 7.16663C0.5 8.2712 1.39543 9.16663 2.5 9.16663Z" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 13.8333C11.6046 13.8333 12.5 12.9378 12.5 11.8333C12.5 10.7287 11.6046 9.83325 10.5 9.83325C9.39543 9.83325 8.5 10.7287 8.5 11.8333C8.5 12.9378 9.39543 13.8333 10.5 13.8333Z" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.22668 8.17334L8.78002 10.8267" stroke="#1A1A1A" strokeLinecap="round" />
                  <path d="M8.77335 3.50659L4.22668 6.15992" stroke="#1A1A1A" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => setShowMore(true)}
                className="w-9 h-9 rounded-full bg-app-bg hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg width="16" height="4" viewBox="0 0 14 4" fill="none">
                  <path d="M12.9933 2H13" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6.99667 2H7.00333" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M1 2H1.00667" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-[22px] font-bold text-black mb-[22px] tracking-[-0.3px]">{item.title}</h1>

          <Divider />

          {/* 프로필 */}
          <div className="flex items-center py-3">
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-app-gray-light shrink-0">
              {item.userProfileImageUrl ? (
                <Image src={item.userProfileImageUrl} alt="" width={45} height={45} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#ABABAB" strokeWidth="1.8" />
                    <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-black">{item.userName}</p>
              <p className="text-[10px] text-[#464646] mt-1">{dateLabel}</p>
            </div>
          </div>

          <Divider />

          {/* 상세 설명 */}
          <p className="text-xs font-bold text-black mt-4 mb-2">상세 설명</p>
          <p className="text-xs leading-4 mb-4" style={{ color: item.description ? "#434343" : "#ABABAB" }}>
            {item.description || "상세 설명이 없습니다."}
          </p>

          <Divider />

          {/* 위치 */}
          <p className="text-xs font-bold text-black mt-4 mb-[18px]">
            {isLost ? "분실 위치" : "습득 위치"}
          </p>
          <div className="rounded-lg overflow-hidden shadow-sm mb-4 isolate">
            {mapCoords ? (
              <NaverMapView lat={mapCoords.lat} lng={mapCoords.lng} height={120} interactive={false} borderRadius={0} />
            ) : (
              <div className="h-[120px] bg-app-gray-light flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-app-border border-t-app-gray rounded-full animate-spin" />
              </div>
            )}
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(item.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 h-[33px] bg-app-bg gap-1.5 no-underline"
            >
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" className="shrink-0">
                <path d="M8.5 4.5C8.5 6.9965 5.7305 9.5965 4.8005 10.3995C4.71386 10.4646 4.6084 10.4999 4.5 10.4999C4.3916 10.4999 4.28614 10.4646 4.1995 10.3995C3.2695 9.5965 0.5 6.9965 0.5 4.5C0.5 3.43913 0.921427 2.42172 1.67157 1.67157C2.42172 0.921427 3.43913 0.5 4.5 0.5C5.56087 0.5 6.57828 0.921427 7.32843 1.67157C8.07857 2.42172 8.5 3.43913 8.5 4.5Z" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.5 6.00024C5.32843 6.00024 6 5.32867 6 4.50024C6 3.67182 5.32843 3.00024 4.5 3.00024C3.67157 3.00024 3 3.67182 3 4.50024C3 5.32867 3.67157 6.00024 4.5 6.00024Z" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex-1 text-[10px] text-black truncate">{item.location}</span>
              {mapCoords && (
                <svg width="5" height="9" viewBox="0 0 5 9" fill="none" className="shrink-0">
                  <path d="M0.5 0.5L4.5 4.5L0.5 8.5" stroke="#1E3A5F" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </a>
          </div>

          <Divider />

          {/* AI 매칭 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-black">AI 매칭</span>
              {item.matched && (
                <div className="flex items-center gap-1.5">
                  <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: ctaColor }} />
                  <span className="text-[11px] font-semibold tracking-[-0.32px]" style={{ color: ctaColor }}>매칭 완료</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-[10px] p-3.5 flex items-center justify-between shadow-sm">
              <div className="flex-1 mr-3">
                <p className="text-[13px] font-bold text-black mb-1 tracking-[-0.32px]">
                  {item.matched ? "유사도 Top5 결과가 준비됐어요!" : "유사도 Top5를 확인해보세요!"}
                </p>
                <p className="text-[11px] text-[#757575] leading-[15px] tracking-[-0.32px]">
                  AI가 분석한 가장 유사한 5개 결과를 확인해보세요.
                </p>
              </div>
              <button
                onClick={() => router.push(`/top5?id=${item.id}&type=${isLost ? "lost" : "found"}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer shrink-0"
                style={{ backgroundColor: ctaColor }}
              >
                <svg width="11" height="13" viewBox="0 0 13 15" fill="none">
                  <path d="M3.30005 0.5V3.3" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.1001 0.5V3.3" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.8999 0.5V3.3" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.3 1.8999H1.9C1.1268 1.8999 0.5 2.5267 0.5 3.2999V13.0999C0.5 13.8731 1.1268 14.4999 1.9 14.4999H10.3C11.0732 14.4999 11.7 13.8731 11.7 13.0999V3.2999C11.7 2.5267 11.0732 1.8999 10.3 1.8999Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.30005 6.1001H7.50005" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.30005 8.8999H8.90005" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.30005 11.7H6.80005" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                결과 보기
              </button>
            </div>
          </div>

          {/* 데스크탑 CTA */}
          <div className="hidden md:block mt-6">
            <button
              className="w-full h-[50px] rounded-[10px] flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer"
              style={{ backgroundColor: ctaColor }}
              onClick={() => router.push("/chat")}
            >
              <ChatIcon />
              {ctaText}
            </button>
          </div>
        </div>
      </div>

      {/* 하단 CTA (모바일만) */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-bg px-7 pt-3 pb-6 z-50 md:hidden">
        <button
          className="w-full h-[46px] rounded-[10px] flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer"
          style={{ backgroundColor: ctaColor }}
          onClick={() => router.push("/chat")}
        >
          <ChatIcon />
          {ctaText}
        </button>
      </div>

      {/* 더보기 바텀시트 / 데스크탑 모달 */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="relative bg-white rounded-t-[20px] pb-8 md:rounded-2xl md:pb-2 md:w-[360px]">
            <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3 mb-2 md:hidden" />
            {isOwner ? (
              <>
                {!item.matched && (
                  <button onClick={handleMatchComplete} className="w-full px-6 py-[18px] border-b border-[#F0F0F0] text-left cursor-pointer">
                    <p className="text-base font-semibold text-navy">매칭 완료</p>
                    <p className="text-xs text-app-gray mt-0.5">물건을 찾았어요</p>
                  </button>
                )}
                <button
                  onClick={() => { setShowMore(false); router.push(`/edit?id=${item.id}`); }}
                  className="w-full px-6 py-[18px] border-b border-[#F0F0F0] text-left cursor-pointer"
                >
                  <p className="text-base font-semibold text-[#434343]">수정하기</p>
                  <p className="text-xs text-app-gray mt-0.5">게시물 내용을 수정합니다</p>
                </button>
                <button onClick={() => { setShowMore(false); setShowDeleteConfirm(true); }} className="w-full px-6 py-[18px] text-left cursor-pointer">
                  <p className="text-base font-semibold text-red-500">게시물 삭제</p>
                  <p className="text-xs text-app-gray mt-0.5">이 게시물을 삭제합니다</p>
                </button>
              </>
            ) : (
              <button onClick={handleReport} className="w-full px-6 py-[18px] text-left cursor-pointer">
                <p className="text-base font-semibold text-red-500">신고하기</p>
                <p className="text-xs text-app-gray mt-0.5">부적절한 게시물을 신고합니다</p>
              </button>
            )}
            <button onClick={() => setShowMore(false)} className="hidden md:block w-full px-6 py-[18px] border-t border-[#F0F0F0] text-left cursor-pointer">
              <p className="text-base font-semibold text-app-gray">닫기</p>
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-[280px]">
            <h2 className="text-base font-bold text-black text-center mb-2">게시물 삭제</h2>
            <p className="text-sm text-[#434343] text-center mb-6">정말 삭제하시겠습니까?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-[42px] rounded-lg border border-app-border text-sm font-semibold text-[#434343] cursor-pointer">취소</button>
              <button onClick={handleDelete} disabled={actionLoading} className="flex-1 h-[42px] rounded-lg bg-red-500 text-sm font-semibold text-white cursor-pointer">
                {actionLoading ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 실패 모달 */}
      {showDeleteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-[280px]">
            <h2 className="text-base font-bold text-black text-center mb-2">삭제 실패</h2>
            <p className="text-sm text-[#434343] text-center mb-6">매칭 결과가 있어 삭제할 수 없습니다.</p>
            <button onClick={() => setShowDeleteError(false)} className="w-full h-[42px] rounded-lg bg-red-500 text-sm font-semibold text-white cursor-pointer">확인</button>
          </div>
        </div>
      )}

      {/* 액션 로딩 오버레이 */}
      {actionLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
