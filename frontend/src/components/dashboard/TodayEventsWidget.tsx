"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ArrowRight, Plus, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { eventApi } from "@/lib/api";
import type { CalendarEvent } from "@/types";

/**
 * TodayEventsWidget - 오늘의 일정 위젯
 *
 * 오늘 예정된 일정들을 시간순으로 보여주는 위젯 (실제 API 연동)
 * - eventApi.getMonthly → 오늘 날짜로 필터
 * - 시간순 정렬 (toSorted, React BP 7.12)
 * - 진행 중/지난 일정 표시
 * - max-h + overflow-y-auto (반응형 스크롤)
 */

// 카테고리별 색상 매핑 (정적)
const CATEGORY_COLORS: Record<string, string> = {
  work: "bg-sky-400",
  personal: "bg-amber-400",
  meeting: "bg-cyan-400",
  important: "bg-rose-400",
  other: "bg-slate-400",
};

// 시간 포맷 (HH:MM)
function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// 현재 진행 중인 일정인지 확인
function isCurrentEvent(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

// 일정이 지났는지 확인
function isPastEvent(end: string): boolean {
  return Date.now() > new Date(end).getTime();
}

// 오늘 날짜인지 확인
function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function TodayEventsWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const res = await eventApi.getMonthly(year, month);
      const allEvents = res.data.data ?? [];
      // 오늘 일정만 필터 + 시간순 정렬
      const todayEvents = allEvents
        .filter((e) => isToday(e.startTime))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setEvents(todayEvents);
    } catch {
      setError("일정을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                 bg-gradient-to-br from-cosmic-dark/90 to-cosmic-dark 
                 p-6 backdrop-blur-sm transition-all duration-300
                 hover:border-cosmic-blue/30 hover:shadow-lg hover:shadow-cosmic-blue/5"
    >
      {/* 상단 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg 
                          bg-gradient-to-br from-cosmic-blue/30 to-cosmic-blue/10">
            <Calendar className="h-5 w-5 text-cosmic-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-cosmic-white">오늘의 일정</h3>
            <p className="text-sm text-cosmic-gray">{formattedDate}</p>
          </div>
        </div>

        <Link
          href="/calendar"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm 
                     text-cosmic-light transition-all hover:bg-cosmic-blue/10"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">일정 추가</span>
        </Link>
      </div>

      {/* 일정 목록 — max-h + overflow-y-auto 반응형 스크롤 */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1 
                      scrollbar-thin scrollbar-track-cosmic-dark scrollbar-thumb-cosmic-blue/30">
        {loading ? (
          /* 로딩 스켈레톤 */
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-cosmic-blue/10 
                                     bg-cosmic-dark/50 p-3">
              <div className="mb-2 h-4 w-32 rounded bg-cosmic-blue/10" />
              <div className="h-3 w-24 rounded bg-cosmic-blue/10" />
            </div>
          ))
        ) : error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-cosmic-red/50" />
            <p className="text-sm text-cosmic-gray">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-2 flex items-center gap-1 text-xs text-cosmic-light hover:text-cosmic-blue"
            >
              <RefreshCw className="h-3 w-3" />
              재시도
            </button>
          </div>
        ) : events.length > 0 ? (
          events.map((event, index) => {
            const isCurrent = isCurrentEvent(event.startTime, event.endTime);
            const isPast = isPastEvent(event.endTime);
            const colorClass = CATEGORY_COLORS[event.category ?? "other"] ?? CATEGORY_COLORS.other;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex gap-4 rounded-lg border p-3 transition-all
                           ${isCurrent
                             ? "border-cosmic-gold/50 bg-cosmic-gold/10"
                             : "border-cosmic-blue/10 bg-cosmic-dark/50 hover:border-cosmic-blue/20"
                           }
                           ${isPast ? "opacity-50" : ""}`}
              >
                {/* 색상 인디케이터 */}
                <div className={`w-1 self-stretch rounded-full ${colorClass}`} />

                {/* 일정 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${isPast ? "text-cosmic-gray line-through" : "text-cosmic-white"}`}>
                    {event.title}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center rounded-full 
                                       bg-cosmic-gold/20 px-2 py-0.5 text-xs text-cosmic-gold">
                        진행 중
                      </span>
                    )}
                  </h4>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-cosmic-gray">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          /* 일정이 없을 때 */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="mb-3 h-12 w-12 text-cosmic-gray/50" />
            <p className="text-cosmic-gray">오늘 예정된 일정이 없습니다</p>
            <Link
              href="/calendar"
              className="mt-3 text-sm text-cosmic-light hover:text-cosmic-blue"
            >
              새 일정 추가하기
            </Link>
          </div>
        )}
      </div>

      {/* 더보기 링크 */}
      {!loading && !error && events.length > 0 && (
        <Link
          href="/calendar"
          className="mt-4 flex items-center justify-center gap-1 rounded-lg 
                     border border-cosmic-blue/20 py-2 text-sm text-cosmic-light 
                     transition-all hover:border-cosmic-blue/40 hover:bg-cosmic-blue/5"
        >
          <span>캘린더에서 모두 보기</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {/* 배경 장식 */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full 
                      bg-cosmic-blue/5 blur-3xl transition-all group-hover:bg-cosmic-blue/10" />
    </motion.div>
  );
}
