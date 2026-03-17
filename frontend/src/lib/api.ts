import axios from 'axios';
import { ChatRequest, ChatResponse, ApiResponse, ChatStreamEvent, AuthResponse, WeatherData, WeatherForecastResponse, CalendarEvent, EventFormData, toCalendarEvent } from '@/types';
import type { TransactionResponse, TransactionSummaryResponse, CreateTransactionRequest } from '@/types/ledger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
}

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuthData();
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
        const authData = res.data.data;

        if (authData) {
          saveAuthData(authData);
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
          processQueue(null, authData.accessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh response has no data');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthData();
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password }),

  logout: () =>
    api.post<ApiResponse<void>>('/auth/logout'),

  me: () =>
    api.get<ApiResponse<{ id: number; email: string; name: string; role: string }>>('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),
};

// 토큰 & 사용자 정보 저장 유틸
export function saveAuthData(data: AuthResponse) {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getStoredUser(): { id: number; email: string; name: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Event API (인증 필요)
export const eventApi = {
  /** 전체 일정 조회 */
  getAll: () =>
    api.get<ApiResponse<Record<string, unknown>[]>>('/events').then(res => ({
      ...res,
      data: { ...res.data, data: res.data.data?.map(toCalendarEvent) },
    })),

  /** 월별 일정 조회 */
  getMonthly: (year: number, month: number) =>
    api.get<ApiResponse<Record<string, unknown>[]>>('/events/monthly', { params: { year, month } }).then(res => ({
      ...res,
      data: { ...res.data, data: res.data.data?.map(toCalendarEvent) },
    })),

  /** 일정 단건 조회 */
  get: (id: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/events/${id}`).then(res => ({
      ...res,
      data: { ...res.data, data: res.data.data ? toCalendarEvent(res.data.data) : undefined },
    })),

  /** 일정 생성 */
  create: (data: EventFormData) =>
    api.post<ApiResponse<Record<string, unknown>>>('/events', data).then(res => ({
      ...res,
      data: { ...res.data, data: res.data.data ? toCalendarEvent(res.data.data) : undefined },
    })),

  /** 일정 수정 */
  update: (id: string, data: Partial<EventFormData>) =>
    api.put<ApiResponse<Record<string, unknown>>>(`/events/${id}`, data).then(res => ({
      ...res,
      data: { ...res.data, data: res.data.data ? toCalendarEvent(res.data.data) : undefined },
    })),

  /** 일정 삭제 */
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/events/${id}`),
};

// Weather API (인증 불필요)
export const weatherApi = {
  getCurrentWeather: (city: string = 'Seoul') =>
    api.get<ApiResponse<WeatherData>>(`/weather/current`, { params: { city } }),

  getForecast: (city: string = 'Seoul', days: number = 3) =>
    api.get<ApiResponse<WeatherForecastResponse>>(`/weather/forecast`, { params: { city, days } }),

  getRecommendation: (city: string = 'Seoul') =>
    api.get<ApiResponse<{ recommendation: string }>>(`/weather/recommendation`, { params: { city } }),
};

// Transaction API (인증 필요)
export const transactionApi = {
  /** 전체 거래 조회 */
  getAll: () =>
    api.get<ApiResponse<TransactionResponse[]>>('/transactions'),

  /** 월별 거래 조회 */
  getMonthly: (year: number, month: number) =>
    api.get<ApiResponse<TransactionResponse[]>>('/transactions/monthly', { params: { year, month } }),

  /** 월별 거래 요약 (총 수입/지출/잔액/건수) */
  getSummary: (year: number, month: number) =>
    api.get<ApiResponse<TransactionSummaryResponse>>('/transactions/summary', { params: { year, month } }),

  /** 거래 단건 조회 */
  get: (id: string) =>
    api.get<ApiResponse<TransactionResponse>>(`/transactions/${id}`),

  /** 거래 생성 */
  create: (data: CreateTransactionRequest) =>
    api.post<ApiResponse<TransactionResponse>>('/transactions', data),

  /** 거래 수정 */
  update: (id: string, data: Partial<CreateTransactionRequest>) =>
    api.put<ApiResponse<TransactionResponse>>(`/transactions/${id}`, data),

  /** 거래 삭제 */
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/transactions/${id}`),
};

// Chat API
export const chatApi = {
  sendMessage: (request: ChatRequest) =>
    api.post<ApiResponse<ChatResponse>>('/chat', request),

  clearConversation: (conversationId: string) =>
    api.delete<ApiResponse<void>>(`/chat/${conversationId}`),

  healthCheck: () =>
    api.get<ApiResponse<{ status: string; geminiConfigured: boolean }>>('/chat/health'),
};

// Token refresh helper for non-axios requests (e.g., fetch-based SSE)
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    const authData = res.data.data;
    if (authData) {
      saveAuthData(authData);
      return authData.accessToken;
    }
    return null;
  } catch {
    clearAuthData();
    return null;
  }
}

// SSE streaming helper
export function streamChat(
  request: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  onError: (error: Error) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const doFetch = (accessToken: string | null) => {
    fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              doFetch(newToken);
              return;
            }
            if (typeof window !== 'undefined') {
              clearAuthData();
              if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
              }
            }
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data === '[DONE]') {
                onDone();
                return;
              }
              try {
                const event: ChatStreamEvent = JSON.parse(data);
                onEvent(event);
              } catch {
                onEvent({ type: 'content', data });
              }
            }
          }
        }
        onDone();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          onError(error);
        }
      });
  };

  doFetch(typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  return controller;
}