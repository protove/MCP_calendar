"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Tag,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { EventFormData, EventCategory, CalendarEvent } from "@/types";
import { categoryColors, categoryLabels } from "./EventCard";

/**
 * EventForm 컴포넌트
 * 
 * 이벤트 생성/수정을 위한 폼
 * - 제목, 설명, 위치 입력
 * - 시작/종료 시간 선택
 * - 카테고리 선택
 * - 종일 이벤트 토글
 * - 폼 유효성 검사
 */

interface EventFormProps {
  /** 초기 폼 데이터 (수정 시) */
  initialData?: Partial<CalendarEvent>;
  /** 선택된 날짜 (새 이벤트 생성 시) */
  selectedDate?: Date;
  /** 폼 제출 핸들러 */
  onSubmit: (data: EventFormData) => void;
  /** 취소 핸들러 */
  onCancel: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/* 카테고리 목록 */
const categories: EventCategory[] = ['work', 'personal', 'meeting', 'important', 'other'];

/* 초기 폼 상태 */
const getInitialFormData = (initialData?: Partial<CalendarEvent>, selectedDate?: Date): EventFormData => {
  const now = selectedDate || new Date();
  const startTime = initialData?.startTime 
    ? format(new Date(initialData.startTime), "yyyy-MM-dd'T'HH:mm")
    : format(now, "yyyy-MM-dd'T'HH:00");
  
  const endTime = initialData?.endTime
    ? format(new Date(initialData.endTime), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(now.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:00");

  return {
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    startTime,
    endTime,
    category: initialData?.category || 'other',
    allDay: initialData?.allDay || false,
  };
};

export function EventForm({
  initialData,
  selectedDate,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) {
  /* 폼 상태 */
  const [formData, setFormData] = useState<EventFormData>(() => 
    getInitialFormData(initialData, selectedDate)
  );

  /* 폼 에러 상태 */
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  /* 초기 데이터 변경 시 폼 업데이트 */
  useEffect(() => {
    setFormData(getInitialFormData(initialData, selectedDate));
  }, [initialData, selectedDate]);

  /* 입력 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      // allDay 토글 시 시간 정보 보정
      if (name === 'allDay' && newValue === true) {
        updated.startTime = prev.startTime.split('T')[0] + 'T00:00';
        updated.endTime = prev.endTime.split('T')[0] + 'T23:59';
      }
      return updated;
    });
    
    // 에러 클리어
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /* 카테고리 선택 핸들러 */
  const handleCategoryChange = (category: EventCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };

  /* 폼 유효성 검사 */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요';
    }

    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요';
    }

    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        newErrors.endTime = '종료 시간은 시작 시간 이후여야 합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* 폼 제출 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // 백엔드 포맷 (yyyy-MM-dd'T'HH:mm:ss) 맞추기
      const normalized = { ...formData };
      if (formData.allDay) {
        // 종일 이벤트: date → datetime 변환
        const startDate = formData.startTime.split('T')[0];
        const endDate = formData.endTime.split('T')[0];
        normalized.startTime = `${startDate}T00:00:00`;
        normalized.endTime = `${endDate}T23:59:59`;
      } else {
        // 일반 이벤트: 초(:ss) 누락 시 보정
        if (normalized.startTime && !normalized.startTime.match(/\d{2}:\d{2}:\d{2}$/)) {
          normalized.startTime = `${normalized.startTime}:00`;
        }
        if (normalized.endTime && !normalized.endTime.match(/\d{2}:\d{2}:\d{2}$/)) {
          normalized.endTime = `${normalized.endTime}:00`;
        }
      }
      onSubmit(normalized);
    }
  };

