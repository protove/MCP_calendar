'use client';

import React, { memo, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { MonthlyChartData } from '@/types/ledger';

/**
 * 월별 수입/지출 차트 컴포넌트
 * 
 * Recharts를 Suspense로 감싸서 초기 로딩 성능 최적화
 * 막대 그래프로 월별 수입/지출 추이 시각화
 */

/* 차트 컴포넌트를 lazy로 로드 */
const LazyChart = lazy(() => import('./MonthlyChartContent'));

interface MonthlyChartProps {
  data: MonthlyChartData[];
  isLoading?: boolean;
}

/* 차트 스켈레톤 */
const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="animate-pulse h-64 flex items-end gap-4 px-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-1 flex gap-1">
          <div
            className="flex-1 bg-cosmic-blue/20 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
          <div
            className="flex-1 bg-cosmic-blue/10 rounded-t"
            style={{ height: `${20 + Math.random() * 40}%` }}
          />
        </div>
      ))}
    </div>
  );
});

/* 빈 상태 */
const EmptyChart = memo(function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-full bg-cosmic-blue/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-cosmic-gray"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-cosmic-gray text-sm">차트 데이터가 없습니다</p>
    </div>
  );
});

/* 통계 요약 */
const ChartSummary = memo(function ChartSummary({
  data,
}: {
  data: MonthlyChartData[];
}) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
    const avgIncome = Math.round(totalIncome / data.length);
    const avgExpense = Math.round(totalExpense / data.length);

    return { totalIncome, totalExpense, avgIncome, avgExpense };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-cosmic-blue/10">
      <div className="text-center">
        <p className="text-cosmic-gray text-xs mb-1">평균 수입</p>
        <p className="text-cosmic-gold font-semibold">
          ₩{stats.avgIncome.toLocaleString()}
        </p>
      </div>
      <div className="text-center">
        <p className="text-cosmic-gray text-xs mb-1">평균 지출</p>
        <p className="text-red-400 font-semibold">
          ₩{stats.avgExpense.toLocaleString()}
        </p>
      </div>
    </div>
  );
});

export const MonthlyChart = memo(function MonthlyChart({
  data,
  isLoading = false,
}: MonthlyChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6">
        <h3 className="text-lg font-semibold text-cosmic-white mb-6">
          월별 수입/지출
        </h3>
        <ChartSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6">
        <h3 className="text-lg font-semibold text-cosmic-white mb-4">
          월별 수입/지출
        </h3>
        <EmptyChart />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6"
    >
      <h3 className="text-lg font-semibold text-cosmic-white mb-6">
        월별 수입/지출
      </h3>

      {/* 막대 차트 - Suspense로 래핑 */}
      <div className="h-64">
        <Suspense fallback={<ChartSkeleton />}>
          <LazyChart data={data} />
        </Suspense>
      </div>

      {/* 통계 요약 */}
      <ChartSummary data={data} />
    </motion.div>
  );
});

export default MonthlyChart;
