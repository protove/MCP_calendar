"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * AI 어시스턴트 채팅 인터페이스
 * 
 * 우주/별자리 테마가 적용된 채팅 패널
 * - 글래스모피즘 디자인
 * - 메시지 버블 애니메이션
 * - 타이핑 인디케이터
 * - 자동 스크롤
 */
export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 저는 MCP 캘린더 AI 어시스턴트입니다. 일정 관리와 가계부 기록을 도와드릴게요. '내일 오후 2시에 미팅 추가해줘' 또는 '커피 5000원 지출 기록해줘'라고 말씀해보세요! ✨",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 입력창 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Mock AI 응답 (실제로는 API 호출)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Mock 응답 생성
  const generateMockResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("일정") || lowerInput.includes("미팅")) {
      return "일정을 확인했어요! 📅 캘린더에 추가할까요? 정확한 시간과 제목을 알려주시면 바로 등록해 드릴게요.";
    }
    if (lowerInput.includes("지출") || lowerInput.includes("원")) {
      return "지출 내역을 기록했어요! 💰 가계부에서 확인하실 수 있습니다. 다른 기록할 내용이 있으신가요?";
    }
    if (lowerInput.includes("안녕")) {
      return "반갑습니다! 오늘 하루도 빛나는 하루 되세요 ✨ 무엇을 도와드릴까요?";
    }
    return `'${userInput}'에 대해 이해했어요. 더 자세히 알려주시면 더 정확하게 도움을 드릴 수 있어요! 🚀`;
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
            <p className="text-xs text-cosmic-gray">항상 도움 준비 완료</p>
          </div>
        </div>
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

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cosmic-light/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} index={index} />
          ))}
        </AnimatePresence>

        {/* 타이핑 인디케이터 */}
        <AnimatePresence>
          {isTyping && (
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
              disabled={isTyping}
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
            disabled={!input.trim() || isTyping}
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
            {isTyping ? (
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
  message: Message;
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
            : "bg-gradient-to-br from-cosmic-blue/30 to-cosmic-light/30"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-cosmic-gold" />
        ) : (
          <Bot className="h-4 w-4 text-cosmic-light" />
        )}
      </div>

      {/* 메시지 내용 */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-gradient-to-br from-cosmic-blue to-cosmic-blue/80 text-cosmic-white rounded-br-md"
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
