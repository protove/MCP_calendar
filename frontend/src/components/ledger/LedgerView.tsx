'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Stars } from 'lucide-react';
import {
  LedgerTransaction,
  TransactionFormData,
  FilterState,
  ChartDataItem,
  MonthlyChartData,
  LedgerSummary,
  TransactionModalMode,
  CATEGORY_INFO,
  TransactionCategory,
} from '@/types/ledger';
import { Button } from '@/components/ui/button';
import { SummaryCards } from './SummaryCards';
import { FilterBar } from './FilterBar';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';
import { CategoryChart } from './CategoryChart';
import { MonthlyChart } from './MonthlyChart';

/**
 * 가계부 메인 뷰 컴포넌트
 * 
 * 우주/별자리 테마로 완전히 재설계된 가계부 페이지
 * 성능 최적화: useMemo, useCallback 활용
 */

/* 모의 거래 데이터 (Mock Data) */
const MOCK_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: '1',
    type: 'expense',
    category: 'food',
    amount: 15000,
    description: '점심 식사',
    date: '2026-01-23',
    memo: '동료들과 함께',
    createdAt: '2026-01-23T12:00:00Z',
  },
  {
    id: '2',
    type: 'expense',
    category: 'transport',
    amount: 5000,
    description: '지하철 교통비',
    date: '2026-01-23',
    createdAt: '2026-01-23T08:00:00Z',
  },
  {
    id: '3',
    type: 'income',
    category: 'salary',
    amount: 4500000,
    description: '1월 급여',
    date: '2026-01-20',
    memo: '정기 월급',
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    id: '4',
    type: 'expense',
    category: 'shopping',
    amount: 89000,
    description: '온라인 쇼핑',
    date: '2026-01-22',
    createdAt: '2026-01-22T14:00:00Z',
  },
  {
    id: '5',
    type: 'expense',
    category: 'fixed',
    amount: 500000,
    description: '월세',
    date: '2026-01-05',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: '6',
    type: 'expense',
    category: 'leisure',
    amount: 35000,
    description: '영화 관람',
    date: '2026-01-21',
    memo: '팝콘 포함',
    createdAt: '2026-01-21T19:00:00Z',
  },
  {
    id: '7',
    type: 'income',
    category: 'sideIncome',
    amount: 200000,
    description: '프리랜서 수입',
    date: '2026-01-15',
    createdAt: '2026-01-15T16:00:00Z',
  },
  {
    id: '8',
    type: 'expense',
    category: 'food',
    amount: 45000,
    description: '저녁 회식',
    date: '2026-01-19',
    createdAt: '2026-01-19T20:00:00Z',
  },
  {
    id: '9',
    type: 'expense',
    category: 'transport',
    amount: 35000,
    description: '택시비',
    date: '2026-01-18',
    createdAt: '2026-01-18T23:00:00Z',
  },
  {
    id: '10',
    type: 'expense',
    category: 'other',
    amount: 12000,
    description: '생활용품',
    date: '2026-01-17',
    createdAt: '2026-01-17T11:00:00Z',
  },
  // 추가 데이터로 무한 스크롤 테스트
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `mock-${i + 11}`,
    type: (i % 5 === 0 ? 'income' : 'expense') as 'income' | 'expense',
    category: (['food', 'transport', 'shopping', 'leisure', 'fixed', 'other'] as TransactionCategory[])[
      i % 6
    ],
    amount: Math.floor(Math.random() * 100000) + 5000,
    description: `거래 내역 ${i + 11}`,
    date: `2026-01-${String(Math.max(1, 20 - Math.floor(i / 3))).padStart(2, '0')}`,
    createdAt: new Date().toISOString(),
  })),
];

/* 월별 차트 모의 데이터 */
const MOCK_MONTHLY_DATA: MonthlyChartData[] = [
  { month: '8월', income: 4200000, expense: 2100000 },
  { month: '9월', income: 4500000, expense: 2800000 },
  { month: '10월', income: 4300000, expense: 2400000 },
  { month: '11월', income: 4700000, expense: 2600000 },
  { month: '12월', income: 5200000, expense: 3500000 },
  { month: '1월', income: 4700000, expense: 1800000 },
];

/* 초기 필터 상태 */
const INITIAL_FILTER: FilterState = {
  dateRange: 'thisMonth',
  categories: [],
  type: 'all',
  searchQuery: '',
};

