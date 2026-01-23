"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import type { CalendarEvent } from "@/types";

/**
 * MiniCalendar 컴포넌트
 * 
 * 사이드바용 작은 월간 캘린더
 * - 날짜 선택 기능
 * - 이벤트 있는 날짜 표시
 * - 우주 테마 스타일링
 */

interface MiniCalendarProps {
  /** 현재 선택된 날짜 */
  selectedDate: Date;
  /** 날짜 선택 핸들러 */
  onDateSelect: (date: Date) => void;
  /** 이벤트 목록 - 이벤트 있는 날짜 표시용 */
  events?: CalendarEvent[];
  /** 추가 클래스 */
  className?: string;
}

/* 요일 라벨 */
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export function MiniCalendar({ 
  selectedDate, 
  onDateSelect, 
  events = [],
  className 
}: MiniCalendarProps) {
  /* 현재 표시되는 월 */
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  /* 이전/다음 월 이동 */
  const goToPrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  /* 현재 월의 모든 날짜 계산 */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  /* 특정 날짜에 이벤트가 있는지 확인 */
  const hasEventOnDate = (date: Date): boolean => {
    return events.some(event => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-cosmic-dark/60 backdrop-blur-sm",
        "border border-cosmic-blue/20",
        className
      )}
    >
      {/* 헤더 - 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPrevMonth}
          className={cn(
            "p-1.5 rounded-lg transition-colors duration-200",
            "hover:bg-cosmic-blue/20 text-cosmic-gray hover:text-cosmic-white"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <span className="text-sm font-semibold text-cosmic-white">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
          className={cn(
            "p-1.5 rounded-lg transition-colors duration-200",
            "hover:bg-cosmic-blue/20 text-cosmic-gray hover:text-cosmic-white"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-medium py-1",
              index === 0 && "text-cosmic-red/80",  // 일요일
              index === 6 && "text-cosmic-blue",     // 토요일
              index !== 0 && index !== 6 && "text-cosmic-gray"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const hasEvent = hasEventOnDate(day);
            const dayOfWeek = day.getDay();

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "relative aspect-square flex items-center justify-center",
                  "text-xs font-medium rounded-lg transition-all duration-200",
                  /* 기본 스타일 */
                  !isCurrentMonth && "text-cosmic-gray/40",
                  isCurrentMonth && !isSelected && !isTodayDate && "text-cosmic-white hover:bg-cosmic-blue/20",
                  /* 주말 색상 */
                  isCurrentMonth && dayOfWeek === 0 && !isSelected && "text-cosmic-red/80",
                  isCurrentMonth && dayOfWeek === 6 && !isSelected && "text-cosmic-blue",
                  /* 오늘 */
                  isTodayDate && !isSelected && [
                    "text-cosmic-gold font-bold",
                    "ring-1 ring-cosmic-gold/50",
                  ],
                  /* 선택된 날짜 */
                  isSelected && [
                    "bg-cosmic-blue text-white",
                    "shadow-cosmic",
                  ],
                )}
              >
                {format(day, 'd')}
                
                {/* 이벤트 인디케이터 */}
                {hasEvent && !isSelected && (
                  <span className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2",
                    "w-1 h-1 rounded-full",
                    isTodayDate ? "bg-cosmic-gold" : "bg-cosmic-light"
                  )} />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* 오늘 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const today = new Date();
          setCurrentMonth(startOfMonth(today));
          onDateSelect(today);
        }}
        className={cn(
          "w-full mt-4 py-2 rounded-lg text-xs font-medium",
          "bg-cosmic-blue/10 border border-cosmic-blue/30",
          "text-cosmic-light hover:bg-cosmic-blue/20",
          "transition-all duration-200"
        )}
      >
        오늘로 이동
      </motion.button>
    </motion.div>
  );
}
