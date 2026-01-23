"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * UpcomingEventsWidget - 다가오는 일정 위젯
 * 
 * 앞으로 7일간의 주요 일정을 보여주는 위젯
 * - 날짜별 그룹핑
 * - D-day 표시
 * - 중요 일정 하이라이트
 */

// 일정 타입 정의
interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location?: string;
  isImportant?: boolean;
  category: "work" | "personal" | "health" | "social";
}

// Mock 데이터 - 다가오는 일정
const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: "1",
    title: "분기 실적 발표",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    startTime: "10:00",
    endTime: "11:30",
    location: "본사 대회의실",
    isImportant: true,
    category: "work",
  },
  {
    id: "2",
    title: "치과 정기검진",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startTime: "14:00",
    endTime: "15:00",
    location: "서울 치과",
    category: "health",
  },
  {
    id: "3",
    title: "친구 생일 파티",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    startTime: "19:00",
    location: "이태원",
    isImportant: true,
    category: "social",
  },
  {
    id: "4",
    title: "프로젝트 마감",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    startTime: "18:00",
    isImportant: true,
    category: "work",
  },
  {
    id: "5",
    title: "헬스장 PT",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    startTime: "07:00",
    endTime: "08:00",
    location: "강남 헬스",
    category: "health",
  },
];

// 카테고리별 색상 매핑
const categoryColors: Record<UpcomingEvent["category"], string> = {
  work: "bg-cosmic-blue",
  personal: "bg-cosmic-light",
  health: "bg-green-500",
  social: "bg-cosmic-gold",
};

// D-day 계산 함수
function getDday(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  return `D-${diffDays}`;
}

// 날짜 포맷팅 함수
function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export function UpcomingEventsWidget() {
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

        <span className="rounded-full bg-cosmic-blue/20 px-2.5 py-1 text-xs text-cosmic-light">
          {mockUpcomingEvents.length}개
        </span>
      </div>

      {/* 일정 목록 */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin 
                      scrollbar-track-cosmic-dark scrollbar-thumb-cosmic-blue/30">
        {mockUpcomingEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`relative flex gap-3 rounded-lg border p-3 transition-all
                       ${event.isImportant 
                         ? "border-cosmic-gold/30 bg-cosmic-gold/5" 
                         : "border-cosmic-blue/10 bg-cosmic-dark/50 hover:border-cosmic-blue/20"
                       }`}
          >
            {/* D-day 뱃지 */}
            <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center 
                            rounded-lg bg-cosmic-dark/80 py-1.5">
              <span className={`text-sm font-bold 
                               ${getDday(event.date) === "오늘" ? "text-cosmic-gold" : ""}
                               ${getDday(event.date) === "내일" ? "text-cosmic-light" : "text-cosmic-white"}`}>
                {getDday(event.date)}
              </span>
              <span className="text-xs text-cosmic-gray">
                {formatDate(event.date).split(" ")[0]}
              </span>
            </div>

            {/* 일정 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {/* 카테고리 인디케이터 */}
                <div
                  className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${categoryColors[event.category]}`}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="flex items-center gap-1.5 font-medium text-cosmic-white truncate">
                    {event.title}
                    {event.isImportant && (
                      <Sparkles className="h-3.5 w-3.5 text-cosmic-gold flex-shrink-0" />
                    )}
                  </h4>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-cosmic-gray">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
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
        ))}
      </div>

      {/* 더보기 링크 */}
      <Link
        href="/calendar"
        className="mt-4 flex items-center justify-center gap-1 rounded-lg 
                   border border-cosmic-blue/20 py-2 text-sm text-cosmic-light 
                   transition-all hover:border-cosmic-blue/40 hover:bg-cosmic-blue/5"
      >
        <span>전체 일정 보기</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* 배경 장식 */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full 
                      bg-cosmic-light/5 blur-3xl transition-all group-hover:bg-cosmic-light/10" />
    </motion.div>
  );
}
