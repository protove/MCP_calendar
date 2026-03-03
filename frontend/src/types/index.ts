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

/* ========== Chat Types ========== */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  functionCallCount?: number;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: string;
  toolsUsed?: string[];
  functionCallCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  timestamp: string;
}

export interface ChatStreamEvent {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'content' | 'done' | 'error';
  data: string;
  toolName?: string;
  conversationId?: string;
}