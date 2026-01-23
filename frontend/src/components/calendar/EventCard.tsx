"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { CalendarEvent, EventCategory } from "@/types";

/**
 * EventCard 컴포넌트
 * 
 * 이벤트를 카드 형태로 표시
 * - 리스트 뷰에서 사용
 * - 카테고리별 색상 표시
 * - 호버 시 상세 정보 표시
 */

interface EventCardProps {
  /** 이벤트 데이터 */
  event: CalendarEvent;
  /** 카드 클릭 핸들러 */
  onClick?: () => void;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/* 카테고리별 색상 설정 - 우주 테마 */
export const categoryColors: Record<EventCategory, { bg: string; border: string; text: string; glow: string }> = {
  work: {
    bg: 'bg-cosmic-blue/20',
    border: 'border-cosmic-blue',
    text: 'text-cosmic-blue',
    glow: 'hover:shadow-[0_0_15px_rgba(66,112,140,0.5)]',
  },
  personal: {
    bg: 'bg-cosmic-gold/20',
    border: 'border-cosmic-gold',
    text: 'text-cosmic-gold',
    glow: 'hover:shadow-[0_0_15px_rgba(242,191,145,0.5)]',
  },
  meeting: {
    bg: 'bg-cosmic-light/20',
    border: 'border-cosmic-light',
    text: 'text-cosmic-light',
    glow: 'hover:shadow-[0_0_15px_rgba(128,173,191,0.5)]',
  },
  important: {
    bg: 'bg-cosmic-red/20',
    border: 'border-cosmic-red',
    text: 'text-cosmic-red',
    glow: 'hover:shadow-[0_0_15px_rgba(115,60,60,0.5)]',
  },
  other: {
    bg: 'bg-cosmic-gray/20',
    border: 'border-cosmic-gray',
    text: 'text-cosmic-gray',
    glow: 'hover:shadow-[0_0_15px_rgba(155,173,184,0.5)]',
  },
};

/* 카테고리 한글 라벨 */
export const categoryLabels: Record<EventCategory, string> = {
  work: '업무',
  personal: '개인',
  meeting: '미팅',
  important: '중요',
  other: '기타',
};

export function EventCard({ event, onClick, compact = false, className }: EventCardProps) {
  const category = event.category || 'other';
  const colors = categoryColors[category];

  /* 시간 포맷팅 */
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'M월 d일 (E)', { locale: ko });
    } catch {
      return '';
    }
  };

  /* 컴팩트 모드 - 캘린더 셀 내부 표시용 */
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "px-2 py-1 rounded-md cursor-pointer transition-all duration-200",
          "text-xs font-medium truncate",
          colors.bg,
          `border-l-2 ${colors.border}`,
          colors.glow,
          className
        )}
      >
        <span className="text-cosmic-white">{event.title}</span>
      </motion.div>
    );
  }

  /* 일반 모드 - 리스트 뷰용 */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl cursor-pointer transition-all duration-300",
        "bg-cosmic-dark/60 backdrop-blur-sm",
        "border border-cosmic-blue/20",
        colors.glow,
        className
      )}
    >
      {/* 카테고리 인디케이터 */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", colors.border)} />

      {/* 메인 컨텐츠 */}
      <div className="pl-3">
        {/* 헤더 - 제목과 카테고리 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-cosmic-white text-base leading-tight">
            {event.title}
          </h3>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
            colors.bg, colors.text
          )}>
            {categoryLabels[category]}
          </span>
        </div>

        {/* 설명 */}
        {event.description && (
          <p className="text-sm text-cosmic-gray mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-cosmic-gray">
          {/* 날짜 */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cosmic-light" />
            <span>{formatDate(event.startTime)}</span>
          </div>

          {/* 시간 */}
          {!event.allDay && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cosmic-light" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
          )}

          {/* 위치 */}
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cosmic-gold" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 글로우 이펙트 오버레이 */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
        "bg-gradient-to-r",
        category === 'work' && "from-cosmic-blue/5 to-transparent",
        category === 'personal' && "from-cosmic-gold/5 to-transparent",
        category === 'meeting' && "from-cosmic-light/5 to-transparent",
        category === 'important' && "from-cosmic-red/5 to-transparent",
        category === 'other' && "from-cosmic-gray/5 to-transparent",
        "group-hover:opacity-100"
      )} />
    </motion.div>
  );
}
