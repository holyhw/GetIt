"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const KAKAO_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/kakao";
const NAVER_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/naver";
const GOOGLE_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/google";

export default function LoginPage() {
  const router = useRouter();

  const handleOAuth = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-dvh bg-app-bg relative">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="absolute top-14 left-6 z-10 p-1"
      >
        <Image src="/back-arrow.svg" alt="뒤로" width={11} height={19} />
      </button>

      {/* 로고 */}
      <div className="flex justify-center pt-[262px]">
        <Image src="/getit-logo.svg" alt="GET IT" width={180} height={149} />
      </div>

      {/* 하단 버튼 영역 */}
      <div className="absolute bottom-[72px] left-6 right-6">
        {/* 구분선 */}
        <div className="flex items-center mb-7">
          <div className="flex-1 h-px bg-app-border" />
          <span className="mx-3 text-xs font-semibold text-app-gray">로그인/회원가입</span>
          <div className="flex-1 h-px bg-app-border" />
        </div>

        {/* 카카오 */}
        <button
          onClick={() => handleOAuth(KAKAO_OAUTH_URL)}
          className="w-full h-12 rounded-[10px] flex items-center justify-center gap-2 mb-3 cursor-pointer transition-opacity active:opacity-85"
          style={{ backgroundColor: "#FEE500" }}
        >
          <Image src="/kakao-icon.svg" alt="" width={20} height={20} />
          <span className="text-base font-semibold" style={{ color: "#3C1E1E" }}>카카오 로그인</span>
        </button>

        {/* 네이버 */}
        <button
          onClick={() => handleOAuth(NAVER_OAUTH_URL)}
          className="w-full h-12 rounded-[10px] flex items-center justify-center gap-2 mb-3 cursor-pointer transition-opacity active:opacity-85"
          style={{ backgroundColor: "#03C75A" }}
        >
          <Image src="/naver-icon.svg" alt="" width={20} height={20} />
          <span className="text-base font-semibold text-white">네이버 로그인</span>
        </button>

        {/* 구글 */}
        <button
          onClick={() => handleOAuth(GOOGLE_OAUTH_URL)}
          className="w-full h-12 rounded-[10px] flex items-center justify-center gap-2 border border-app-gray-light bg-white cursor-pointer transition-opacity active:opacity-85"
        >
          <Image src="/google-icon.svg" alt="" width={18} height={18} />
          <span className="text-base font-semibold text-navy">구글 로그인</span>
        </button>
      </div>
    </div>
  );
}
