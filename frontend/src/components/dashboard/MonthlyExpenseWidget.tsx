"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { transactionApi } from "@/lib/api";
import type { TransactionResponse } from "@/types/ledger";
import { CATEGORY_INFO, type TransactionCategory } from "@/types/ledger";

/**
 * MonthlyExpenseWidget - 월별 지출 요약 위젯
 *
 * 이번 달 지출을 카테고리별로 시각화 (실제 API 연동)
 * - transactionApi.getMonthly → 카테고리별 집계
 * - 도넛 차트 + 카테고리 목록
 * - 모바일: flex-col 스택 / 데스크탑: flex-row 가로 배치
 *
 * React Best Practices:
 * - useMemo for expensive computation (category aggregation)
 * - Derive state during rendering (5.1)
 * - toSorted for immutability (7.12)
 * - Combine array iterations (7.6)
 */

// 카테고리별 차트 색상
const CHART_COLORS: Record<string, string> = {
  food: "#F97316",
  transport: "#3B82F6",
  shopping: "#EC4899",
  fixed: "#9BADB8",
  leisure: "#A855F7",
  salary: "#F2BF91",
  sideIncome: "#FBBF24",
  other: "#6B7280",
};

interface CategoryExpense {
  name: string;
  nameKo: string;
  value: number;
  color: string;
}

// 금액 포맷팅 (모듈 레벨)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

// 커스텀 툴팁 컴포넌트
function CustomTooltip({ active, payload, totalExpense }: { active?: boolean; payload?: Array<{ payload: CategoryExpense }>; totalExpense: number }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const percentage = totalExpense > 0 ? ((data.value / totalExpense) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-cosmic-blue/30 bg-cosmic-dark/95 
                    px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
      <p className="font-medium text-cosmic-white">{data.nameKo}</p>
      <p className="text-cosmic-gold">{formatCurrency(data.value)}</p>
      <p className="text-cosmic-gray">{percentage}%</p>
    </div>
  );
}

export function MonthlyExpenseWidget() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const res = await transactionApi.getMonthly(year, month);
      setTransactions(res.data.data ?? []);
    } catch {
      setError("지출 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 카테고리별 집계 (useMemo — 반복 연산 최적화, React BP 7.6)
  const { categoryData, totalExpense } = useMemo(() => {
    const categoryMap = new Map<string, number>();

    // 지출만 집계 (한 번의 루프로 합산, React BP 7.6)
    for (const tx of transactions) {
      if (!tx.isIncome) {
        const cat = tx.category;
        categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + tx.amount);
      }
    }

    const data: CategoryExpense[] = [];
    let total = 0;
    for (const [cat, amount] of categoryMap) {
      total += amount;
      const info = CATEGORY_INFO[cat];
      data.push({
        name: cat,
        nameKo: info?.labelKo ?? cat,
        value: amount,
        color: CHART_COLORS[cat] ?? CHART_COLORS.other,
      });
    }

    // 금액 순 내림차순 정렬
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return { categoryData: sorted, totalExpense: total };
  }, [transactions]);

  const currentMonth = new Date().toLocaleDateString("ko-KR", { month: "long" });
  // 상위 4개만 표시 (derived state, React BP 5.1)
  const topCategories = categoryData.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                 bg-gradient-to-br from-cosmic-dark/90 to-cosmic-dark 
                 p-6 backdrop-blur-sm transition-all duration-300
                 hover:border-cosmic-blue/30 hover:shadow-lg hover:shadow-cosmic-blue/5"
    >
      {/* 상단 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg 
                          bg-gradient-to-br from-cosmic-gold/30 to-cosmic-gold/10">
            <Wallet className="h-5 w-5 text-cosmic-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-cosmic-white">{currentMonth} 지출</h3>
            <p className="text-sm text-cosmic-gray">카테고리별 지출 현황</p>
          </div>
        </div>
      </div>

      {loading ? (
        /* 로딩 스켈레톤 */
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="h-36 w-36 animate-pulse rounded-full bg-cosmic-blue/10" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-cosmic-blue/10" />
            ))}
          </div>
        </div>
      ) : error ? (
        /* 에러 상태 */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-cosmic-red/50" />
          <p className="text-sm text-cosmic-gray">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 flex items-center gap-1 text-xs text-cosmic-light hover:text-cosmic-blue"
          >
            <RefreshCw className="h-3 w-3" />
            재시도
          </button>
        </div>
      ) : categoryData.length === 0 ? (
        /* 데이터 없음 */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Wallet className="mb-3 h-12 w-12 text-cosmic-gray/50" />
          <p className="text-cosmic-gray">이번 달 지출 내역이 없습니다</p>
          <Link href="/ledger" className="mt-2 text-sm text-cosmic-light hover:text-cosmic-blue">
            가계부에서 추가하기
          </Link>
        </div>
      ) : (
        <>
          {/* 도넛 차트와 카테고리 목록 — 모바일 세로, 데스크탑 가로 */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* 차트 */}
            <div className="relative h-36 w-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip totalExpense={totalExpense} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* 중앙 총액 표시 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-cosmic-gray">총 지출</span>
                <span className="text-sm font-bold text-cosmic-white">
                  {totalExpense >= 10_000
                    ? `₩${(totalExpense / 10_000).toFixed(0)}만`
                    : formatCurrency(totalExpense)}
                </span>
              </div>
            </div>

            {/* 카테고리 목록 */}
            <div className="w-full flex-1 space-y-2">
              {topCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-cosmic-gray truncate">{category.nameKo}</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-cosmic-white whitespace-nowrap">
                    {formatCurrency(category.value)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="mt-5 flex items-center justify-between border-t border-cosmic-blue/10 pt-4">
            <div className="text-sm text-cosmic-gray">
              총 <span className="font-medium text-cosmic-light">{categoryData.length}</span>개 카테고리
            </div>

            <Link
              href="/ledger"
              className="flex items-center gap-1 text-sm text-cosmic-light 
                         transition-all hover:text-cosmic-blue"
            >
              <span>가계부 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}

      {/* 배경 장식 */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full 
                      bg-cosmic-gold/5 blur-3xl transition-all group-hover:bg-cosmic-gold/10" />
    </motion.div>
  );
}
