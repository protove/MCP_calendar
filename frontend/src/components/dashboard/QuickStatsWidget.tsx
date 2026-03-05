"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { eventApi, transactionApi } from "@/lib/api";

/**
 * QuickStatsWidget - 빠른 통계 개요 위젯
 *
 * 이번 달의 주요 통계를 한눈에 보여주는 위젯
 * - 이번 달 일정 수 (eventApi.getMonthly)
 * - 총 수입 (transactionApi.getSummary)
 * - 총 지출 (transactionApi.getSummary)
 * - 저축률 (수입-지출 / 수입)
 *
 * React Best Practices:
 * - Promise.all for independent operations (1.4)
 * - Derive state during rendering (5.1)
 * - Early return pattern (7.8)
 * - Static Tailwind classes instead of dynamic interpolation
 */

// 통계 데이터 타입 정의
interface StatsData {
  eventCount: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

// 금액 포맷팅 (모듈 레벨 호이스트)
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `₩${(amount / 10_000).toFixed(0)}만`;
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

// 정적 색상 매핑 (동적 Tailwind 클래스 대신 정적 매핑 사용)
const STAT_STYLES = {
  events: {
    glow: "bg-sky-500/10 group-hover:bg-sky-500/20",
    iconBg: "from-sky-500/20 to-sky-500/10",
    iconText: "text-sky-400",
  },
  income: {
    glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    iconBg: "from-emerald-500/20 to-emerald-500/10",
    iconText: "text-emerald-400",
  },
  expense: {
    glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    iconBg: "from-amber-500/20 to-amber-500/10",
    iconText: "text-amber-400",
  },
  savings: {
    glow: "bg-violet-500/10 group-hover:bg-violet-500/20",
    iconBg: "from-violet-500/20 to-violet-500/10",
    iconText: "text-violet-400",
  },
} as const;

export function QuickStatsWidget() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      // Promise.all for independent operations (React BP 1.4)
      const [eventsRes, summaryRes] = await Promise.all([
        eventApi.getMonthly(year, month),
        transactionApi.getSummary(year, month),
      ]);

      const eventCount = eventsRes.data.data?.length ?? 0;
      const summary = summaryRes.data.data;

      setStats({
        eventCount,
        totalIncome: summary?.totalIncome ?? 0,
        totalExpense: summary?.totalExpense ?? 0,
        transactionCount: summary?.transactionCount ?? 0,
      });
    } catch {
      setError("통계 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-cosmic-blue/20 
                       bg-cosmic-dark/80 p-4"
          >
            <div className="mb-3 h-10 w-10 rounded-lg bg-cosmic-blue/10" />
            <div className="mb-2 h-3 w-16 rounded bg-cosmic-blue/10" />
            <div className="h-6 w-24 rounded bg-cosmic-blue/10" />
          </div>
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-cosmic-red/20 
                      bg-cosmic-dark/80 px-4 py-6">
        <AlertCircle className="mr-2 h-5 w-5 text-cosmic-red/60" />
        <span className="text-sm text-cosmic-gray">{error}</span>
        <button
          onClick={fetchStats}
          className="ml-3 flex items-center gap-1 rounded-lg border border-cosmic-blue/30 
                     bg-cosmic-blue/10 px-3 py-1.5 text-xs text-cosmic-light 
                     hover:bg-cosmic-blue/20 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          재시도
        </button>
      </div>
    );
  }

  // 저축률 계산 (derived state, React BP 5.1)
  const savingsRate =
    stats.totalIncome > 0
      ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
      : 0;

  const statItems = [
    {
      id: "events" as const,
      label: "이번 달 일정",
      value: `${stats.eventCount}`,
      subValue: "개",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "income" as const,
      label: "이번 달 수입",
      value: formatCurrency(stats.totalIncome),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "expense" as const,
      label: "이번 달 지출",
      value: formatCurrency(stats.totalExpense),
      icon: <TrendingDown className="h-5 w-5" />,
    },
    {
      id: "savings" as const,
      label: "저축률",
      value: `${savingsRate}%`,
      icon: <Target className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statItems.map((stat, index) => {
        const style = STAT_STYLES[stat.id];
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                       bg-gradient-to-br from-cosmic-dark/80 to-cosmic-dark 
                       p-3 sm:p-4 backdrop-blur-sm transition-all duration-300
                       hover:border-cosmic-blue/40 hover:shadow-lg hover:shadow-cosmic-blue/10"
          >
            {/* 배경 글로우 효과 - 정적 클래스 사용 */}
            <div
              className={`absolute -right-4 -top-4 h-16 w-16 rounded-full 
                          ${style.glow} blur-xl transition-all duration-300`}
            />

            {/* 아이콘 */}
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg 
                          bg-gradient-to-br ${style.iconBg} ${style.iconText}`}
            >
              {stat.icon}
            </div>

            {/* 레이블 */}
            <p className="mb-1 text-xs sm:text-sm text-cosmic-gray">{stat.label}</p>

            {/* 값 */}
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-cosmic-white truncate">
                {stat.value}
              </span>
              {stat.subValue && (
                <span className="text-sm text-cosmic-gray">{stat.subValue}</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
