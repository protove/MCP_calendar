'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TransactionResponse,
} from '@/types/ledger';
import { transactionApi } from '@/lib/api';
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
 * 실제 백엔드 API 연동
 */

/* 백엔드 TransactionResponse → 프론트엔드 LedgerTransaction 변환 */
function toTransaction(res: TransactionResponse): LedgerTransaction {
  return {
    id: String(res.id),
    type: res.type as LedgerTransaction['type'],
    category: res.category as TransactionCategory,
    amount: res.amount,
    description: res.description ?? '',
    date: res.date,
    memo: res.memo ?? undefined,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
  };
}

/* 월별 차트 데이터 (최근 6개월) — API 연동 시 동적으로 생성 */
function buildMonthlyChartData(transactions: LedgerTransaction[]): MonthlyChartData[] {
  const now = new Date();
  const months: MonthlyChartData[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${d.getMonth() + 1}월`;
    const year = d.getFullYear();
    const month = d.getMonth();

    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      const td = new Date(t.date);
      if (td.getFullYear() === year && td.getMonth() === month) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    }
    months.push({ month: label, income, expense });
  }
  return months;
}

/* 초기 필터 상태 */
const INITIAL_FILTER: FilterState = {
  dateRange: 'thisMonth',
  categories: [],
  type: 'all',
  searchQuery: '',
};

export function LedgerView() {
  /* === 상태 관리 === */
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [isLoading, setIsLoading] = useState(true);
  
  /* 모달 상태 */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TransactionModalMode>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<LedgerTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* === 백엔드에서 거래 데이터 조회 === */
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await transactionApi.getAll();
      if (res.data.success && res.data.data) {
        setTransactions(res.data.data.map(toTransaction));
      }
    } catch (err) {
      console.error('거래 데이터를 불러올 수 없습니다:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  /* === 월별 차트 데이터 (useMemo로 최적화) === */
  const monthlyChartData: MonthlyChartData[] = useMemo(
    () => buildMonthlyChartData(transactions),
    [transactions]
  );

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
      try {
        if (modalMode === 'create') {
          const res = await transactionApi.create({
            type: data.type,
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: data.date,
            memo: data.memo,
          });
          if (res.data.success && res.data.data) {
            setTransactions((prev) => [toTransaction(res.data.data!), ...prev]);
          }
        } else if (modalMode === 'edit' && selectedTransaction) {
          const res = await transactionApi.update(selectedTransaction.id, {
            type: data.type,
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: data.date,
            memo: data.memo,
          });
          if (res.data.success && res.data.data) {
            const updated = toTransaction(res.data.data!);
            setTransactions((prev) =>
              prev.map((t) => t.id === selectedTransaction.id ? updated : t)
            );
          }
        }
        handleCloseModal();
      } catch (err) {
        console.error('거래 저장 실패:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [modalMode, selectedTransaction, handleCloseModal]
  );

  /* 거래 삭제 */
  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('거래 삭제 실패:', err);
    }
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
          <MonthlyChart data={monthlyChartData} isLoading={isLoading} />
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
