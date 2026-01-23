"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

/**
 * TodayEventsWidget - 오늘의 일정 위젯
 * 
 * 오늘 예정된 일정들을 시간순으로 보여주는 위젯
 * - 일정 제목, 시간, 장소 표시
 * - 일정이 없을 경우 빈 상태 표시
 * - 캘린더 페이지로 빠른 이동
 */

// 일정 타입 정의
interface TodayEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  color: string;
}

// Mock 데이터 - 오늘의 일정
const mockTodayEvents: TodayEvent[] = [
  {
    id: "1",
    title: "팀 스탠드업 미팅",
    startTime: "09:00",
    endTime: "09:30",
    location: "회의실 A",
    color: "cosmic-blue",
  },
  {
    id: "2",
    title: "프로젝트 기획 회의",
    startTime: "11:00",
    endTime: "12:00",
    location: "Zoom",
    color: "cosmic-gold",
  },
  {
    id: "3",
    title: "점심 약속",
    startTime: "12:30",
    endTime: "13:30",
    location: "강남역 근처",
    color: "cosmic-light",
  },
  {
    id: "4",
    title: "코드 리뷰",
    startTime: "15:00",
    endTime: "16:00",
    color: "cosmic-blue",
  },
  {
    id: "5",
    title: "운동",
    startTime: "19:00",
    endTime: "20:30",
    location: "헬스장",
    color: "cosmic-gold",
  },
];

// 현재 진행 중인 일정인지 확인
function isCurrentEvent(startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
}

// 일정이 지났는지 확인
function isPastEvent(endTime: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [endHour, endMinute] = endTime.split(":").map(Number);
  const endTimeInMinutes = endHour * 60 + endMinute;

  return currentTimeInMinutes > endTimeInMinutes;
}

export function TodayEventsWidget() {
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

        {/* 캘린더 페이지 링크 */}
        <Link
          href="/calendar"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm 
                     text-cosmic-light transition-all hover:bg-cosmic-blue/10"
        >
          <Plus className="h-4 w-4" />
          <span>일정 추가</span>
        </Link>
      </div>

      {/* 일정 목록 */}
      <div className="space-y-3">
        {mockTodayEvents.length > 0 ? (
          mockTodayEvents.map((event, index) => {
            const isCurrent = isCurrentEvent(event.startTime, event.endTime);
            const isPast = isPastEvent(event.endTime);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex gap-4 rounded-lg border p-3 transition-all
                           ${isCurrent 
                             ? "border-cosmic-gold/50 bg-cosmic-gold/10" 
                             : "border-cosmic-blue/10 bg-cosmic-dark/50 hover:border-cosmic-blue/20"
                           }
                           ${isPast ? "opacity-50" : ""}`}
              >
                {/* 색상 인디케이터 */}
                <div
                  className={`w-1 self-stretch rounded-full bg-${event.color}`}
                />

                {/* 일정 정보 */}
                <div className="flex-1">
                  <h4 className={`font-medium ${isPast ? "text-cosmic-gray line-through" : "text-cosmic-white"}`}>
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
                      <Clock className="h-3.5 w-3.5" />
                      {event.startTime} - {event.endTime}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
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
      {mockTodayEvents.length > 0 && (
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
