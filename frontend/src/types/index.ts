export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

/* 캘린더 이벤트 카테고리 타입 - 우주 테마 색상 적용 */
export type EventCategory = 
  | 'work'      // 업무 - 코스믹 블루
  | 'personal'  // 개인 - 코스믹 골드
  | 'meeting'   // 미팅 - 코스믹 라이트
  | 'important' // 중요 - 코스믹 레드
  | 'other';    // 기타 - 코스믹 그레이

/* 캘린더 이벤트 확장 타입 */
export interface CalendarEvent extends Event {
  category?: EventCategory;
  color?: string;
  allDay?: boolean;
}

/* 이벤트 폼 데이터 타입 */
export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  allDay: boolean;
}

/* 이벤트 모달 모드 */
export type EventModalMode = 'view' | 'create' | 'edit';

export interface Transaction {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}