  /* 공통 입력 필드 스타일 */
  const inputClassName = cn(
    "w-full px-4 py-2.5 rounded-lg transition-all duration-200",
    "bg-cosmic-dark/60 border border-cosmic-blue/30",
    "text-cosmic-white placeholder-cosmic-gray/50",
    "focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50 focus:border-cosmic-blue",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  const labelClassName = "flex items-center gap-2 text-sm font-medium text-cosmic-gray mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 제목 입력 */}
      <div>
        <label className={labelClassName}>
          <FileText className="w-4 h-4 text-cosmic-light" />
          제목 *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="이벤트 제목을 입력하세요"
          disabled={isLoading}
          className={cn(inputClassName, errors.title && "border-cosmic-red/50 focus:ring-cosmic-red/50")}
        />
        {errors.title && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1 text-xs text-cosmic-red"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.title}
          </motion.p>
        )}
      </div>

      {/* 설명 입력 */}
      <div>
        <label className={labelClassName}>
          <FileText className="w-4 h-4 text-cosmic-light" />
          설명
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="이벤트 설명을 입력하세요 (선택)"
          rows={3}
          disabled={isLoading}
          className={cn(inputClassName, "resize-none")}
        />
      </div>

      {/* 위치 입력 */}
      <div>
        <label className={labelClassName}>
          <MapPin className="w-4 h-4 text-cosmic-gold" />
          위치
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="위치를 입력하세요 (선택)"
          disabled={isLoading}
          className={inputClassName}
        />
      </div>

      {/* 종일 이벤트 토글 */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="allDay"
            checked={formData.allDay}
            onChange={handleChange}
            disabled={isLoading}
            className="sr-only peer"
          />
          <div className={cn(
            "w-11 h-6 rounded-full transition-colors duration-200",
            "bg-cosmic-dark border border-cosmic-blue/30",
            "peer-checked:bg-cosmic-blue",
            "peer-focus:ring-2 peer-focus:ring-cosmic-blue/50",
            "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
            "after:w-5 after:h-5 after:rounded-full after:transition-transform",
            "after:bg-cosmic-white",
            "peer-checked:after:translate-x-5"
          )} />
        </label>
        <span className="text-sm text-cosmic-gray">종일 이벤트</span>
      </div>

      {/* 시간 선택 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 시작 시간 */}
        <div>
          <label className={labelClassName}>
            <Clock className="w-4 h-4 text-cosmic-light" />
            시작 *
          </label>
          <input
            type={formData.allDay ? "date" : "datetime-local"}
            name="startTime"
            value={formData.allDay ? formData.startTime.split('T')[0] : formData.startTime}
            onChange={handleChange}
            disabled={isLoading}
            className={cn(inputClassName, errors.startTime && "border-cosmic-red/50")}
          />
          {errors.startTime && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 mt-1 text-xs text-cosmic-red"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.startTime}
            </motion.p>
          )}
        </div>

        {/* 종료 시간 */}
        <div>
          <label className={labelClassName}>
            <Calendar className="w-4 h-4 text-cosmic-light" />
            종료 *
          </label>
          <input
            type={formData.allDay ? "date" : "datetime-local"}
            name="endTime"
            value={formData.allDay ? formData.endTime.split('T')[0] : formData.endTime}
            onChange={handleChange}
            disabled={isLoading}
            className={cn(inputClassName, errors.endTime && "border-cosmic-red/50")}
          />
          {errors.endTime && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 mt-1 text-xs text-cosmic-red"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.endTime}
            </motion.p>
          )}
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className={labelClassName}>
          <Tag className="w-4 h-4 text-cosmic-gold" />
          카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const colors = categoryColors[category];
            const isSelected = formData.category === category;

            return (
              <motion.button
                key={category}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category)}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "border",
                  isSelected
                    ? [colors.bg, colors.border, colors.text]
                    : "border-cosmic-blue/30 text-cosmic-gray hover:border-cosmic-blue/50 hover:text-cosmic-white"
                )}
              >
                {categoryLabels[category]}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-cosmic-blue/20">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "bg-cosmic-dark/60 border border-cosmic-blue/30",
            "text-cosmic-gray hover:text-cosmic-white hover:border-cosmic-blue/50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          취소
        </motion.button>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(66, 112, 140, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "bg-gradient-to-r from-cosmic-blue to-cosmic-light",
            "text-white shadow-cosmic",
            "hover:shadow-cosmic-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </motion.button>
      </div>
    </form>
  );
}
