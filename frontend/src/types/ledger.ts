/**
 * 가계부(Ledger) 관련 타입 정의
 * 우주 테마 컬러와 카테고리 매핑 포함
 */

/* 거래 유형 */
export type TransactionType = 'income' | 'expense';

/* 거래 카테고리 */
export type TransactionCategory =
  | 'food'        // 식비
  | 'transport'   // 교통
  | 'shopping'    // 쇼핑
  | 'salary'      // 월급
  | 'sideIncome'  // 부수입
  | 'fixed'       // 고정지출
  | 'leisure'     // 여가
  | 'other';      // 기타

/* 카테고리 정보 타입 */
export interface CategoryInfo {
  id: TransactionCategory;
  label: string;
  labelKo: string;
  color: string;
  bgColor: string;
  icon: string;
  type: TransactionType;
}

/* 카테고리별 정보 매핑 */
export const CATEGORY_INFO: Record<TransactionCategory, CategoryInfo> = {
  food: {
    id: 'food',
    label: 'Food',
    labelKo: '식비',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    icon: '🍔',
    type: 'expense',
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    labelKo: '교통',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: '🚌',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    labelKo: '쇼핑',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    icon: '🛍️',
    type: 'expense',
  },
  salary: {
    id: 'salary',
    label: 'Salary',
    labelKo: '월급',
    color: '#F2BF91',
    bgColor: 'rgba(242, 191, 145, 0.15)',
    icon: '💰',
    type: 'income',
  },
  sideIncome: {
    id: 'sideIncome',
    label: 'Side Income',
    labelKo: '부수입',
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    icon: '💵',
    type: 'income',
  },
  fixed: {
    id: 'fixed',
    label: 'Fixed',
    labelKo: '고정지출',
    color: '#9BADB8',
    bgColor: 'rgba(155, 173, 184, 0.15)',
    icon: '📋',
    type: 'expense',
  },
  leisure: {
    id: 'leisure',
    label: 'Leisure',
    labelKo: '여가',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    icon: '🎮',
    type: 'expense',
  },
  other: {
    id: 'other',
    label: 'Other',
    labelKo: '기타',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    icon: '📦',
    type: 'expense',
  },
};

/* 거래 데이터 타입 */
export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  memo?: string;
  createdAt: string;
  updatedAt?: string;
}

/* 거래 폼 데이터 타입 */
export interface TransactionFormData {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  memo?: string;
}

/* 필터 상태 타입 */
export interface FilterState {
  dateRange: DateRangeType;
  customStartDate?: string;
  customEndDate?: string;
  categories: TransactionCategory[];
  type: TransactionType | 'all';
  searchQuery: string;
}

/* 날짜 범위 타입 */
export type DateRangeType = 'thisMonth' | 'lastMonth' | 'last3Months' | 'custom';

/* 정렬 옵션 */
export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

/* 요약 통계 타입 */
export interface LedgerSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

/* 차트 데이터 타입 */
export interface ChartDataItem {
  name: string;
  nameKo: string;
  value: number;
  color: string;
  percentage: number;
}

/* 월별 차트 데이터 타입 */
export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

/* 모달 모드 */
export type TransactionModalMode = 'create' | 'edit' | 'view';

/* 소득 카테고리 목록 */
export const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'sideIncome'];

/* 지출 카테고리 목록 */
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'shopping',
  'fixed',
  'leisure',
  'other',
];

/* 모든 카테고리 목록 */
export const ALL_CATEGORIES: TransactionCategory[] = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

/* 유틸리티: 카테고리별 색상 가져오기 */
export const getCategoryColor = (category: TransactionCategory): string => {
  return CATEGORY_INFO[category]?.color || '#6B7280';
};

/* 유틸리티: 카테고리별 한국어 라벨 가져오기 */
export const getCategoryLabel = (category: TransactionCategory): string => {
  return CATEGORY_INFO[category]?.labelKo || '기타';
};

/* 유틸리티: 카테고리별 아이콘 가져오기 */
export const getCategoryIcon = (category: TransactionCategory): string => {
  return CATEGORY_INFO[category]?.icon || '📦';
};