export function LedgerView() {
  /* === 상태 관리 === */
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  
  /* 모달 상태 */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TransactionModalMode>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<LedgerTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* === 필터링된 거래 목록 (useMemo로 최적화) === */
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // 거래 유형 필터
    if (filter.type !== 'all') {
      result = result.filter((t) => t.type === filter.type);
    }

    // 카테고리 필터
    if (filter.categories.length > 0) {
      result = result.filter((t) => filter.categories.includes(t.category));
    }

    // 검색어 필터
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.memo?.toLowerCase().includes(query)
      );
    }

    // 날짜 범위 필터
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (filter.dateRange === 'thisMonth') {
      result = result.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });
    } else if (filter.dateRange === 'lastMonth') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      result = result.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === lastMonthYear && date.getMonth() === lastMonth;
      });
    } else if (filter.dateRange === 'last3Months') {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
      result = result.filter((t) => new Date(t.date) >= threeMonthsAgo);
    } else if (filter.dateRange === 'custom') {
      if (filter.customStartDate) {
        result = result.filter((t) => t.date >= filter.customStartDate!);
      }
      if (filter.customEndDate) {
        result = result.filter((t) => t.date <= filter.customEndDate!);
      }
    }

    // 날짜 내림차순 정렬
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  /* === 요약 통계 (useMemo로 최적화) === */
  const summary: LedgerSummary = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
    };
  }, [filteredTransactions]);

  /* === 카테고리별 차트 데이터 (useMemo로 최적화) === */
  const categoryChartData: ChartDataItem[] = useMemo(() => {
    const expenseByCategory = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);

    return Object.entries(expenseByCategory)
      .map(([category, value]) => ({
        name: category,
        nameKo: CATEGORY_INFO[category as TransactionCategory]?.labelKo || category,
        value,
        color: CATEGORY_INFO[category as TransactionCategory]?.color || '#6B7280',
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  /* === 이벤트 핸들러 (useCallback으로 최적화) === */
  
  /* 새 거래 추가 모달 열기 */
  const handleOpenCreateModal = useCallback(() => {
    setModalMode('create');
    setSelectedTransaction(null);
    setIsModalOpen(true);
  }, []);

  /* 거래 수정 모달 열기 */
  const handleEditTransaction = useCallback((transaction: LedgerTransaction) => {
    setModalMode('edit');
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  /* 거래 상세 보기 모달 열기 */
  const handleViewTransaction = useCallback((transaction: LedgerTransaction) => {
    setModalMode('view');
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  /* 모달 닫기 */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  /* 거래 저장 (추가/수정) */
  const handleSubmitTransaction = useCallback(
    async (data: TransactionFormData) => {
      setIsSubmitting(true);

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (modalMode === 'create') {
        // 새 거래 추가
        const newTransaction: LedgerTransaction = {
          id: `new-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
      } else if (modalMode === 'edit' && selectedTransaction) {
        // 기존 거래 수정
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === selectedTransaction.id
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t
          )
        );
      }

      setIsSubmitting(false);
      handleCloseModal();
    },
    [modalMode, selectedTransaction, handleCloseModal]
  );

  /* 거래 삭제 */
  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* 필터 변경 */
  const handleFilterChange = useCallback((newFilter: FilterState) => {
    setFilter(newFilter);
  }, []);

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* 배경 별 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cosmic-gold/30 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cosmic-blue/30 to-cosmic-dark border border-cosmic-blue/20">
              <Stars className="w-6 h-6 text-cosmic-gold" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-cosmic-white flex items-center gap-2">
                가계부
                <Sparkles className="w-5 h-5 text-cosmic-gold animate-pulse-slow" />
              </h1>
              <p className="text-cosmic-gray text-sm">수입과 지출을 한눈에 관리하세요</p>
            </div>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cosmic-blue to-cosmic-light text-white font-medium shadow-cosmic hover:shadow-cosmic-lg transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            새 거래 추가
          </Button>
        </motion.header>

        {/* 요약 카드 */}
        <section className="mb-8">
          <SummaryCards summary={summary} isLoading={isLoading} />
        </section>

        {/* 차트 섹션 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MonthlyChart data={MOCK_MONTHLY_DATA} isLoading={isLoading} />
          <CategoryChart data={categoryChartData} isLoading={isLoading} />
        </section>

        {/* 필터 바 */}
        <section className="mb-6">
          <FilterBar filter={filter} onFilterChange={handleFilterChange} />
        </section>

        {/* 거래 목록 */}
        <section className="rounded-2xl bg-cosmic-dark/40 border border-cosmic-blue/20 p-4 md:p-6 backdrop-blur-sm">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onView={handleViewTransaction}
          />
        </section>
      </div>

      {/* 거래 모달 */}
      <TransactionModal
        isOpen={isModalOpen}
        mode={modalMode}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTransaction}
        onDelete={handleDeleteTransaction}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
