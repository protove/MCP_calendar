'use client';

import React, { memo, useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  TransactionFormData,
  TransactionType,
  TransactionCategory,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_INFO,
} from '@/types/ledger';
import { Button } from '@/components/ui/button';

/**
 * 거래 폼 컴포넌트
 * 
 * 새 거래 추가 및 수정을 위한 폼
 * 유효성 검사 및 에러 표시 포함
 */

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/* 기본값 */
const getDefaultFormData = (): TransactionFormData => ({
  type: 'expense',
  category: 'food',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  memo: '',
});

/* 폼 에러 타입 */
interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

export const TransactionForm = memo(function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransactionFormProps) {
  /* 폼 상태 */
  const [formData, setFormData] = useState<TransactionFormData>(() => ({
    ...getDefaultFormData(),
    ...initialData,
  }));

  /* 에러 상태 */
  const [errors, setErrors] = useState<FormErrors>({});

  /* 터치 상태 (포커스 아웃 시 검증) */
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* 현재 타입에 맞는 카테고리 목록 */
  const availableCategories = useMemo(() => {
    return formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [formData.type]);

  /* 타입 변경 시 카테고리 리셋 */
  const handleTypeChange = useCallback((type: TransactionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: type === 'income' ? 'salary' : 'food',
    }));
  }, []);

  /* 필드 변경 핸들러 */
  const handleChange = useCallback(
    (field: keyof TransactionFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      
      // 에러 클리어
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  /* 블러 핸들러 (포커스 아웃 시 검증) */
  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /* 금액 입력 핸들러 (숫자만 허용) */
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      handleChange('amount', value ? parseInt(value, 10) : 0);
    },
    [handleChange]
  );

  /* 유효성 검사 */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '금액을 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /* 폼 제출 핸들러 */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validate()) {
        onSubmit(formData);
      }
    },
    [formData, onSubmit, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 거래 유형 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">거래 유형</label>
        <div className="flex gap-3">
          {/* 수입 버튼 */}
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
              formData.type === 'income'
                ? 'border-cosmic-gold bg-cosmic-gold/10 text-cosmic-gold'
                : 'border-cosmic-blue/20 text-cosmic-gray hover:border-cosmic-blue/40'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">수입</span>
          </button>

          {/* 지출 버튼 */}
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
              formData.type === 'expense'
                ? 'border-red-400 bg-red-500/10 text-red-400'
                : 'border-cosmic-blue/20 text-cosmic-gray hover:border-cosmic-blue/40'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            <span className="font-medium">지출</span>
          </button>
        </div>
      </div>

      {/* 금액 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">금액</label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type="text"
            inputMode="numeric"
            value={formData.amount === 0 ? '' : formData.amount.toLocaleString()}
            onChange={handleAmountChange}
            onBlur={() => handleBlur('amount')}
            placeholder="0"
            className={`w-full pl-12 pr-8 py-3 rounded-xl bg-cosmic-dark/60 border text-cosmic-white text-xl font-bold placeholder:text-cosmic-gray/50 focus:outline-none transition-colors ${
              errors.amount && touched.amount
                ? 'border-red-400'
                : 'border-cosmic-blue/20 focus:border-cosmic-blue/50'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cosmic-gray">
            원
          </span>
        </div>
        {errors.amount && touched.amount && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.amount}
          </motion.p>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">카테고리</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableCategories.map((category) => {
            const info = CATEGORY_INFO[category];
            const isSelected = formData.category === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleChange('category', category)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-cosmic-light bg-cosmic-blue/20'
                    : 'border-cosmic-blue/10 hover:border-cosmic-blue/30'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span
                  className={`text-xs font-medium ${
                    isSelected ? 'text-cosmic-white' : 'text-cosmic-gray'
                  }`}
                >
                  {info.labelKo}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 설명 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">설명</label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-3 w-5 h-5 text-cosmic-gray" />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="어디에 사용했나요?"
            className={`w-full pl-12 pr-4 py-3 rounded-xl bg-cosmic-dark/60 border text-cosmic-white placeholder:text-cosmic-gray/50 focus:outline-none transition-colors ${
              errors.description && touched.description
                ? 'border-red-400'
                : 'border-cosmic-blue/20 focus:border-cosmic-blue/50'
            }`}
          />
        </div>
        {errors.description && touched.description && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </motion.p>
        )}
      </div>

      {/* 날짜 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">날짜</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white focus:outline-none focus:border-cosmic-blue/50 transition-colors"
          />
        </div>
      </div>

      {/* 메모 입력 (선택) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cosmic-gray">
          메모 <span className="text-cosmic-gray/50">(선택)</span>
        </label>
        <textarea
          value={formData.memo || ''}
          onChange={(e) => handleChange('memo', e.target.value)}
          placeholder="추가로 기록할 내용이 있나요?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white placeholder:text-cosmic-gray/50 focus:outline-none focus:border-cosmic-blue/50 transition-colors resize-none"
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-cosmic-blue/30 text-cosmic-gray hover:bg-cosmic-blue/10 hover:text-cosmic-white transition-colors"
        >
          취소
        </button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 py-3 text-white font-medium transition-all ${
            formData.type === 'income'
              ? 'bg-gradient-to-r from-cosmic-gold to-amber-500 hover:from-cosmic-gold/90 hover:to-amber-500/90'
              : 'bg-gradient-to-r from-cosmic-blue to-cosmic-light hover:from-cosmic-blue/90 hover:to-cosmic-light/90'
          }`}
        >
          {isSubmitting ? '저장 중...' : initialData ? '수정하기' : '추가하기'}
        </Button>
      </div>
    </form>
  );
});

export default TransactionForm;
