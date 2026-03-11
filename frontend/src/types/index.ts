export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Event {
  id: string;
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

/* 캘린더 이벤트 확장 타입 — 백엔드 EventResponse 매핑 */
export interface CalendarEvent extends Event {
  category?: EventCategory;
  color?: string;
  allDay?: boolean;
  updatedAt?: string;
  durationMinutes?: number;
  isMultiDay?: boolean;
  isPast?: boolean;
}

/* 백엔드 EventResponse → CalendarEvent 변환 */
export function toCalendarEvent(raw: Record<string, unknown>): CalendarEvent {
  return {
    id: String(raw.id),
    title: raw.title as string,
    description: raw.description as string | undefined,
    location: raw.location as string | undefined,
    startTime: raw.startTime as string,
    endTime: raw.endTime as string,
    category: (raw.category as EventCategory) || 'other',
    allDay: raw.allDay as boolean | undefined,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string | undefined,
    durationMinutes: raw.durationMinutes as number | undefined,
    isMultiDay: raw.isMultiDay as boolean | undefined,
    isPast: raw.isPast as boolean | undefined,
  };
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

/** @deprecated ledger.ts의 LedgerTransaction / TransactionResponse를 사용하세요 */
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

/* ============================================
   채팅 관련 타입
   ============================================ */

/* 채팅 메시지 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  functionCallCount?: number;
  isError?: boolean;
  isStreaming?: boolean;
}

/* 채팅 요청 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

/* 채팅 응답 */
export interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: string;
  toolsUsed?: string[];
  functionCallCount?: number;
}

/* API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/* SSE 스트리밍 이벤트 */
export interface ChatStreamEvent {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'content' | 'done' | 'error';
  data: string;
  toolName?: string;
  conversationId?: string;
}

/* ============================================
   날씨 관련 타입
   ============================================ */

export type WeatherCondition = 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'snowy' | 'foggy';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionText: string;
  humidity: number;
  windSpeed: number;
  recommendation: string;
  city: string;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition;
  conditionText: string;
}

export interface WeatherForecastResponse {
  city: string;
  forecasts: DailyForecast[];
}

