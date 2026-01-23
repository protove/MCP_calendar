"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import { ChatInterface } from "../chat/ChatInterface";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// 페이지 타이틀 매핑
const pageTitles: Record<string, string> = {
  "/": "대시보드",
  "/calendar": "캘린더",
  "/ledger": "가계부",
};

/**
 * 메인 레이아웃 컴포넌트
 * 
 * 우주/별자리 테마가 적용된 메인 레이아웃
 * - 반응형 사이드바 (모바일: 토글, 데스크탑: 항상 표시)
 * - 모바일 헤더
 * - 페이지 전환 애니메이션
 * - AI 어시스턴트 채팅 패널
 * - 우주 배경 효과
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 확인 (hydration 이슈 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 현재 페이지 타이틀
  const currentTitle = pageTitles[pathname] || "MCP Calendar";

  // 로딩 상태 (마운트 전)
  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-cosmic-dark">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* 우주 배경 효과 */}
      <CosmicBackground />

      {/* 모바일 오버레이 (메뉴 열렸을 때) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 사이드바 - 모바일에서는 오버레이 형태 */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(false)}
          isMobile={true}
        />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* 모바일 헤더 */}
        <Header
          title={currentTitle}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* 컨텐츠 영역 with 리사이즈 가능한 채팅 패널 */}
        <ResizablePanelGroup direction="horizontal" autoSaveId="main-layout">
          {/* 메인 컨텐츠 패널 */}
          <ResizablePanel defaultSize={100} minSize={30}>
            <main className="relative h-full w-full overflow-y-auto">
              {/* 페이지 전환 애니메이션 적용 */}
              <PageTransition>
                {/* 캘린더 페이지는 전체 높이 사용, 다른 페이지는 기본 패딩 */}
                {pathname === "/calendar" ? (
                  <div className="h-full p-2 md:p-4">{children}</div>
                ) : (
                  <div className="p-4 md:p-6 lg:p-8">{children}</div>
                )}
              </PageTransition>
            </main>
          </ResizablePanel>

          {/* 채팅 패널 (열려있을 때만) */}
          {isChatOpen && (
            <>
              <ResizableHandle withHandle className="bg-cosmic-light/10 hover:bg-cosmic-light/20 transition-colors" />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <ChatInterface onClose={() => setIsChatOpen(false)} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* AI 어시스턴트 플로팅 버튼 */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(true)}
              className={cn(
                "fixed bottom-6 right-6 z-50",
                "flex h-14 w-14 items-center justify-center",
                "rounded-full",
                "bg-gradient-to-br from-cosmic-blue to-cosmic-light",
                "text-cosmic-white shadow-cosmic-lg",
                "hover:shadow-cosmic-glow",
                "transition-shadow duration-300",
                "group"
              )}
              aria-label="AI 어시스턴트 열기"
            >
              {/* 글로우 효과 */}
              <div className="absolute inset-0 rounded-full bg-cosmic-light/20 blur-md group-hover:blur-lg transition-all" />
              
              {/* 아이콘 */}
              <div className="relative flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
                {/* 반짝임 효과 */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-3 w-3 text-cosmic-gold" />
                </motion.div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * 우주 배경 효과 컴포넌트
 * CSS 기반 별/은하수 효과
 */
function CosmicBackground() {
  return (
    <>
      {/* 기본 배경 그라데이션 */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-cosmic-dark via-[#1a2332] to-[#0d1117]" />
      
      {/* 별자리 효과 (globals.css의 .cosmic-starfield 활용) */}
      <div className="cosmic-starfield" />
      
      {/* 은하수 글로우 효과 */}
      <div className="cosmic-glow" />
      
      {/* 추가 앰비언트 라이트 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* 좌상단 블루 글로우 */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cosmic-blue/5 rounded-full blur-3xl" />
        {/* 우하단 골드 글로우 */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cosmic-gold/5 rounded-full blur-3xl" />
      </div>
    </>
  );
}

/**
 * 로딩 스피너 컴포넌트
 * 우주 테마에 맞는 로딩 인디케이터
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* 회전하는 궤도 */}
      <div className="relative h-16 w-16">
        {/* 외부 링 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-cosmic-light/30 border-t-cosmic-gold"
        />
        {/* 내부 링 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-cosmic-blue/30 border-t-cosmic-light"
        />
        {/* 중심 별 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="h-6 w-6 text-cosmic-gold" />
        </motion.div>
      </div>
      {/* 로딩 텍스트 */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm text-cosmic-gray"
      >
        로딩 중...
      </motion.p>
    </div>
  );
}

export default MainLayout;
