import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthLayoutRouter } from "@/components/layout/AuthLayoutRouter";
import "./globals.css";

// Inter 폰트 설정
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// 메타데이터 정의
export const metadata: Metadata = {
  title: {
    default: "MCP Calendar",
    template: "%s | MCP Calendar",
  },
  description: "LLM 기반 스마트 캘린더 & 가계부 관리 서비스",
  keywords: ["캘린더", "가계부", "일정 관리", "AI", "스마트"],
  authors: [{ name: "MCP Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

// 뷰포트 설정
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#141A26", // cosmic-dark
};

/**
 * 루트 레이아웃 컴포넌트
 * 
 * 앱 전체 구조를 정의합니다.
 * - Inter 폰트 적용
 * - 우주 테마 배경
 * - MainLayout 래퍼
 * 
 * 참고: 인증/비인증 페이지 분리는 각 라우트 그룹에서 처리
 * - (auth) 그룹: 로그인/회원가입 페이지
 * - 나머지: 인증된 사용자용 페이지
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-cosmic-dark text-cosmic-white antialiased`}
      >
        {/* AuthLayoutRouter가 인증 상태와 경로를 확인하여
          적절한 레이아웃을 적용합니다.
          - /login, /register: MainLayout 없이 렌더링
          - 나머지: 토큰 확인 → 인증되면 MainLayout, 아니면 /login 리다이렉트
        */}
        <AuthLayoutRouter>{children}</AuthLayoutRouter>
      </body>
    </html>
  );
}