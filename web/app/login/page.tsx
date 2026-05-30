"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const KAKAO_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/kakao";
const NAVER_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/naver";
const GOOGLE_OAUTH_URL = "https://api.getitsju.com/api/auth/oauth2/google";

const BUTTONS = [
  { url: KAKAO_OAUTH_URL, bg: "#FEE500", text: "카카오 로그인", textColor: "#3C1E1E", icon: "/kakao-icon.svg", w: 20, h: 20 },
  { url: NAVER_OAUTH_URL, bg: "#03C75A", text: "네이버 로그인", textColor: "#fff", icon: "/naver-icon.svg", w: 20, h: 20 },
  { url: GOOGLE_OAUTH_URL, bg: "#fff", text: "구글 로그인", textColor: "#1E3A5F", icon: "/google-icon.svg", w: 18, h: 18, border: true },
];

export default function LoginPage() {
  const router = useRouter();
  const handleOAuth = (url: string) => { window.location.href = url; };

  const LoginButtons = () => (
    <div className="flex flex-col gap-3">
      {BUTTONS.map(({ url, bg, text, textColor, icon, w, h, border }) => (
        <button key={text} onClick={() => handleOAuth(url)}
          className={`w-full h-12 rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-opacity active:opacity-85 ${border ? "border border-app-gray-light" : ""}`}
          style={{ backgroundColor: bg }}>
          <Image src={icon} alt="" width={w} height={h} />
          <span className="text-base font-semibold" style={{ color: textColor }}>{text}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* 모바일 레이아웃 */}
      <div className="md:hidden min-h-dvh bg-app-bg relative">
        <button onClick={() => router.back()} className="absolute top-14 left-6 z-10 p-1">
          <Image src="/back-arrow.svg" alt="뒤로" width={11} height={19} />
        </button>
        <div className="flex justify-center pt-[262px]">
          <Image src="/getit-logo.svg" alt="GET IT" width={180} height={149} />
        </div>
        <div className="absolute bottom-[72px] left-6 right-6">
          <div className="flex items-center mb-7">
            <div className="flex-1 h-px bg-app-border" />
            <span className="mx-3 text-xs font-semibold text-app-gray">로그인/회원가입</span>
            <div className="flex-1 h-px bg-app-border" />
          </div>
          <LoginButtons />
        </div>
      </div>

      {/* 데스크탑 레이아웃 */}
      <div className="hidden md:flex min-h-dvh bg-app-bg items-center justify-center">
        <div className="flex w-full max-w-[900px] bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* 왼쪽: 브랜딩 */}
          <div className="flex-1 bg-white flex flex-col items-center justify-center py-16 px-12 border-r border-app-gray-light">
            <Image src="/getit-logo.svg" alt="GET IT" width={240} height={198} />
            <p className="text-app-gray text-sm mt-8 text-center leading-relaxed">
              분실물과 습득물을 AI로 매칭해드립니다
            </p>
          </div>

          {/* 오른쪽: 로그인 */}
          <div className="w-[380px] shrink-0 flex flex-col justify-center px-10 py-12">
            <h2 className="text-2xl font-bold text-black mb-2">로그인</h2>
            <p className="text-sm text-app-gray mb-8">소셜 계정으로 간편하게 시작하세요</p>
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-app-border" />
              <span className="mx-3 text-xs font-semibold text-app-gray">로그인/회원가입</span>
              <div className="flex-1 h-px bg-app-border" />
            </div>
            <LoginButtons />
          </div>
        </div>
      </div>
    </>
  );
}
