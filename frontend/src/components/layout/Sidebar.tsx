"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi, clearAuthData, getStoredUser } from "@/lib/api";

// 네비게이션 메뉴 항목 정의
const navigation = [
  { name: "대시보드", href: "/", icon: Home },
  { name: "캘린더", href: "/calendar", icon: Calendar },
  { name: "가계부", href: "/ledger", icon: CreditCard },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

/**
 * 우주/별자리 테마 사이드바 컴포넌트
 * - 글래스모피즘 효과
 * - 별 파티클 배경
 * - 접기/펼치기 기능
 * - 호버 글로우 효과
 */
export function Sidebar({ isOpen = true, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 토큰 만료 등 에러 무시
    } finally {
      clearAuthData();
      router.push('/login');
    }
  };

  // 모바일에서는 항상 펼침 상태
  const collapsed = isMobile ? false : isCollapsed;

  // 사이드바 접기/펼치기 토글
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <AnimatePresence mode="wait">
      {(isOpen || !isMobile) && (
        <motion.div
          initial={isMobile ? { x: -280 } : false}
          animate={{ x: 0 }}
          exit={isMobile ? { x: -280 } : undefined}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative flex h-full flex-col",
            "bg-cosmic-dark/90 backdrop-blur-xl",
            "border-r border-cosmic-light/10",
            "transition-all duration-300 ease-in-out",
            collapsed ? "w-20" : "w-64",
            isMobile && "fixed left-0 top-0 z-50 shadow-cosmic-lg"
          )}
        >
          {/* 별 파티클 배경 효과 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <StarParticles />
          </div>

          {/* 상단 글로우 효과 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cosmic-light/50 to-transparent" />

          {/* 로고 영역 */}
          <div className="relative flex h-16 items-center justify-center border-b border-cosmic-light/10 px-4">
            <div className="flex items-center gap-3">
              {/* 애니메이션 별/별자리 아이콘 */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Sparkles className="h-7 w-7 text-cosmic-gold" />
                {/* 글로우 효과 */}
                <div className="absolute inset-0 blur-md bg-cosmic-gold/30 rounded-full" />
              </motion.div>

              {/* 로고 텍스트 */}
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.h1
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl font-bold bg-gradient-to-r from-cosmic-light via-cosmic-gold to-cosmic-light bg-clip-text text-transparent whitespace-nowrap"
                  >
                    MCP Calendar
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>

            {/* 접기/펼치기 버튼 (모바일이 아닐 때만 표시) */}
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCollapse}
                className={cn(
                  "absolute -right-3 top-1/2 -translate-y-1/2",
                  "flex h-6 w-6 items-center justify-center",
                  "rounded-full bg-cosmic-blue/80 backdrop-blur-sm",
                  "border border-cosmic-light/30",
                  "text-cosmic-white shadow-cosmic",
                  "hover:bg-cosmic-light/30 hover:shadow-cosmic-glow",
                  "transition-all duration-200 z-10"
                )}
                aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </motion.button>
            )}
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center rounded-lg px-3 py-3",
                      "text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center" : "gap-3",
                      isActive
                        ? "bg-cosmic-blue/30 text-cosmic-gold"
                        : "text-cosmic-gray hover:bg-cosmic-light/10 hover:text-cosmic-white"
                    )}
                    onClick={() => isMobile && onToggle?.()}
                  >
                    {/* 활성 상태 배경 글로우 */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-cosmic-blue/20 via-cosmic-light/10 to-cosmic-blue/20 border border-cosmic-light/20"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}

                    {/* 아이콘 */}
                    <div className="relative z-10">
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-all duration-200",
                          isActive
                            ? "text-cosmic-gold drop-shadow-[0_0_8px_rgba(242,191,145,0.6)]"
                            : "text-cosmic-gray group-hover:text-cosmic-light group-hover:drop-shadow-[0_0_6px_rgba(128,173,191,0.4)]"
                        )}
                        aria-hidden="true"
                      />
                    </div>

                    {/* 메뉴 이름 */}
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* 호버 시 왼쪽 액센트 바 */}
                    <motion.div
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full",
                        "bg-gradient-to-b from-cosmic-gold via-cosmic-light to-cosmic-gold",
                        "shadow-[0_0_10px_rgba(242,191,145,0.5)]",
                        isActive ? "h-full opacity-100" : "h-0 opacity-0 group-hover:h-1/2 group-hover:opacity-70"
                      )}
                      transition={{ duration: 0.2 }}
                    />

                    {/* 툴팁 (접힌 상태에서) */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-cosmic-dark/95 backdrop-blur-sm border border-cosmic-light/20 rounded-md text-cosmic-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* 하단 프로필 섹션 */}
          <div className="relative border-t border-cosmic-light/10 p-3">
            {/* 유저 정보 */}
            <div
              className={cn(
                "flex items-center rounded-lg p-2 mb-2",
                "bg-cosmic-light/5 hover:bg-cosmic-light/10",
                "transition-all duration-200",
                collapsed ? "justify-center" : "gap-3"
              )}
            >
              {/* 아바타 */}
              <div className="relative flex-shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-blue to-cosmic-light text-cosmic-white text-sm font-semibold">
                  {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                </div>
                {/* 온라인 상태 표시 */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-cosmic-dark" />
              </div>

              {/* 유저 이름 및 이메일 */}
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-cosmic-white truncate">
                      {user?.name || '사용자'}
                    </p>
                    <p className="text-xs text-cosmic-gray truncate">
                      {user?.email || ''}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 로그아웃 버튼 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center rounded-lg px-3 py-2",
                "text-sm font-medium text-cosmic-gray",
                "hover:bg-cosmic-red/20 hover:text-cosmic-red",
                "transition-all duration-200",
                collapsed ? "justify-center" : "gap-3"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    로그아웃
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CSS 기반 별 파티클 컴포넌트
 * 사이드바 배경에 은은한 별빛 효과 제공
 */
function StarParticles() {
  return (
    <div className="relative w-full h-full">
      {/* 작은 별들 */}
      <div className="star-particle star-sm" style={{ top: "10%", left: "20%", animationDelay: "0s" }} />
      <div className="star-particle star-sm" style={{ top: "25%", left: "80%", animationDelay: "0.5s" }} />
      <div className="star-particle star-sm" style={{ top: "45%", left: "15%", animationDelay: "1s" }} />
      <div className="star-particle star-sm" style={{ top: "60%", left: "70%", animationDelay: "1.5s" }} />
      <div className="star-particle star-sm" style={{ top: "75%", left: "40%", animationDelay: "2s" }} />
      <div className="star-particle star-sm" style={{ top: "85%", left: "85%", animationDelay: "2.5s" }} />
      <div className="star-particle star-sm" style={{ top: "35%", left: "55%", animationDelay: "0.8s" }} />
      <div className="star-particle star-sm" style={{ top: "90%", left: "25%", animationDelay: "1.2s" }} />

      {/* 중간 별들 */}
      <div className="star-particle star-md" style={{ top: "15%", left: "60%", animationDelay: "0.3s" }} />
      <div className="star-particle star-md" style={{ top: "55%", left: "30%", animationDelay: "1.8s" }} />
      <div className="star-particle star-md" style={{ top: "80%", left: "65%", animationDelay: "0.7s" }} />

      {/* 큰 별 (골드) */}
      <div className="star-particle star-lg" style={{ top: "30%", left: "45%", animationDelay: "0.2s" }} />
      <div className="star-particle star-lg" style={{ top: "70%", left: "10%", animationDelay: "1.3s" }} />

      <style jsx>{`
        .star-particle {
          position: absolute;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }
        .star-sm {
          width: 2px;
          height: 2px;
          background: var(--cosmic-gray);
          opacity: 0.4;
        }
        .star-md {
          width: 3px;
          height: 3px;
          background: var(--cosmic-light);
          opacity: 0.5;
          box-shadow: 0 0 4px var(--cosmic-light);
        }
        .star-lg {
          width: 4px;
          height: 4px;
          background: var(--cosmic-gold);
          opacity: 0.6;
          box-shadow: 0 0 8px var(--cosmic-gold);
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
