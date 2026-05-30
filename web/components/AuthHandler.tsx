"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export function AuthHandler() {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      router.replace("/login");
    });
  }, [logout, router]);

  return null;
}
