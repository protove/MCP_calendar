"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventContentArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { cn } from "@/lib/utils";
import { eventApi } from "@/lib/api";
import type { CalendarEvent, EventFormData, EventModalMode, EventCategory } from "@/types";
import { CalendarHeader, type CalendarViewType } from "./CalendarHeader";
import { MiniCalendar } from "./MiniCalendar";
import { EventModal } from "./EventModal";
import { EventCard, categoryColors } from "./EventCard";
import { format } from "date-fns";

/**
 * CalendarView 컴포넌트
 * 
 * 우주 테마가 적용된 메인 캘린더 뷰
 * - FullCalendar 기반 월간/주간/일간 뷰
 * - 드래그 앤 드롭 이벤트 이동
 * - 날짜 클릭으로 이벤트 생성
 * - 이벤트 클릭으로 상세 보기/수정
 * - 미니 캘린더 사이드바
 * - 우주 테마 커스텀 스타일링
 */

/* 카테고리별 FullCalendar 이벤트 색상 */
const getCategoryColor = (category: EventCategory) => {
  const colorMap: Record<EventCategory, { bg: string; border: string }> = {
    work: { bg: '#42708C', border: '#42708C' },
    personal: { bg: '#F2BF91', border: '#F2BF91' },
    meeting: { bg: '#80ADBF', border: '#80ADBF' },
    important: { bg: '#733C3C', border: '#733C3C' },
    other: { bg: '#9BADB8', border: '#9BADB8' },
  };
  return colorMap[category] || colorMap.other;
};

