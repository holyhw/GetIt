"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function OAuthRedirectPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");
    if (token) {
      login(token);
      router.replace("/");
    }
    // 토큰 없으면 그냥 홈으로 (강제 로그인 리다이렉트 제거)
  }, [login, router]);

  return (
    <div className="min-h-dvh bg-app-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
    </div>
  );
}
