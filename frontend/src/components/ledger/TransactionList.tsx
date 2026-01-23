'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, Loader2, ChevronDown } from 'lucide-react';
import { LedgerTransaction } from '@/types/ledger';
import { TransactionCard, TransactionCardSkeleton } from './TransactionCard';

/**
 * 거래 목록 컴포넌트
 * 
 * 무한 스크롤 패턴으로 성능 최적화
 * 한 번에 20개씩 로드하여 DOM 노드 수 최소화
 */

interface TransactionListProps {
  transactions: LedgerTransaction[];
  isLoading?: boolean;
  onEdit?: (transaction: LedgerTransaction) => void;
  onDelete?: (id: string) => void;
  onView?: (transaction: LedgerTransaction) => void;
  pageSize?: number;
}

/* 빈 상태 컴포넌트 - CSS 기반 우주 일러스트 */
const EmptyState = memo(function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* CSS 기반 우주 일러스트레이션 */}
      <div className="relative w-48 h-48 mb-6">
        {/* 원형 배경 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cosmic-blue/20 to-cosmic-dark border border-cosmic-blue/20" />
        
        {/* 별들 */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cosmic-gold animate-twinkle"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        
        {/* 중앙 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-6 rounded-full bg-cosmic-blue/10 border border-cosmic-blue/20">
            <Inbox className="w-12 h-12 text-cosmic-gray" />
          </div>
        </div>

        {/* 궤도 원 */}
        <div className="absolute inset-4 rounded-full border border-dashed border-cosmic-blue/20 animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      <h3 className="text-xl font-medium text-cosmic-white mb-2">
        거래 내역이 없습니다
      </h3>
      <p className="text-cosmic-gray text-center max-w-sm">
        새로운 거래를 추가하여 가계부를 시작해보세요.
        <br />
        수입과 지출을 기록하고 재정을 관리할 수 있습니다.
      </p>
    </motion.div>
  );
});

export const TransactionList = memo(function TransactionList({
  transactions,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  pageSize = 20,
}: TransactionListProps) {
  /* 표시할 아이템 수 상태 */
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  /* 스크롤 감지를 위한 ref */
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* 표시할 거래 목록 */
  const displayedTransactions = transactions.slice(0, displayCount);
  const hasMore = displayCount < transactions.length;

  /* 더 불러오기 함수 */
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // 부드러운 로딩 효과를 위한 약간의 딜레이
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + pageSize, transactions.length));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, pageSize, transactions.length]);

  /* Intersection Observer로 무한 스크롤 구현 */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  /* 거래 목록이 변경되면 표시 개수 리셋 */
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [transactions, pageSize]);

  /* 로딩 상태 */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <TransactionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  /* 빈 상태 */
  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {/* 거래 목록 헤더 */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-sm text-cosmic-gray">
          총 {transactions.length}건의 거래
        </span>
        <span className="text-xs text-cosmic-gray">
          {displayedTransactions.length}건 표시 중
        </span>
      </div>

      {/* 거래 카드 목록 - AnimatePresence로 부드러운 전환 */}
      <AnimatePresence mode="popLayout">
        {displayedTransactions.map((transaction, index) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            index={index}
          />
        ))}
      </AnimatePresence>

      {/* 더 불러오기 트리거 영역 */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex flex-col items-center justify-center py-6"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-cosmic-gray">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">불러오는 중...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-cosmic-light hover:bg-cosmic-blue/20 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              <span className="text-sm">더 보기 ({transactions.length - displayCount}건 남음)</span>
            </button>
          )}
        </div>
      )}

      {/* 목록 끝 표시 */}
      {!hasMore && transactions.length > pageSize && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-cosmic-gray text-sm"
        >
          모든 거래를 불러왔습니다 ✨
        </motion.div>
      )}
    </div>
  );
});

export default TransactionList;
