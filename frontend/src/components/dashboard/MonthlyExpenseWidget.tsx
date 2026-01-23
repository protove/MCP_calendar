"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/**
 * MonthlyExpenseWidget - 월별 지출 요약 위젯
 * 
 * 이번 달 지출을 카테고리별로 시각화하는 위젯
 * - 도넛 차트로 카테고리별 비율 표시
 * - 상위 지출 카테고리 목록
 * - 총 지출 금액 표시
 */

// 지출 카테고리 타입 정의
interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

// Mock 데이터 - 카테고리별 지출
const mockExpenseData: ExpenseCategory[] = [
  { name: "식비", value: 520000, color: "#42708C" },
  { name: "교통비", value: 180000, color: "#80ADBF" },
  { name: "쇼핑", value: 340000, color: "#F2BF91" },
  { name: "문화/여가", value: 250000, color: "#9BADB8" },
  { name: "공과금", value: 280000, color: "#5A8FA8" },
  { name: "기타", value: 270000, color: "#6B8A99" },
];

// 총 지출 계산
const totalExpense = mockExpenseData.reduce((sum, item) => sum + item.value, 0);

// 금액 포맷팅 함수
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

// 퍼센트 계산 함수
function calculatePercentage(value: number, total: number): string {
  return ((value / total) * 100).toFixed(1);
}

// 커스텀 툴팁 컴포넌트
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-cosmic-blue/30 bg-cosmic-dark/95 
                      px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
        <p className="font-medium text-cosmic-white">{data.name}</p>
        <p className="text-cosmic-gold">{formatCurrency(data.value)}</p>
        <p className="text-cosmic-gray">
          {calculatePercentage(data.value, totalExpense)}%
        </p>
      </div>
    );
  }
  return null;
}

export function MonthlyExpenseWidget() {
  // 상위 3개 카테고리 추출
  const topCategories = [...mockExpenseData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const currentMonth = new Date().toLocaleDateString("ko-KR", { month: "long" });

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

        {/* 지출 추세 */}
        <div className="flex items-center gap-1 text-sm text-cosmic-gold">
          <TrendingDown className="h-4 w-4" />
          <span>-5% 지난달 대비</span>
        </div>
      </div>

      {/* 도넛 차트와 총액 */}
      <div className="flex items-center gap-6">
        {/* 차트 */}
        <div className="relative h-36 w-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockExpenseData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {mockExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* 중앙 총액 표시 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-cosmic-gray">총 지출</span>
            <span className="text-sm font-bold text-cosmic-white">
              ₩{(totalExpense / 10000).toFixed(0)}만
            </span>
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div className="flex-1 space-y-2">
          {topCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-cosmic-gray">{category.name}</span>
              </div>
              <span className="text-sm font-medium text-cosmic-white">
                {formatCurrency(category.value)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-5 flex items-center justify-between border-t border-cosmic-blue/10 pt-4">
        <div className="text-sm">
          <span className="text-cosmic-gray">예산 대비 </span>
          <span className="font-medium text-cosmic-light">74%</span>
          <span className="text-cosmic-gray"> 사용</span>
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

      {/* 배경 장식 */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full 
                      bg-cosmic-gold/5 blur-3xl transition-all group-hover:bg-cosmic-gold/10" />
    </motion.div>
  );
}
