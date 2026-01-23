"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { CalendarEvent, EventFormData, EventModalMode } from "@/types";
import { EventForm } from "./EventForm";
import { categoryColors, categoryLabels } from "./EventCard";

/**
 * EventModal 컴포넌트
 * 
 * 이벤트 생성/수정/조회를 위한 모달
 * - 우주 테마 블러 오버레이
 * - 부드러운 진입/종료 애니메이션
 * - 뷰/생성/수정 모드 지원
 * - ESC 키로 닫기 지원
 */

interface EventModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 모드 */
  mode: EventModalMode;
  /** 이벤트 데이터 (view/edit 모드) */
  event?: CalendarEvent;
  /** 선택된 날짜 (create 모드) */
  selectedDate?: Date;
  /** 폼 제출 핸들러 */
  onSubmit?: (data: EventFormData) => void;
  /** 삭제 핸들러 */
  onDelete?: () => void;
  /** 수정 모드로 전환 핸들러 */
  onEdit?: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/* 모달 애니메이션 설정 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/* 모달 제목 설정 */
const modalTitles: Record<EventModalMode, string> = {
  view: '일정 상세',
  create: '새 일정 만들기',
  edit: '일정 수정',
};

export function EventModal({
  isOpen,
  onClose,
  mode,
  event,
  selectedDate,
  onSubmit,
  onDelete,
  onEdit,
  isLoading = false,
}: EventModalProps) {
  /* ESC 키 핸들러 */
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  /* 바디 스크롤 제어 */
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* 시간 포맷팅 헬퍼 */
  const formatEventTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 M월 d일 (E) HH:mm', { locale: ko });
    } catch {
      return '';
    }
  };

  const category = event?.category || 'other';
  const colors = categoryColors[category];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 오버레이 - 우주 테마 블러 효과 */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className={cn(
              "absolute inset-0",
              "bg-cosmic-dark/80 backdrop-blur-sm",
              "cursor-pointer"
            )}
          />

          {/* 모달 컨테이너 */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative w-full max-w-lg",
              "bg-gradient-to-br from-cosmic-dark via-cosmic-dark to-cosmic-blue/10",
              "border border-cosmic-blue/30 rounded-2xl",
              "shadow-cosmic-lg overflow-hidden",
              "max-h-[90vh] overflow-y-auto"
            )}
          >
            {/* 상단 글로우 효과 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cosmic-light/50 to-transparent" />

            {/* 헤더 */}
            <div className="relative flex items-center justify-between p-5 border-b border-cosmic-blue/20">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  "bg-cosmic-blue/20 border border-cosmic-blue/30"
                )}>
                  <Calendar className="w-5 h-5 text-cosmic-light" />
                </div>
                <h2 className="text-xl font-bold text-cosmic-white">
                  {modalTitles[mode]}
                </h2>
              </div>

              {/* 닫기 버튼 */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  "hover:bg-cosmic-blue/20 text-cosmic-gray hover:text-cosmic-white"
                )}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 본문 */}
            <div className="p-5">
              {/* 뷰 모드 */}
              {mode === 'view' && event && (
                <div className="space-y-5">
                  {/* 제목과 카테고리 */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-cosmic-white">
                      {event.title}
                    </h3>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
                      colors.bg, colors.text
                    )}>
                      {categoryLabels[category]}
                    </span>
                  </div>

                  {/* 설명 */}
                  {event.description && (
                    <p className="text-sm text-cosmic-gray leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {/* 상세 정보 */}
                  <div className="space-y-3 p-4 rounded-xl bg-cosmic-dark/50 border border-cosmic-blue/20">
                    {/* 시작 시간 */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-cosmic-light shrink-0" />
                      <div>
                        <p className="text-xs text-cosmic-gray mb-0.5">시작</p>
                        <p className="text-sm text-cosmic-white">
                          {formatEventTime(event.startTime)}
                        </p>
                      </div>
                    </div>

                    {/* 종료 시간 */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-cosmic-light shrink-0" />
                      <div>
                        <p className="text-xs text-cosmic-gray mb-0.5">종료</p>
                        <p className="text-sm text-cosmic-white">
                          {formatEventTime(event.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* 위치 */}
                    {event.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-cosmic-gold shrink-0" />
                        <div>
                          <p className="text-xs text-cosmic-gray mb-0.5">위치</p>
                          <p className="text-sm text-cosmic-white">{event.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex justify-end gap-3 pt-2">
                    {onDelete && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onDelete}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg",
                          "text-sm font-medium transition-all duration-200",
                          "bg-cosmic-red/10 border border-cosmic-red/30",
                          "text-cosmic-red hover:bg-cosmic-red/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </motion.button>
                    )}

                    {onEdit && (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(66, 112, 140, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEdit}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg",
                          "text-sm font-medium transition-all duration-200",
                          "bg-gradient-to-r from-cosmic-blue to-cosmic-light",
                          "text-white shadow-cosmic",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Edit2 className="w-4 h-4" />
                        수정
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* 생성/수정 모드 - 폼 표시 */}
              {(mode === 'create' || mode === 'edit') && onSubmit && (
                <EventForm
                  initialData={event}
                  selectedDate={selectedDate}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* 하단 글로우 효과 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cosmic-gold/30 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
