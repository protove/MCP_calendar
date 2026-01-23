"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
} from "lucide-react";

/**
 * QuickStatsWidget - 빠른 통계 개요 위젯
 * 
 * 이번 달의 주요 통계를 한눈에 보여주는 위젯
 * - 이번 달 일정 수
 * - 총 수입
 * - 총 지출
 * - 목표 달성률
 */

// 통계 데이터 타입 정의
interface StatItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
}

// Mock 데이터 - 실제 API 연동 시 교체
const mockStats: StatItem[] = [
  {
    id: "events",
    label: "이번 달 일정",
    value: "24",
    subValue: "개",
    icon: <Calendar className="h-5 w-5" />,
    trend: "up",
    trendValue: "+3",
    color: "cosmic-blue",
  },
  {
    id: "income",
    label: "이번 달 수입",
    value: "₩3,250,000",
    icon: <TrendingUp className="h-5 w-5" />,
    trend: "up",
    trendValue: "+12%",
    color: "cosmic-light",
  },
  {
    id: "expense",
    label: "이번 달 지출",
    value: "₩1,840,000",
    icon: <TrendingDown className="h-5 w-5" />,
    trend: "down",
    trendValue: "-5%",
    color: "cosmic-gold",
  },
  {
    id: "savings",
    label: "저축 목표 달성",
    value: "78%",
    icon: <Target className="h-5 w-5" />,
    trend: "up",
    trendValue: "+8%",
    color: "cosmic-light",
  },
];

export function QuickStatsWidget() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {mockStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                     bg-gradient-to-br from-cosmic-dark/80 to-cosmic-dark 
                     p-4 backdrop-blur-sm transition-all duration-300
                     hover:border-cosmic-blue/40 hover:shadow-lg hover:shadow-cosmic-blue/10"
        >
          {/* 배경 글로우 효과 */}
          <div
            className={`absolute -right-4 -top-4 h-16 w-16 rounded-full 
                        bg-${stat.color}/10 blur-xl transition-all duration-300 
                        group-hover:bg-${stat.color}/20`}
          />

          {/* 아이콘 */}
          <div
            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg 
                        bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10
                        text-${stat.color}`}
          >
            {stat.icon}
          </div>

          {/* 레이블 */}
          <p className="mb-1 text-sm text-cosmic-gray">{stat.label}</p>

          {/* 값 */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-cosmic-white">
              {stat.value}
            </span>
            {stat.subValue && (
              <span className="text-sm text-cosmic-gray">{stat.subValue}</span>
            )}
          </div>

          {/* 트렌드 표시 */}
          {stat.trend && stat.trendValue && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs
                          ${stat.trend === "up" ? "text-green-400" : ""}
                          ${stat.trend === "down" ? "text-cosmic-gold" : ""}
                          ${stat.trend === "neutral" ? "text-cosmic-gray" : ""}`}
            >
              {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
              {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
              <span>{stat.trendValue} 지난 달 대비</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