export function CalendarView() {
  /* FullCalendar 레퍼런스 */
  const calendarRef = useRef<FullCalendar>(null);
  
  /* 캘린더 컨테이너 레퍼런스 (ResizeObserver용) */
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  /* 상태 관리 */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  /* 모달 상태 */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<EventModalMode>('view');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  /* 현재 보이는 연/월 추적 (API 호출용) */
  const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(new Date().getMonth() + 1);

  /* ====== 백엔드 API에서 이벤트 조회 ====== */
  const fetchEvents = useCallback(async (year: number, month: number) => {
    try {
      const res = await eventApi.getMonthly(year, month);
      if (res.data.success && res.data.data) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('일정을 불러오지 못했습니다:', err);
    }
  }, []);

  /* 마운트 시 & 보이는 달 변경 시 이벤트 조회 */
  useEffect(() => {
    fetchEvents(visibleYear, visibleMonth);
  }, [visibleYear, visibleMonth, fetchEvents]);

  /* 채팅에서 일정 변경 시 자동 리프레시 */
  useEffect(() => {
    const handler = () => fetchEvents(visibleYear, visibleMonth);
    window.addEventListener('calendar-updated', handler);
    return () => window.removeEventListener('calendar-updated', handler);
  }, [visibleYear, visibleMonth, fetchEvents]);

  /* ResizeObserver - 컨테이너 크기 변경 시 FullCalendar 리사이즈 */
  useEffect(() => {
    const container = calendarContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // FullCalendar API를 통해 크기 업데이트
      const api = calendarRef.current?.getApi();
      if (api) {
        api.updateSize();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /* FullCalendar 이벤트 형식으로 변환 */
  const fullCalendarEvents = useMemo(() => {
    return events.map(event => {
      const colors = getCategoryColor(event.category || 'other');
      return {
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        allDay: event.allDay,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          ...event,
        },
      };
    });
  }, [events]);

  /* 캘린더 API 헬퍼 */
  const getCalendarApi = useCallback(() => {
    return calendarRef.current?.getApi();
  }, []);

  /* 이전 기간으로 이동 */
  const handlePrev = useCallback(() => {
    const api = getCalendarApi();
    if (api) {
      api.prev();
    }
  }, [getCalendarApi]);

  /* 다음 기간으로 이동 */
  const handleNext = useCallback(() => {
    const api = getCalendarApi();
    if (api) {
      api.next();
    }
  }, [getCalendarApi]);

  /* 오늘로 이동 */
  const handleToday = useCallback(() => {
    const api = getCalendarApi();
    if (api) {
      api.today();
    }
  }, [getCalendarApi]);

  /* 뷰 변경 */
  const handleViewChange = useCallback((view: CalendarViewType) => {
    const api = getCalendarApi();
    if (api) {
      api.changeView(view);
      setCurrentView(view);
    }
  }, [getCalendarApi]);

  /* 날짜 범위 변경 시 → API 재조회 */
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setCurrentDate(arg.view.currentStart);
    setCurrentView(arg.view.type as CalendarViewType);
    // 보이는 범위의 중간 날짜로 연/월 결정
    const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
    const y = mid.getFullYear();
    const m = mid.getMonth() + 1;
    if (y !== visibleYear || m !== visibleMonth) {
      setVisibleYear(y);
      setVisibleMonth(m);
    }
  }, [visibleYear, visibleMonth]);

  /* 날짜 클릭 - 새 이벤트 생성 */
  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.date);
    setSelectedEvent(undefined);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  /* 이벤트 클릭 - 상세 보기 */
  const handleEventClick = useCallback((arg: EventClickArg) => {
    const eventData = arg.event.extendedProps as CalendarEvent;
    setSelectedEvent({
      ...eventData,
      id: arg.event.id,
      title: arg.event.title,
      startTime: arg.event.startStr,
      endTime: arg.event.endStr || arg.event.startStr,
    });
    setModalMode('view');
    setModalOpen(true);
  }, []);

  /* 이벤트 드래그 앤 드롭 → API 업데이트 */
  const handleEventDrop = useCallback(async (arg: EventDropArg) => {
    const { event } = arg;
    try {
      await eventApi.update(event.id, {
        startTime: event.startStr,
        endTime: event.endStr || event.startStr,
      } as Partial<EventFormData>);
      // 로컬 state도 즉시 업데이트
      setEvents(prev => prev.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            startTime: event.startStr,
            endTime: event.endStr || event.startStr,
          };
        }
        return e;
      }));
    } catch (err) {
      console.error('일정 이동 실패:', err);
      arg.revert(); // 실패 시 되돌리기
    }
  }, []);

  /* 미니 캘린더 날짜 선택 */
  const handleMiniCalendarSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    const api = getCalendarApi();
    if (api) {
      api.gotoDate(date);
    }
  }, [getCalendarApi]);

  /* 새 일정 추가 버튼 */
  const handleAddEvent = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedEvent(undefined);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  /* 모달 닫기 */
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(undefined);
  }, []);

  /* 수정 모드로 전환 */
  const handleEditMode = useCallback(() => {
    setModalMode('edit');
  }, []);

  /* 이벤트 저장 (생성/수정) → 실제 API 호출 */
  const handleSubmit = useCallback(async (data: EventFormData) => {
    setIsLoading(true);
    try {
      if (modalMode === 'create') {
        const res = await eventApi.create(data);
        if (res.data.success && res.data.data) {
          setEvents(prev => [...prev, res.data.data as CalendarEvent]);
        }
      } else if (modalMode === 'edit' && selectedEvent) {
        const res = await eventApi.update(selectedEvent.id, data);
        if (res.data.success && res.data.data) {
          const updated = res.data.data as CalendarEvent;
          setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updated : e));
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('일정 저장 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modalMode, selectedEvent, handleCloseModal]);

  /* 이벤트 삭제 → 실제 API 호출 */
  const handleDelete = useCallback(async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      await eventApi.delete(selectedEvent.id);
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      handleCloseModal();
    } catch (err) {
      console.error('일정 삭제 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvent, handleCloseModal]);

  /* 커스텀 이벤트 렌더링 */
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const category = eventInfo.event.extendedProps.category as EventCategory || 'other';
    const colors = categoryColors[category];

    return (
      <div className={cn(
        "w-full h-full px-1.5 py-0.5 rounded overflow-hidden",
        "text-xs font-medium truncate",
        "transition-all duration-200",
        "hover:scale-[1.02]",
        colors.glow
      )}>
        <div className="flex items-center gap-1">
          <span className="truncate text-white">{eventInfo.event.title}</span>
          {eventInfo.timeText && (
            <span className="text-white/70 text-[10px] shrink-0">{eventInfo.timeText}</span>
          )}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 min-h-0">
      {/* 사이드바 - 미니 캘린더 */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden lg:block w-72 shrink-0"
      >
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={handleMiniCalendarSelect}
          events={events}
        />

        {/* 오늘의 이벤트 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={cn(
            "mt-4 p-4 rounded-xl",
            "bg-cosmic-dark/60 backdrop-blur-sm",
            "border border-cosmic-blue/20"
          )}
        >
          <h3 className="text-sm font-semibold text-cosmic-white mb-3">
            오늘의 일정
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {events
                .filter(e => {
                  const eventDate = new Date(e.startTime).toDateString();
                  return eventDate === new Date().toDateString();
                })
                .map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EventCard
                      event={event}
                      compact
                      onClick={() => {
                        setSelectedEvent(event);
                        setModalMode('view');
                        setModalOpen(true);
                      }}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
            {events.filter(e => {
              const eventDate = new Date(e.startTime).toDateString();
              return eventDate === new Date().toDateString();
            }).length === 0 && (
              <p className="text-sm text-cosmic-gray text-center py-4">
                오늘 예정된 일정이 없습니다
              </p>
            )}
          </div>
        </motion.div>
      </motion.aside>

      {/* 메인 캘린더 영역 */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-w-0 min-h-0"
      >
        {/* 커스텀 헤더 */}
        <CalendarHeader
          currentDate={currentDate}
          currentView={currentView}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onViewChange={handleViewChange}
          onAddEvent={handleAddEvent}
        />

        {/* FullCalendar 컨테이너 - 남은 공간 모두 채우기 */}
        <div 
          ref={calendarContainerRef}
          className={cn(
            "flex-1 min-h-0 rounded-xl overflow-hidden",
            "bg-cosmic-dark/40 backdrop-blur-sm",
            "border border-cosmic-blue/20",
            "cosmic-calendar" /* 커스텀 CSS 클래스 */
          )}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={false} /* 커스텀 헤더 사용 */
            initialView={currentView}
            locale="ko"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            weekends={true}
            events={fullCalendarEvents}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDrop={handleEventDrop}
            datesSet={handleDatesSet}
            height="100%"
            nowIndicator={true}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            allDayText="종일"
            buttonText={{
              today: '오늘',
              month: '월',
              week: '주',
              day: '일',
            }}
          />
        </div>
      </motion.main>

      {/* 이벤트 모달 */}
      <EventModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onEdit={handleEditMode}
        isLoading={isLoading}
      />

      {/* 로딩 오버레이 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[60]",
              "bg-cosmic-dark/50 backdrop-blur-sm",
              "flex items-center justify-center"
            )}
          >
            {/* 우주 테마 로딩 스피너 */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={cn(
                  "w-16 h-16 rounded-full",
                  "border-4 border-cosmic-blue/30",
                  "border-t-cosmic-light"
                )}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={cn(
                  "absolute inset-2 rounded-full",
                  "bg-cosmic-gold/20"
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
