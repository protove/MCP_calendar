'use client';

import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyChartData } from '@/types/ledger';

/**
 * 월별 차트 내용 컴포넌트 (Lazy Loaded)
 * 
 * Recharts 컴포넌트를 포함하여 lazy loading 지원
 */

interface MonthlyChartContentProps {
  data: MonthlyChartData[];
}

/* 커스텀 툴팁 */
const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-cosmic-dark/95 border border-cosmic-blue/30 rounded-lg p-3 shadow-cosmic-lg">
      <p className="text-cosmic-white font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-cosmic-gray text-sm">
            {entry.dataKey === 'income' ? '수입' : '지출'}:
          </span>
          <span className="text-cosmic-white text-sm">
            ₩{entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
});

const MonthlyChartContent = memo(function MonthlyChartContent({
  data,
}: MonthlyChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(66, 112, 140, 0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9BADB8', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9BADB8', fontSize: 12 }}
          tickFormatter={(value: number) => `${(value / 10000).toFixed(0)}만`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (value === 'income' ? '수입' : '지출')}
          wrapperStyle={{ paddingTop: '20px' }}
        />
        <Bar
          dataKey="income"
          fill="#F2BF91"
          radius={[4, 4, 0, 0]}
          name="income"
        />
        <Bar
          dataKey="expense"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          name="expense"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

export default MonthlyChartContent;
