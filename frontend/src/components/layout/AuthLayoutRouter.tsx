"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = ["/login", "/register"];

/**
 * 인증 기반 레이아웃 라우터
 * - /login, /register: MainLayout 없이 렌더링
 * - 나머지: 토큰 확인 후 MainLayout으로 감싸서 렌더링
 * - 토큰 없으면 /login으로 리다이렉트
 */
export function AuthLayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
      // 로그인 상태에서 auth 페이지 접근 시 대시보드로
      if (isPublicPath) {
        router.replace("/");
        return;
      }
    } else {
      setIsAuthenticated(false);
      // 비로그인 상태에서 보호된 페이지 접근 시 로그인으로
      if (!isPublicPath) {
        router.replace("/login");
        return;
      }
    }

    setAuthChecked(true);
  }, [pathname, isPublicPath, router]);

  // 인증 체크 전에는 로딩 표시
  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-cosmic-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-blue border-t-transparent" />
          <p className="text-sm text-cosmic-gray animate-pulse">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 공개 페이지 (로그인/회원가입) - MainLayout 없이
  if (isPublicPath) {
    return <>{children}</>;
  }

  // 인증된 사용자 - MainLayout 적용
  if (isAuthenticated) {
    return <MainLayout>{children}</MainLayout>;
  }

  return null;
}
