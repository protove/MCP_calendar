"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, ArrowRight, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { eventApi } from "@/lib/api";
import type { CalendarEvent } from "@/types";

/**
 * UpcomingEventsWidget - 다가오는 일정 위젯
 *
 * 앞으로 7일간의 주요 일정을 보여주는 위젯 (실제 API 연동)
 * - eventApi.getMonthly → 미래 7일 필터
 * - D-day 표시
 * - 중요(important) 일정 하이라이트
 *
 * React Best Practices:
 * - toSorted for immutability (7.12)
 * - Derive state during rendering (5.1)
 * - Early return (7.8)
 */

// 카테고리별 색상 (정적 매핑)
const CATEGORY_DOT_COLORS: Record<string, string> = {
  work: "bg-cosmic-blue",
  personal: "bg-cosmic-light",
  meeting: "bg-cyan-500",
  important: "bg-cosmic-gold",
  other: "bg-slate-400",
};

// D-day 계산 함수
function getDday(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays < 0) return "지남";
  return `D-${diffDays}`;
}

// 날짜 포맷팅 함수
function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

// 시간 포맷 (HH:MM)
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function UpcomingEventsWidget() {
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
      // 이번 달과 다음 달 모두 가져오기 (7일 범위가 월 경계를 넘을 수 있음)
      const requests = [eventApi.getMonthly(year, month)];
      // 월이 바뀔 수 있으면 다음 달도 fetch
      const daysInMonth = new Date(year, month, 0).getDate();
      if (now.getDate() + 7 > daysInMonth) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        requests.push(eventApi.getMonthly(nextYear, nextMonth));
      }

      const results = await Promise.all(requests);
      // ID 기반 중복 제거 (월 경계 fetch 시 양쪽에 포함되는 이벤트 방지)
      const allEvents = [
        ...new Map(
          results.flatMap((r) => r.data.data ?? []).map((e) => [e.id, e])
        ).values(),
      ];

      // 오늘 ~ 7일 후까지만 필터 + 시간순 정렬
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekLater = new Date(todayStart);
      weekLater.setDate(weekLater.getDate() + 7);
      weekLater.setHours(23, 59, 59, 999);

      const upcoming = allEvents
        .filter((e) => {
          const start = new Date(e.startTime).getTime();
          return start >= todayStart.getTime() && start <= weekLater.getTime();
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      setEvents(upcoming);
    } catch {
      setError("일정을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                 bg-gradient-to-br from-cosmic-dark/90 to-cosmic-dark 
                 p-6 backdrop-blur-sm transition-all duration-300
                 hover:border-cosmic-blue/30 hover:shadow-lg hover:shadow-cosmic-blue/5"
    >
      {/* 상단 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg 
                          bg-gradient-to-br from-cosmic-light/30 to-cosmic-light/10">
            <CalendarDays className="h-5 w-5 text-cosmic-light" />
          </div>
          <div>
            <h3 className="font-semibold text-cosmic-white">다가오는 일정</h3>
            <p className="text-sm text-cosmic-gray">앞으로 7일</p>
          </div>
        </div>

        {!loading && !error && (
          <span className="rounded-full bg-cosmic-blue/20 px-2.5 py-1 text-xs text-cosmic-light">
            {events.length}개
          </span>
        )}
      </div>

      {/* 일정 목록 */}
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin 
                      scrollbar-track-cosmic-dark scrollbar-thumb-cosmic-blue/30">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-cosmic-blue/10 
                                     bg-cosmic-dark/50 p-3 flex gap-3">
              <div className="h-10 w-14 rounded-lg bg-cosmic-blue/10" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-32 rounded bg-cosmic-blue/10" />
                <div className="h-3 w-24 rounded bg-cosmic-blue/10" />
              </div>
            </div>
          ))
        ) : error ? (
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
            const dday = getDday(event.startTime);
            const isImportant = event.category === "important";
            const dotColor = CATEGORY_DOT_COLORS[event.category ?? "other"] ?? CATEGORY_DOT_COLORS.other;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`relative flex gap-3 rounded-lg border p-3 transition-all
                           ${isImportant
                             ? "border-cosmic-gold/30 bg-cosmic-gold/5"
                             : "border-cosmic-blue/10 bg-cosmic-dark/50 hover:border-cosmic-blue/20"
                           }`}
              >
                {/* D-day 뱃지 */}
                <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center 
                                rounded-lg bg-cosmic-dark/80 py-1.5">
                  <span className={`text-sm font-bold ${dday === "오늘" ? "text-cosmic-gold" : dday === "내일" ? "text-cosmic-light" : "text-cosmic-white"}`}>
                    {dday}
                  </span>
                  <span className="text-xs text-cosmic-gray">
                    {formatShortDate(event.startTime)}
                  </span>
                </div>

                {/* 일정 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="flex items-center gap-1.5 font-medium text-cosmic-white truncate">
                        {event.title}
                        {isImportant && (
                          <Sparkles className="h-3.5 w-3.5 text-cosmic-gold flex-shrink-0" />
                        )}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-cosmic-gray">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="mb-3 h-12 w-12 text-cosmic-gray/50" />
            <p className="text-cosmic-gray">7일 내 예정된 일정이 없습니다</p>
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
          <span>전체 일정 보기</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {/* 배경 장식 */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full 
                      bg-cosmic-light/5 blur-3xl transition-all group-hover:bg-cosmic-light/10" />
    </motion.div>
  );
}
