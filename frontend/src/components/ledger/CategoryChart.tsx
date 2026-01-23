'use client';

import React, { memo, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ChartDataItem } from '@/types/ledger';

/**
 * 카테고리별 지출 차트 컴포넌트
 * 
 * Recharts를 Suspense로 감싸서 초기 로딩 성능 최적화
 * 도넛 차트로 카테고리별 지출 비율 시각화
 */

/* 차트 컴포넌트를 lazy로 로드 */
const LazyChart = lazy(() => import('./CategoryChartContent'));

interface CategoryChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
}

/* 범례 아이템 */
const LegendItem = memo(function LegendItem({
  item,
  delay,
}: {
  item: ChartDataItem;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-2"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: item.color }}
      />
      <span className="text-cosmic-white text-sm flex-1">{item.nameKo}</span>
      <span className="text-cosmic-gray text-sm">{item.percentage.toFixed(0)}%</span>
    </motion.div>
  );
});

/* 차트 스켈레톤 */
const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-center mb-6">
        <div className="w-40 h-40 rounded-full bg-cosmic-blue/20" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cosmic-blue/20" />
            <div className="flex-1 h-4 rounded bg-cosmic-blue/20" />
            <div className="w-10 h-4 rounded bg-cosmic-blue/20" />
          </div>
        ))}
      </div>
    </div>
  );
});

/* 빈 상태 */
const EmptyChart = memo(function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-20 h-20 rounded-full bg-cosmic-blue/10 flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-cosmic-gray"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      </div>
      <p className="text-cosmic-gray text-sm">지출 데이터가 없습니다</p>
    </div>
  );
});

export const CategoryChart = memo(function CategoryChart({
  data,
  isLoading = false,
}: CategoryChartProps) {
  /* 총 금액 계산 */
  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6">
        <h3 className="text-lg font-semibold text-cosmic-white mb-6">
          카테고리별 지출
        </h3>
        <ChartSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6">
        <h3 className="text-lg font-semibold text-cosmic-white mb-4">
          카테고리별 지출
        </h3>
        <EmptyChart />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-cosmic-dark/60 border border-cosmic-blue/20 p-6"
    >
      <h3 className="text-lg font-semibold text-cosmic-white mb-6">
        카테고리별 지출
      </h3>

      {/* 도넛 차트 - Suspense로 래핑 */}
      <div className="h-48 mb-6">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-32 h-32 rounded-full bg-cosmic-blue/20 animate-pulse" /></div>}>
          <LazyChart data={data} />
        </Suspense>
      </div>

      {/* 중앙 총액 표시 */}
      <div className="text-center mb-6">
        <p className="text-cosmic-gray text-sm mb-1">총 지출</p>
        <p className="text-2xl font-bold text-cosmic-white">
          ₩{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* 범례 */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <LegendItem key={item.name} item={item} delay={0.1 * index} />
        ))}
      </div>
    </motion.div>
  );
});

export default CategoryChart;
