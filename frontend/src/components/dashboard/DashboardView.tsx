"use client";

import { motion } from "framer-motion";
import { Calendar, Wallet, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

// 위젯 컴포넌트들 가져오기
import { QuickStatsWidget } from "./QuickStatsWidget";
import { TodayEventsWidget } from "./TodayEventsWidget";
import { MonthlyExpenseWidget } from "./MonthlyExpenseWidget";
import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { WeatherWidget } from "./WeatherWidget";

/**
 * DashboardView - 메인 대시보드 레이아웃
 *
 * MCP Calendar의 메인 대시보드 페이지
 * 모든 위젯들을 반응형 그리드로 배치
 *
 * 레이아웃 구조:
 * - 상단: 인사 메시지 & 퀵 액세스 버튼
 * - 통계: 4열 퀵 스탯 카드
 * - 메인: 3열 그리드 (모바일 1열, 태블릿 2열, 데스크톱 3열)
 *
 * Note: 배경(CosmicBackground)은 MainLayout에서 제공하므로 여기서 중복 적용하지 않음.
 * MainLayout이 이미 p-4 md:p-6 lg:p-8 패딩을 제공하므로 추가 패딩/max-w 최소화.
 */

// 현재 시간에 따른 인사말 생성
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "좋은 새벽이에요";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "좋은 저녁이에요";
}

// 현재 날짜 포맷팅
function getFormattedDate(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// 퀵 액세스 버튼 컴포넌트
const QuickAccessButton = memo(function QuickAccessButton({
  href,
  icon: Icon,
  label,
  variant,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  variant: "blue" | "gold";
}) {
  const variants = {
    blue: "from-cosmic-blue/20 to-cosmic-blue/10 border-cosmic-blue/30 hover:border-cosmic-blue/50 hover:from-cosmic-blue/30",
    gold: "from-cosmic-gold/20 to-cosmic-gold/10 border-cosmic-gold/30 hover:border-cosmic-gold/50 hover:from-cosmic-gold/30",
  };

  const iconColors = {
    blue: "text-cosmic-blue",
    gold: "text-cosmic-gold",
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 rounded-xl border bg-gradient-to-r 
                    px-4 py-2.5 sm:px-5 sm:py-3 transition-all duration-300 ${variants[variant]}`}
      >
        <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        <span className="font-medium text-cosmic-white text-sm sm:text-base">{label}</span>
      </motion.div>
    </Link>
  );
});

export function DashboardView() {
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();

  return (
    <div className="relative mx-auto max-w-7xl">
      {/* 상단 헤더 영역 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        {/* 인사말 & 날짜 */}
        <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cosmic-gold" />
              <span className="text-sm text-cosmic-gold">MCP Calendar</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-cosmic-white sm:text-3xl lg:text-4xl">
              {greeting} ✨
            </h1>
            <p className="mt-1 text-cosmic-gray text-sm sm:text-base">{formattedDate}</p>
          </div>

          {/* 퀵 액세스 버튼 */}
          <div className="flex gap-3">
            <QuickAccessButton
              href="/calendar"
              icon={Calendar}
              label="캘린더"
              variant="blue"
            />
            <QuickAccessButton
              href="/ledger"
              icon={Wallet}
              label="가계부"
              variant="gold"
            />
          </div>
        </div>
      </motion.header>

      {/* 퀵 통계 섹션 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <QuickStatsWidget />
      </motion.section>

      {/* 메인 위젯 그리드 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* 오늘의 일정 위젯 */}
        <div className="md:col-span-1 lg:col-span-1">
          <TodayEventsWidget />
        </div>

        {/* 날씨 위젯 */}
        <div className="md:col-span-1 lg:col-span-1">
          <WeatherWidget />
        </div>

        {/* 월별 지출 위젯 */}
        <div className="md:col-span-1 lg:col-span-1">
          <MonthlyExpenseWidget />
        </div>

        {/* 다가오는 일정 위젯 - 넓게 */}
        <div className="md:col-span-2 lg:col-span-2">
          <UpcomingEventsWidget />
        </div>

        {/* AI 어시스턴트 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                     bg-gradient-to-br from-cosmic-dark/90 to-cosmic-dark 
                     p-6 backdrop-blur-sm transition-all duration-300
                     hover:border-cosmic-blue/30 hover:shadow-lg hover:shadow-cosmic-blue/5"
        >
          {/* 장식 요소 */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full 
                          bg-cosmic-blue/10 blur-2xl" />

          <div className="relative z-10 flex flex-col items-center justify-center 
                          py-4 text-center">
            <Star className="mb-3 h-10 w-10 text-cosmic-gold" />
            <h3 className="text-lg font-semibold text-cosmic-white">
              AI 어시스턴트
            </h3>
            <p className="mt-1 text-sm text-cosmic-gray">
              채팅으로 일정/가계부 관리
            </p>
            <p className="mt-3 text-xs text-cosmic-light">
              AI가 일정과 지출을 분석하여<br />
              맞춤 추천을 제공합니다
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* 푸터 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 sm:mt-12 border-t border-cosmic-blue/10 pt-6 text-center"
      >
        <p className="text-xs sm:text-sm text-cosmic-gray">
          © 2026 MCP Calendar. 우주의 별빛처럼 빛나는 당신의 일상을 응원합니다 ✨
        </p>
      </motion.footer>
    </div>
  );
}
