import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
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
        {/* 
          LayoutRouter가 children의 경로를 감지하여
          (auth) 그룹이면 MainLayout 없이 렌더링하고
          그 외에는 MainLayout으로 감싸서 렌더링합니다.
          
          현재는 간단히 MainLayout으로 감싸는 형태입니다.
          추후 인증 로직 추가 시 조건부 렌더링 필요.
        */}
        <LayoutRouter>{children}</LayoutRouter>
      </body>
    </html>
  );
}

/**
 * 레이아웃 라우터 컴포넌트
 * 
 * 경로에 따라 다른 레이아웃을 적용합니다.
 * - /login, /register: 인증 레이아웃 (사이드바 없음)
 * - 그 외: 메인 레이아웃 (사이드바 있음)
 */
function LayoutRouter({ children }: { children: React.ReactNode }) {
  // 서버 컴포넌트에서는 현재 경로를 알 수 없으므로
  // 클라이언트 컴포넌트에서 처리하거나
  // 라우트 그룹의 layout.tsx에서 처리합니다.
  // 여기서는 기본적으로 MainLayout을 적용합니다.
  return <MainLayout>{children}</MainLayout>;
}