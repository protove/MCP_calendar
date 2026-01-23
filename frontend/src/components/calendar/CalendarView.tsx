"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg, EventClickArg, EventDropArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventContentArg } from "@fullcalendar/core";
import { cn } from "@/lib/utils";
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

/* 초기 목업 데이터 */
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    userId: "user1",
    title: "팀 미팅",
    description: "주간 정기 팀 미팅입니다.",
    location: "회의실 A",
    startTime: new Date().toISOString().split("T")[0] + "T10:00:00",
    endTime: new Date().toISOString().split("T")[0] + "T11:00:00",
    category: "meeting",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user1",
    title: "프로젝트 마감",
    description: "MCP Calendar 프로젝트 1차 마감일",
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0] + "T00:00:00",
    endTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0] + "T23:59:59",
    category: "important",
    allDay: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "user1",
    title: "개인 운동",
    description: "저녁 헬스장",
    location: "피트니스 센터",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0] + "T18:00:00",
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0] + "T19:30:00",
    category: "personal",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    userId: "user1",
    title: "코드 리뷰",
    description: "프론트엔드 코드 리뷰",
    startTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0] + "T14:00:00",
    endTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0] + "T15:00:00",
    category: "work",
    createdAt: new Date().toISOString(),
  },
];

export function CalendarView() {
  /* FullCalendar 레퍼런스 */
  const calendarRef = useRef<FullCalendar>(null);
  
  /* 캘린더 컨테이너 레퍼런스 (ResizeObserver용) */
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  /* 상태 관리 */
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  /* 모달 상태 */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<EventModalMode>('view');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

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

  /* 날짜 범위 변경 시 */
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setCurrentDate(arg.view.currentStart);
    setCurrentView(arg.view.type as CalendarViewType);
  }, []);

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

  /* 이벤트 드래그 앤 드롭 */
  const handleEventDrop = useCallback((arg: EventDropArg) => {
    const { event } = arg;
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

  /* 이벤트 저장 (생성/수정) */
  const handleSubmit = useCallback((data: EventFormData) => {
    setIsLoading(true);

    // 시뮬레이션된 API 호출
    setTimeout(() => {
      if (modalMode === 'create') {
        // 새 이벤트 생성
        const newEvent: CalendarEvent = {
          id: `event-${Date.now()}`,
          userId: 'user1',
          title: data.title,
          description: data.description,
          location: data.location,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          allDay: data.allDay,
          createdAt: new Date().toISOString(),
        };
        setEvents(prev => [...prev, newEvent]);
      } else if (modalMode === 'edit' && selectedEvent) {
        // 이벤트 수정
        setEvents(prev => prev.map(e => {
          if (e.id === selectedEvent.id) {
            return {
              ...e,
              title: data.title,
              description: data.description,
              location: data.location,
              startTime: data.startTime,
              endTime: data.endTime,
              category: data.category,
              allDay: data.allDay,
            };
          }
          return e;
        }));
      }

      setIsLoading(false);
      handleCloseModal();
    }, 500);
  }, [modalMode, selectedEvent, handleCloseModal]);

  /* 이벤트 삭제 */
  const handleDelete = useCallback(() => {
    if (!selectedEvent) return;

    setIsLoading(true);

    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setIsLoading(false);
      handleCloseModal();
    }, 500);
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
