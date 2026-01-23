'use client';

import React, { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartDataItem } from '@/types/ledger';

/**
 * 카테고리 차트 내용 컴포넌트 (Lazy Loaded)
 * 
 * Recharts 컴포넌트를 포함하여 lazy loading 지원
 */

interface CategoryChartContentProps {
  data: ChartDataItem[];
}

/* 커스텀 툴팁 */
const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDataItem }[];
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-cosmic-dark/95 border border-cosmic-blue/30 rounded-lg p-3 shadow-cosmic-lg">
      <p className="text-cosmic-white font-medium">{item.nameKo}</p>
      <p className="text-cosmic-gray text-sm">
        ₩{item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
      </p>
    </div>
  );
});

const CategoryChartContent = memo(function CategoryChartContent({
  data,
}: CategoryChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
});

export default CategoryChartContent;
