'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Sparkles } from 'lucide-react';
import { LedgerSummary } from '@/types/ledger';

/**
 * 요약 카드 컴포넌트
 * 
 * 총 수입, 총 지출, 잔액을 보여주는 요약 카드들
 * 우주 테마 그라데이션과 글로우 효과 적용
 */

interface SummaryCardsProps {
  summary: LedgerSummary;
  isLoading?: boolean;
}

/* 개별 카드 컴포넌트 - 메모이제이션으로 불필요한 리렌더링 방지 */
const SummaryCard = memo(function SummaryCard({
  title,
  amount,
  icon: Icon,
  trend,
  trendValue,
  colorClass,
  glowColor,
  delay = 0,
  isLoading = false,
}: {
  title: string;
  amount: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: number;
  colorClass: string;
  glowColor: string;
  delay?: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-cosmic-dark/80 border border-cosmic-blue/20 p-6">
        {/* 스켈레톤 로딩 */}
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cosmic-blue/20" />
            <div className="w-20 h-4 rounded bg-cosmic-blue/20" />
          </div>
          <div className="w-32 h-8 rounded bg-cosmic-blue/20" />
          <div className="w-16 h-3 rounded bg-cosmic-blue/20" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* 배경 글로우 효과 */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
        style={{ background: glowColor }}
      />

      {/* 카드 본체 */}
      <div className="relative overflow-hidden rounded-2xl bg-cosmic-dark/80 border border-cosmic-blue/20 p-6 backdrop-blur-sm hover:border-cosmic-blue/40 transition-all duration-300">
        {/* 별 장식 */}
        <div className="absolute top-2 right-2 opacity-30">
          <Sparkles className="w-4 h-4 text-cosmic-gold animate-twinkle" />
        </div>

        {/* 아이콘과 타이틀 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-cosmic-gray text-sm font-medium">{title}</span>
        </div>

        {/* 금액 */}
        <div className="mb-2">
          <span className="text-2xl md:text-3xl font-bold text-cosmic-white">
            ₩{amount.toLocaleString()}
          </span>
        </div>

        {/* 트렌드 표시 (선택적) */}
        {trend && trendValue !== undefined && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-cosmic-gold" />
            ) : (
              <TrendingDown className="w-3 h-3 text-cosmic-red" />
            )}
            <span
              className={`text-xs ${
                trend === 'up' ? 'text-cosmic-gold' : 'text-cosmic-red'
              }`}
            >
              {trendValue}% 전월 대비
            </span>
          </div>
        )}

        {/* 장식용 원형 그라데이션 */}
        <div
          className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10`}
          style={{ background: glowColor }}
        />
      </div>
    </motion.div>
  );
});

/* 메인 요약 카드 컴포넌트 */
export const SummaryCards = memo(function SummaryCards({
  summary,
  isLoading = false,
}: SummaryCardsProps) {
  const { totalIncome, totalExpense, balance } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* 총 수입 카드 */}
      <SummaryCard
        title="총 수입"
        amount={totalIncome}
        icon={TrendingUp}
        colorClass="bg-cosmic-gold/20 text-cosmic-gold"
        glowColor="rgba(242, 191, 145, 0.2)"
        delay={0}
        isLoading={isLoading}
      />

      {/* 총 지출 카드 */}
      <SummaryCard
        title="총 지출"
        amount={totalExpense}
        icon={TrendingDown}
        colorClass="bg-cosmic-red/20 text-red-400"
        glowColor="rgba(115, 60, 60, 0.2)"
        delay={0.1}
        isLoading={isLoading}
      />

      {/* 잔액 카드 */}
      <SummaryCard
        title="잔액"
        amount={balance}
        icon={Wallet}
        colorClass="bg-cosmic-blue/20 text-cosmic-light"
        glowColor="rgba(128, 173, 191, 0.2)"
        delay={0.2}
        isLoading={isLoading}
      />
    </div>
  );
});

export default SummaryCards;
