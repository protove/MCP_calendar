'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import {
  LedgerTransaction,
  TransactionFormData,
  TransactionModalMode,
  CATEGORY_INFO,
} from '@/types/ledger';
import { TransactionForm } from './TransactionForm';

/**
 * 거래 모달 컴포넌트
 * 
 * 거래 추가, 수정, 상세 보기를 위한 모달
 * ESC 키로 닫기, 배경 클릭으로 닫기 지원
 */

interface TransactionModalProps {
  isOpen: boolean;
  mode: TransactionModalMode;
  transaction?: LedgerTransaction | null;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

/* 모달 배경 오버레이 - 캘린더와 동일한 스타일 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/* 모달 헤더 - 캘린더와 동일한 스타일 */
const ModalHeader = memo(function ModalHeader({
  mode,
  onClose,
}: {
  mode: TransactionModalMode;
  onClose: () => void;
}) {
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return '새 거래 추가';
      case 'edit':
        return '거래 수정';
      case 'view':
        return '거래 상세';
      default:
        return '거래';
    }
  };

  return (
    <div className="relative flex items-center justify-between p-5 border-b border-cosmic-blue/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cosmic-blue/20 border border-cosmic-blue/30">
          <Sparkles className="w-5 h-5 text-cosmic-gold" />
        </div>
        <h2 className="text-xl font-bold text-cosmic-white">{getTitle()}</h2>
      </div>
      {/* 닫기 버튼 - 캘린더와 동일한 스타일 */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="p-2 rounded-lg transition-colors duration-200 hover:bg-cosmic-blue/20 text-cosmic-gray hover:text-cosmic-white"
      >
        <X className="w-5 h-5" />
      </motion.button>
    </div>
  );
});

/* 거래 상세 보기 */
const TransactionDetail = memo(function TransactionDetail({
  transaction,
  onEdit,
  onDelete,
  onClose,
}: {
  transaction: LedgerTransaction;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const categoryInfo = CATEGORY_INFO[transaction.category];

  return (
    <div className="p-6 space-y-6">
      {/* 금액 표시 */}
      <div className="text-center py-6">
        <span
          className={`text-4xl font-bold ${
            transaction.type === 'income' ? 'text-cosmic-gold' : 'text-red-400'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}₩
          {transaction.amount.toLocaleString()}
        </span>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-4">
        {/* 카테고리 */}
        <div className="flex items-center justify-between py-3 border-b border-cosmic-blue/10">
          <span className="text-cosmic-gray">카테고리</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryInfo.icon}</span>
            <span
              className="px-2 py-1 rounded-full text-sm"
              style={{
                backgroundColor: categoryInfo.bgColor,
                color: categoryInfo.color,
              }}
            >
              {categoryInfo.labelKo}
            </span>
          </div>
        </div>

        {/* 설명 */}
        <div className="flex items-center justify-between py-3 border-b border-cosmic-blue/10">
          <span className="text-cosmic-gray">설명</span>
          <span className="text-cosmic-white">{transaction.description}</span>
        </div>

        {/* 날짜 */}
        <div className="flex items-center justify-between py-3 border-b border-cosmic-blue/10">
          <span className="text-cosmic-gray">날짜</span>
          <span className="text-cosmic-white">{transaction.date}</span>
        </div>

        {/* 메모 */}
        {transaction.memo && (
          <div className="py-3 border-b border-cosmic-blue/10">
            <span className="text-cosmic-gray block mb-2">메모</span>
            <p className="text-cosmic-white bg-cosmic-dark/40 p-3 rounded-lg">
              {transaction.memo}
            </p>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-cosmic-blue/30 text-cosmic-gray hover:bg-cosmic-blue/10 hover:text-cosmic-white transition-colors"
        >
          닫기
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl bg-cosmic-blue/20 text-cosmic-light hover:bg-cosmic-blue/30 transition-colors"
        >
          수정
        </button>
        <button
          onClick={onDelete}
          className="py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
});

export const TransactionModal = memo(function TransactionModal({
  isOpen,
  mode,
  transaction,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
}: TransactionModalProps) {
  /* ESC 키로 모달 닫기 */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /* 모달 열릴 때 스크롤 잠금 */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* 상세 보기에서 수정 모드로 전환 */
  const handleEditFromView = useCallback(() => {
    // 부모 컴포넌트에서 mode를 'edit'로 변경해야 함
    // 이 함수는 플레이스홀더로, 실제 구현은 부모에서 처리
  }, []);

  /* 삭제 핸들러 */
  const handleDelete = useCallback(() => {
    if (transaction && onDelete) {
      if (window.confirm('정말 이 거래를 삭제하시겠습니까?')) {
        onDelete(transaction.id);
        onClose();
      }
    }
  }, [transaction, onDelete, onClose]);

  /* 폼 초기 데이터 */
  const formInitialData = transaction
    ? {
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        memo: transaction.memo,
      }
    : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 오버레이 - 우주 테마 블러 효과 */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-cosmic-dark/80 backdrop-blur-sm cursor-pointer"
          />

          {/* 모달 컨테이너 */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-gradient-to-br from-cosmic-dark via-cosmic-dark to-cosmic-blue/10 border border-cosmic-blue/30 rounded-2xl shadow-cosmic-lg overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* 상단 글로우 효과 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cosmic-light/50 to-transparent" />

            {/* 헤더 */}
            <ModalHeader mode={mode} onClose={onClose} />

            {/* 컨텐츠 */}
            <div className="p-5">
              {mode === 'view' && transaction ? (
                <TransactionDetail
                  transaction={transaction}
                  onEdit={handleEditFromView}
                  onDelete={handleDelete}
                  onClose={onClose}
                />
              ) : (
                <TransactionForm
                  initialData={formInitialData}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default TransactionModal;
