'use client';

import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  FilterState,
  DateRangeType,
  TransactionCategory,
  TransactionType,
  ALL_CATEGORIES,
  CATEGORY_INFO,
} from '@/types/ledger';

/**
 * 필터 바 컴포넌트
 * 
 * 날짜 범위, 카테고리, 거래 유형 필터링 기능
 * 검색 기능 포함
 */

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

/* 날짜 범위 옵션 */
const DATE_RANGE_OPTIONS: { value: DateRangeType; label: string }[] = [
  { value: 'thisMonth', label: '이번 달' },
  { value: 'lastMonth', label: '지난 달' },
  { value: 'last3Months', label: '최근 3개월' },
  { value: 'custom', label: '직접 선택' },
];

/* 거래 유형 옵션 */
const TYPE_OPTIONS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'income', label: '수입' },
  { value: 'expense', label: '지출' },
];

/* 드롭다운 컴포넌트 */
const Dropdown = memo(function Dropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white hover:border-cosmic-blue/40 transition-colors min-w-[120px]"
      >
        {Icon && <Icon className="w-4 h-4 text-cosmic-gray" />}
        <span className="text-sm flex-1 text-left truncate">
          {selectedOption?.label || label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-cosmic-gray transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 z-20 w-full min-w-[140px] py-1 rounded-lg bg-cosmic-dark border border-cosmic-blue/30 shadow-cosmic-lg"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                    option.value === value
                      ? 'bg-cosmic-blue/20 text-cosmic-white'
                      : 'text-cosmic-gray hover:bg-cosmic-blue/10 hover:text-cosmic-white'
                  }`}
                >
                  {option.value === value && <Check className="w-3 h-3" />}
                  <span className={option.value !== value ? 'ml-5' : ''}>
                    {option.label}
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

/* 카테고리 필터 드롭다운 */
const CategoryFilter = memo(function CategoryFilter({
  selectedCategories,
  onChange,
}: {
  selectedCategories: TransactionCategory[];
  onChange: (categories: TransactionCategory[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = useCallback(
    (category: TransactionCategory) => {
      if (selectedCategories.includes(category)) {
        onChange(selectedCategories.filter((c) => c !== category));
      } else {
        onChange([...selectedCategories, category]);
      }
    },
    [selectedCategories, onChange]
  );

  const selectAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white hover:border-cosmic-blue/40 transition-colors"
      >
        <Filter className="w-4 h-4 text-cosmic-gray" />
        <span className="text-sm">
          카테고리
          {selectedCategories.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cosmic-blue/30 text-xs">
              {selectedCategories.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-cosmic-gray transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 z-20 w-56 py-2 rounded-lg bg-cosmic-dark border border-cosmic-blue/30 shadow-cosmic-lg"
            >
              {/* 전체 선택 버튼 */}
              <button
                onClick={selectAll}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm border-b border-cosmic-blue/10 ${
                  selectedCategories.length === 0
                    ? 'text-cosmic-light'
                    : 'text-cosmic-gray hover:text-cosmic-white'
                }`}
              >
                {selectedCategories.length === 0 && (
                  <Check className="w-3 h-3" />
                )}
                <span className={selectedCategories.length > 0 ? 'ml-5' : ''}>
                  전체 보기
                </span>
              </button>

              {/* 카테고리 목록 */}
              <div className="max-h-60 overflow-y-auto py-1">
                {ALL_CATEGORIES.map((category) => {
                  const info = CATEGORY_INFO[category];
                  const isSelected = selectedCategories.includes(category);

                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'bg-cosmic-blue/20 text-cosmic-white'
                          : 'text-cosmic-gray hover:bg-cosmic-blue/10 hover:text-cosmic-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected
                            ? 'bg-cosmic-blue border-cosmic-blue'
                            : 'border-cosmic-gray/30'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{info.icon}</span>
                      <span>{info.labelKo}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export const FilterBar = memo(function FilterBar({
  filter,
  onFilterChange,
}: FilterBarProps) {
  /* 검색어 변경 핸들러 */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ ...filter, searchQuery: e.target.value });
    },
    [filter, onFilterChange]
  );

  /* 검색어 초기화 */
  const clearSearch = useCallback(() => {
    onFilterChange({ ...filter, searchQuery: '' });
  }, [filter, onFilterChange]);

  /* 날짜 범위 변경 핸들러 */
  const handleDateRangeChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filter, dateRange: value as DateRangeType });
    },
    [filter, onFilterChange]
  );

  /* 거래 유형 변경 핸들러 */
  const handleTypeChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filter, type: value as TransactionType | 'all' });
    },
    [filter, onFilterChange]
  );

  /* 카테고리 변경 핸들러 */
  const handleCategoryChange = useCallback(
    (categories: TransactionCategory[]) => {
      onFilterChange({ ...filter, categories });
    },
    [filter, onFilterChange]
  );

  /* 커스텀 날짜 범위 변경 핸들러 */
  const handleCustomDateChange = useCallback(
    (type: 'start' | 'end', value: string) => {
      if (type === 'start') {
        onFilterChange({ ...filter, customStartDate: value });
      } else {
        onFilterChange({ ...filter, customEndDate: value });
      }
    },
    [filter, onFilterChange]
  );

  /* 필터 초기화 */
  const resetFilters = useCallback(() => {
    onFilterChange({
      dateRange: 'thisMonth',
      categories: [],
      type: 'all',
      searchQuery: '',
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    filter.categories.length > 0 ||
    filter.type !== 'all' ||
    filter.searchQuery !== '' ||
    filter.dateRange !== 'thisMonth';

  return (
    <div className="space-y-4">
      {/* 메인 필터 바 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 검색 입력 */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-gray" />
          <input
            type="text"
            placeholder="거래 검색..."
            value={filter.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white placeholder:text-cosmic-gray/50 focus:outline-none focus:border-cosmic-blue/50 transition-colors"
          />
          {filter.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-gray hover:text-cosmic-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 날짜 범위 필터 */}
        <Dropdown
          label="기간"
          value={filter.dateRange}
          options={DATE_RANGE_OPTIONS}
          onChange={handleDateRangeChange}
          icon={Calendar}
        />

        {/* 거래 유형 필터 */}
        <Dropdown
          label="유형"
          value={filter.type}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
        />

        {/* 카테고리 필터 */}
        <CategoryFilter
          selectedCategories={filter.categories}
          onChange={handleCategoryChange}
        />

        {/* 필터 초기화 버튼 */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-cosmic-gray hover:text-cosmic-white hover:bg-cosmic-blue/20 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">초기화</span>
          </motion.button>
        )}
      </div>

      {/* 커스텀 날짜 범위 선택 */}
      <AnimatePresence>
        {filter.dateRange === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm text-cosmic-gray">시작일:</label>
              <input
                type="date"
                value={filter.customStartDate || ''}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="px-3 py-2 rounded-lg bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white focus:outline-none focus:border-cosmic-blue/50 transition-colors"
              />
            </div>
            <span className="text-cosmic-gray">~</span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-cosmic-gray">종료일:</label>
              <input
                type="date"
                value={filter.customEndDate || ''}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="px-3 py-2 rounded-lg bg-cosmic-dark/60 border border-cosmic-blue/20 text-cosmic-white focus:outline-none focus:border-cosmic-blue/50 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default FilterBar;
