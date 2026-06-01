import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { AuthHandler } from "@/components/AuthHandler";

export const metadata: Metadata = {
  title: "GET IT",
  description: "분실물과 습득물을 AI로 매칭해드립니다",
  metadataBase: new URL("https://www.getitsju.com"),
  openGraph: {
    title: "GET IT",
    description: "분실물과 습득물을 AI로 매칭해드립니다",
    url: "https://www.getitsju.com",
    siteName: "GET IT",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GET IT",
    description: "분실물과 습득물을 AI로 매칭해드립니다",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full" suppressHydrationWarning>
        <AuthHandler />
        {children}
      </body>
    </html>
  );
}
