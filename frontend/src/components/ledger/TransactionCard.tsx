'use client';

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import {
  LedgerTransaction,
  CATEGORY_INFO,
  getCategoryIcon,
  getCategoryLabel,
} from '@/types/ledger';

/**
 * 거래 카드 컴포넌트
 * 
 * 개별 거래 항목을 표시하는 카드
 * React.memo로 최적화하여 불필요한 리렌더링 방지
 */

interface TransactionCardProps {
  transaction: LedgerTransaction;
  onEdit?: (transaction: LedgerTransaction) => void;
  onDelete?: (id: string) => void;
  onView?: (transaction: LedgerTransaction) => void;
  index?: number;
}

/* 날짜 포맷팅 함수 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};

export const TransactionCard = memo(function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onView,
  index = 0,
}: TransactionCardProps) {
  const { id, type, category, amount, description, date, memo: transactionMemo } = transaction;
  const categoryInfo = CATEGORY_INFO[category];

  /* 이벤트 핸들러 - useCallback으로 메모이제이션 */
  const handleEdit = useCallback(() => {
    onEdit?.(transaction);
  }, [onEdit, transaction]);

  const handleDelete = useCallback(() => {
    onDelete?.(id);
  }, [onDelete, id]);

  const handleView = useCallback(() => {
    onView?.(transaction);
  }, [onView, transaction]);

  /* 드롭다운 메뉴 상태 */
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
      style={{ contentVisibility: 'auto' }} // 성능 최적화: content-visibility
    >
      {/* 호버 시 배경 글로우 */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: `linear-gradient(135deg, ${categoryInfo?.bgColor || 'rgba(66, 112, 140, 0.1)'}, transparent)`,
        }}
      />

      <div className="relative flex items-center gap-4 p-4 rounded-xl bg-cosmic-dark/40 border border-cosmic-blue/10 hover:border-cosmic-blue/30 transition-all duration-300 backdrop-blur-sm">
        {/* 카테고리 아이콘 */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{
            backgroundColor: categoryInfo?.bgColor || 'rgba(66, 112, 140, 0.15)',
          }}
        >
          {getCategoryIcon(category)}
        </div>

        {/* 거래 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-cosmic-white font-medium truncate">
              {description || '메모 없음'}
            </h4>
            {transactionMemo && (
              <span className="text-cosmic-gray text-xs truncate max-w-[100px]">
                - {transactionMemo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: categoryInfo?.bgColor,
                color: categoryInfo?.color,
              }}
            >
              {getCategoryLabel(category)}
            </span>
            <span className="text-cosmic-gray">{formatDate(date)}</span>
          </div>
        </div>

        {/* 금액 */}
        <div className="flex-shrink-0 text-right">
          <span
            className={`text-lg font-bold ${
              type === 'income' ? 'text-cosmic-gold' : 'text-red-400'
            }`}
          >
            {type === 'income' ? '+' : '-'}₩{amount.toLocaleString()}
          </span>
        </div>

        {/* 액션 메뉴 */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg text-cosmic-gray hover:text-cosmic-white hover:bg-cosmic-blue/20 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <>
              {/* 오버레이 */}
              <div
                className="fixed inset-0 z-10"
                onClick={closeMenu}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 z-20 w-36 py-1 rounded-lg bg-cosmic-dark border border-cosmic-blue/30 shadow-cosmic-lg"
              >
                <button
                  onClick={() => {
                    handleView();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cosmic-white hover:bg-cosmic-blue/20 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  상세 보기
                </button>
                <button
                  onClick={() => {
                    handleEdit();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cosmic-white hover:bg-cosmic-blue/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
});

/* 스켈레톤 로딩 카드 */
export const TransactionCardSkeleton = memo(function TransactionCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-cosmic-dark/40 border border-cosmic-blue/10 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-cosmic-blue/20" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 rounded bg-cosmic-blue/20" />
        <div className="flex gap-2">
          <div className="w-16 h-5 rounded-full bg-cosmic-blue/20" />
          <div className="w-24 h-4 rounded bg-cosmic-blue/20" />
        </div>
      </div>
      <div className="w-24 h-6 rounded bg-cosmic-blue/20" />
    </div>
  );
});

export default TransactionCard;
