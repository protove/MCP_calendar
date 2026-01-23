"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * CalendarHeader 컴포넌트
 * 
 * 캘린더 상단 헤더 영역
 * - 현재 날짜 표시
 * - 이전/다음 월 네비게이션
 * - 뷰 전환 버튼 (월간/주간/일간)
 * - 이벤트 추가 버튼
 */

/* 뷰 타입 정의 */
export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface CalendarHeaderProps {
  /** 현재 표시되는 날짜 */
  currentDate: Date;
  /** 현재 뷰 타입 */
  currentView: CalendarViewType;
  /** 이전 기간으로 이동 */
  onPrev: () => void;
  /** 다음 기간으로 이동 */
  onNext: () => void;
  /** 오늘로 이동 */
  onToday: () => void;
  /** 뷰 변경 핸들러 */
  onViewChange: (view: CalendarViewType) => void;
  /** 이벤트 추가 버튼 클릭 */
  onAddEvent: () => void;
}

/* 뷰 버튼 설정 */
const viewButtons: { view: CalendarViewType; icon: React.ElementType; label: string }[] = [
  { view: 'dayGridMonth', icon: LayoutGrid, label: '월' },
  { view: 'timeGridWeek', icon: List, label: '주' },
  { view: 'timeGridDay', icon: Clock, label: '일' },
];

export function CalendarHeader({
  currentDate,
  currentView,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onAddEvent,
}: CalendarHeaderProps) {
  /* 현재 날짜 포맷팅 - 한국어 형식 */
  const formattedDate = format(currentDate, 'yyyy년 MMMM', { locale: ko });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
    >
      {/* 왼쪽: 날짜 네비게이션 */}
      <div className="flex items-center gap-3">
        {/* 이전/다음 버튼 */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrev}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "bg-cosmic-dark/50 border border-cosmic-blue/30",
              "hover:bg-cosmic-blue/20 hover:border-cosmic-blue/50",
              "text-cosmic-white"
            )}
            aria-label="이전"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "bg-cosmic-dark/50 border border-cosmic-blue/30",
              "hover:bg-cosmic-blue/20 hover:border-cosmic-blue/50",
              "text-cosmic-white"
            )}
            aria-label="다음"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 오늘 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToday}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "bg-cosmic-dark/50 border border-cosmic-blue/30",
            "hover:bg-cosmic-blue/20 hover:border-cosmic-blue/50",
            "text-cosmic-white"
          )}
        >
          오늘
        </motion.button>

        {/* 현재 날짜 표시 */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-cosmic-gold" />
          <h2 className="text-xl sm:text-2xl font-bold text-cosmic-white">
            {formattedDate}
          </h2>
        </div>
      </div>

      {/* 오른쪽: 뷰 전환 및 추가 버튼 */}
      <div className="flex items-center gap-3">
        {/* 뷰 전환 버튼 그룹 */}
        <div className="flex items-center p-1 rounded-lg bg-cosmic-dark/50 border border-cosmic-blue/30">
          {viewButtons.map(({ view, icon: Icon, label }) => (
            <motion.button
              key={view}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(view)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                currentView === view
                  ? "bg-cosmic-blue text-cosmic-white shadow-cosmic"
                  : "text-cosmic-gray hover:text-cosmic-white hover:bg-cosmic-blue/20"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* 이벤트 추가 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(242, 191, 145, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddEvent}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-gradient-to-r from-cosmic-blue to-cosmic-light",
            "text-white font-medium text-sm",
            "shadow-cosmic hover:shadow-cosmic-lg",
            "transition-all duration-200"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">새 일정</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
