"use client";

import { motion } from "framer-motion";
import { Menu, Bell, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

// 목업 사용자 데이터
const mockUser = {
  name: "홍길동",
  avatar: null,
};

// 목업 알림 데이터
const mockNotifications = [
  { id: 1, title: "새 일정 추가됨", unread: true },
  { id: 2, title: "지출 알림", unread: true },
];

interface HeaderProps {
  /** 페이지 제목 */
  title?: string;
  /** 모바일 메뉴 열림 상태 */
  isMobileMenuOpen: boolean;
  /** 모바일 메뉴 토글 함수 */
  onMobileMenuToggle: () => void;
}

/**
 * 우주/별자리 테마 헤더 컴포넌트
 * - 모바일 햄버거 메뉴
 * - 페이지 타이틀
 * - 알림 벨
 * - 사용자 프로필 버튼
 */
export function Header({
  title = "대시보드",
  isMobileMenuOpen,
  onMobileMenuToggle,
}: HeaderProps) {
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center justify-between",
        "px-4 md:px-6",
        "bg-cosmic-dark/80 backdrop-blur-xl",
        "border-b border-cosmic-light/10",
        "md:hidden" // 데스크탑에서는 숨김
      )}
    >
      {/* 왼쪽: 햄버거 메뉴 버튼 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMobileMenuToggle}
        className={cn(
          "flex h-10 w-10 items-center justify-center",
          "rounded-lg bg-cosmic-light/10",
          "text-cosmic-white hover:bg-cosmic-light/20",
          "transition-colors duration-200"
        )}
        aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </motion.button>

      {/* 중앙: 페이지 타이틀 */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-cosmic-white"
      >
        {title}
      </motion.h1>

      {/* 오른쪽: 알림 & 프로필 */}
      <div className="flex items-center gap-2">
        {/* 알림 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center",
            "rounded-lg bg-cosmic-light/10",
            "text-cosmic-gray hover:text-cosmic-white hover:bg-cosmic-light/20",
            "transition-all duration-200"
          )}
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {/* 읽지 않은 알림 배지 */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -top-1 -right-1",
                "flex h-5 w-5 items-center justify-center",
                "rounded-full bg-cosmic-gold text-cosmic-dark",
                "text-xs font-bold",
                "shadow-[0_0_8px_rgba(242,191,145,0.5)]"
              )}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* 프로필 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex h-10 w-10 items-center justify-center",
            "rounded-full bg-gradient-to-br from-cosmic-blue to-cosmic-light",
            "text-cosmic-white font-semibold text-sm",
            "ring-2 ring-cosmic-light/20",
            "hover:ring-cosmic-gold/50",
            "transition-all duration-200"
          )}
          aria-label="프로필"
        >
          {mockUser.avatar ? (
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            mockUser.name.charAt(0)
          )}
        </motion.button>
      </div>
    </header>
  );
}

export default Header;
