"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, Loader2, RotateCcw, Wrench, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { streamChat } from "@/lib/api";
import type { ChatMessage, ChatStreamEvent } from "@/types";

interface ChatInterfaceProps {
  onClose: () => void;
}

/**
 * AI 어시스턴트 채팅 인터페이스
 * 
 * 우주/별자리 테마가 적용된 채팅 패널
 * - 실제 백엔드 API 연결 (SSE 스트리밍 + Function Calling)
 * - 대화 세션(conversationId) 관리
 * - 도구 사용 표시
 * - 에러 처리 및 재시도
 * - 글래스모피즘 디자인
 * - 메시지 버블 애니메이션
 * - 타이핑 인디케이터
 * - 자동 스크롤
 */
export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 MCP 캘린더 AI 어시스턴트입니다. 일정 관리와 가계부 기록을 도와드릴게요. '내일 오후 2시에 미팅 추가해줘' 또는 '커피 5000원 지출 기록해줘'라고 말씀해보세요! ✨",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, thinkingMessage]);

  // 입력창 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 컴포넌트 언마운트 시 스트리밍 중단
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // 인증 확인
  const isAuthenticated = useCallback(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }, []);

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isAuthenticated()) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "로그인이 필요합니다. 먼저 로그인해주세요.",
        timestamp: new Date(),
        isError: true,
      }]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setActiveTools([]);
    setThinkingMessage(null);

    // SSE 스트리밍으로 전송
    const toolsUsed: string[] = [];
    let fullContent = "";
    let receivedConversationId: string | undefined;

    abortControllerRef.current = streamChat(
      { message: currentInput, conversationId },
      // onEvent
      (event: ChatStreamEvent) => {
        switch (event.type) {
          case "thinking":
            setThinkingMessage(event.data);
            break;
          case "tool_call":
            if (event.toolName) {
              toolsUsed.push(event.toolName);
              setActiveTools([...toolsUsed]);
            }
            setThinkingMessage(event.data);
            break;
          case "tool_result":
            setThinkingMessage(null);
            break;
          case "content":
            setThinkingMessage(null);
            fullContent += event.data;
            setStreamingContent(fullContent);
            break;
          case "done":
            if (event.conversationId) {
              receivedConversationId = event.conversationId;
            }
            break;
          case "error":
            setThinkingMessage(null);
            setStreamingContent("");
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: event.data,
              timestamp: new Date(),
              isError: true,
            }]);
            setIsLoading(false);
            break;
        }
      },
      // onError
      (error: Error) => {
        setThinkingMessage(null);
        setStreamingContent("");
        setIsLoading(false);
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `연결 오류: ${error.message}`,
          timestamp: new Date(),
          isError: true,
        }]);
      },
      // onDone
      () => {
        setThinkingMessage(null);
        setIsLoading(false);

        if (receivedConversationId) {
          setConversationId(receivedConversationId);
        }

        if (fullContent) {
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fullContent,
            timestamp: new Date(),
            toolsUsed: toolsUsed.length > 0 ? [...toolsUsed] : undefined,
            functionCallCount: toolsUsed.length > 0 ? toolsUsed.length : undefined,
          }]);
          setStreamingContent("");
          setActiveTools([]);

          // 캘린더/가계부 도구가 사용되었으면 전역 이벤트 발행
          const calendarTools = ['create_event', 'update_event', 'delete_event'];
          const ledgerTools = ['create_transaction', 'update_transaction', 'delete_transaction'];
          if (toolsUsed.some(t => calendarTools.includes(t))) {
            window.dispatchEvent(new CustomEvent('calendar-updated'));
          }
          if (toolsUsed.some(t => ledgerTools.includes(t))) {
            window.dispatchEvent(new CustomEvent('ledger-updated'));
          }
        }
      }
    );
  };

  // 새 대화 시작
  const handleNewConversation = () => {
    abortControllerRef.current?.abort();
    setConversationId(undefined);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "새 대화를 시작합니다! 무엇을 도와드릴까요? ✨",
      timestamp: new Date(),
    }]);
    setStreamingContent("");
    setActiveTools([]);
    setThinkingMessage(null);
    setIsLoading(false);
    setInput("");
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex h-full flex-col bg-cosmic-dark/95 backdrop-blur-xl border-l border-cosmic-light/10"
    >
      {/* 헤더 */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-cosmic-light/10">
        {/* 상단 글로우 라인 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-cosmic-gold/50 to-transparent" />
        
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Sparkles className="h-5 w-5 text-cosmic-gold" />
            <div className="absolute inset-0 blur-sm bg-cosmic-gold/30" />
          </motion.div>
          <div>
            <h2 className="text-base font-semibold text-cosmic-white">AI 어시스턴트</h2>
            <p className="text-xs text-cosmic-gray">
              {conversationId ? "대화 진행 중" : "새 대화"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* 새 대화 버튼 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNewConversation}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cosmic-light/10 text-cosmic-gray hover:bg-cosmic-blue/20 hover:text-cosmic-light transition-colors"
            aria-label="새 대화"
            title="새 대화 시작"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cosmic-light/10 text-cosmic-gray hover:bg-cosmic-red/20 hover:text-cosmic-red transition-colors"
            aria-label="채팅 닫기"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cosmic-light/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} index={index} />
          ))}
        </AnimatePresence>

        {/* 활성 도구 표시 */}
        <AnimatePresence>
          {activeTools.length > 0 && isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-1.5 px-10"
            >
              {activeTools.map((tool, i) => (
                <span
                  key={`${tool}-${i}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cosmic-gold/15 text-cosmic-gold border border-cosmic-gold/20"
                >
                  <Wrench className="h-3 w-3" />
                  {tool}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 스트리밍 중인 콘텐츠 */}
        <AnimatePresence>
          {streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 flex-row"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-blue/30 to-cosmic-light/30">
                <Bot className="h-4 w-4 text-cosmic-light" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-cosmic-light/10 text-cosmic-white border border-cosmic-light/10 rounded-bl-md">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingContent}</p>
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-cosmic-light/60 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking 인디케이터 */}
        <AnimatePresence>
          {thinkingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-cosmic-gray"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-blue/30 to-cosmic-light/30">
                <Bot className="h-4 w-4 text-cosmic-light" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmic-light/10">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cosmic-light" />
                <span className="text-xs text-cosmic-gray">{thinkingMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 타이핑 인디케이터 (thinking 없을 때만) */}
        <AnimatePresence>
          {isLoading && !thinkingMessage && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-cosmic-gray"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-blue/30 to-cosmic-light/30">
                <Bot className="h-4 w-4 text-cosmic-light" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cosmic-light/10">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-cosmic-light/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl px-4 py-3",
                "bg-cosmic-light/5 border border-cosmic-light/20",
                "text-cosmic-white placeholder:text-cosmic-gray/50",
                "focus:border-cosmic-light/40 focus:ring-2 focus:ring-cosmic-light/20",
                "focus:outline-none transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            {/* 포커스 글로우 */}
            <div className="absolute inset-0 rounded-xl bg-cosmic-light/5 blur-xl opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex h-12 w-12 items-center justify-center",
              "rounded-xl",
              "bg-gradient-to-br from-cosmic-blue to-cosmic-light",
              "text-cosmic-white shadow-cosmic",
              "hover:shadow-cosmic-glow",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-cosmic",
              "transition-all duration-200"
            )}
            aria-label="전송"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>
        <p className="mt-2 text-xs text-cosmic-gray/50 text-center">
          Enter로 전송 • AI 응답은 참고용입니다
        </p>
      </div>
    </motion.div>
  );
}

/**
 * 메시지 버블 컴포넌트
 */
interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* 아바타 */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-gradient-to-br from-cosmic-gold/30 to-cosmic-gold/10"
            : message.isError
              ? "bg-gradient-to-br from-cosmic-red/30 to-cosmic-red/10"
              : "bg-gradient-to-br from-cosmic-blue/30 to-cosmic-light/30"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-cosmic-gold" />
        ) : message.isError ? (
          <AlertCircle className="h-4 w-4 text-cosmic-red" />
        ) : (
          <Bot className="h-4 w-4 text-cosmic-light" />
        )}
      </div>

      {/* 메시지 내용 */}
      <div className="max-w-[80%] space-y-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-gradient-to-br from-cosmic-blue to-cosmic-blue/80 text-cosmic-white rounded-br-md"
              : message.isError
                ? "bg-cosmic-red/10 text-cosmic-red border border-cosmic-red/20 rounded-bl-md"
                : "bg-cosmic-light/10 text-cosmic-white border border-cosmic-light/10 rounded-bl-md"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p
            className={cn(
              "mt-1 text-xs",
              isUser ? "text-cosmic-light/60 text-right" : "text-cosmic-gray/50"
            )}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>

        {/* 도구 사용 배지 */}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.toolsUsed.map((tool, i) => (
              <span
                key={`${tool}-${i}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-cosmic-gold/10 text-cosmic-gold/80 border border-cosmic-gold/15"
              >
                <Wrench className="h-2.5 w-2.5" />
                {tool}
              </span>
            ))}
            {message.functionCallCount && (
              <span className="text-[10px] text-cosmic-gray/50 self-center ml-1">
                {message.functionCallCount}회 호출
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * 타이핑 인디케이터 (점 3개 애니메이션)
 */
function TypingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="h-2 w-2 rounded-full bg-cosmic-light"
        />
      ))}
    </div>
  );
}

/**
 * 시간 포맷 함수
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default ChatInterface;
