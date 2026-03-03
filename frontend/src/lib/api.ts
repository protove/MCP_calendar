import axios from 'axios';
import { ChatRequest, ChatResponse, ApiResponse, ChatStreamEvent } from '@/types';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Chat API
export const chatApi = {
  sendMessage: (request: ChatRequest) =>
    api.post<ApiResponse<ChatResponse>>('/chat', request),

  clearConversation: (conversationId: string) =>
    api.delete<ApiResponse<void>>(`/chat/${conversationId}`),

  healthCheck: () =>
    api.get<ApiResponse<{ status: string; geminiConfigured: boolean }>>('/chat/health'),
};

// SSE streaming helper
export function streamChat(
  request: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  onError: (error: Error) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  fetch(`${apiUrl}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
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
              // plain text chunk
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

  return controller;
}