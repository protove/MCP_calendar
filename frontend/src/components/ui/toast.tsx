"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toast 컴포넌트 시리즈 - 우주 테마 토스트 알림
 * 
 * 특징:
 * - 우주 테마에 맞는 색상과 스타일
 * - Framer Motion을 활용한 슬라이드인/아웃 애니메이션
 * - success, error, info, warning 타입 지원
 * - 자동 닫힘 타이머
 * - 커스텀 훅(useToast)을 통한 간편한 사용
 */

/* ========================================
 * 타입 정의
 * ======================================== */

/** 토스트 타입 */
export type ToastType = "success" | "error" | "info" | "warning";

/** 토스트 위치 */
export type ToastPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right";

/** 개별 토스트 데이터 */
export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

/** Toast Context 타입 */
interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/* ========================================
 * Toast Context 및 Provider
 * ======================================== */

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/** 고유 ID 생성 함수 */
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface ToastProviderProps {
  children: React.ReactNode;
  /** 토스트 표시 위치 */
  position?: ToastPosition;
  /** 최대 표시 개수 */
  maxToasts?: number;
}

/**
 * ToastProvider 컴포넌트 - 토스트 상태 관리 Provider
 * 
 * @example
 * // 앱 최상위에 Provider 추가
 * <ToastProvider position="top-right">
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  /** 토스트 추가 */
  const addToast = React.useCallback((toast: Omit<ToastData, "id">) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      duration: 5000, // 기본 5초
      dismissible: true,
      ...toast,
    };

    setToasts((prev) => {
      // 최대 개수 초과 시 가장 오래된 토스트 제거
      const updated = [...prev, newToast];
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts]);

  /** 토스트 제거 */
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /** 모든 토스트 제거 */
  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast, clearToasts }),
    [toasts, addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position={position} />
    </ToastContext.Provider>
  );
};

/* ========================================
 * useToast 훅 - 토스트 사용을 위한 커스텀 훅
 * ======================================== */

/**
 * useToast 훅 - 토스트 알림 표시
 * 
 * @example
 * const { toast, success, error, info, warning } = useToast();
 * 
 * // 기본 사용
 * toast({ type: "success", title: "성공!" });
 * 
 * // 편의 메서드
 * success("저장되었습니다");
 * error("오류가 발생했습니다");
 * info("알림 메시지");
 * warning("주의가 필요합니다");
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용 가능합니다.");
  }

  const { addToast, removeToast, clearToasts } = context;

  /** 기본 토스트 표시 */
  const toast = React.useCallback(
    (options: Omit<ToastData, "id">) => addToast(options),
    [addToast]
  );

  /** 성공 토스트 */
  const success = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    [addToast]
  );

  /** 에러 토스트 */
  const error = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    [addToast]
  );

  /** 정보 토스트 */
  const info = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    [addToast]
  );

  /** 경고 토스트 */
  const warning = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    [addToast]
  );

  return {
    toast,
    success,
    error,
    info,
    warning,
    removeToast,
    clearToasts,
  };
};

/* ========================================
 * Toast 스타일 variants
 * ======================================== */

const toastVariants = cva(
  [
    "relative flex items-start gap-3 w-full max-w-sm",
    "px-4 py-3 rounded-xl",
    "backdrop-blur-md",
    "border shadow-cosmic-lg",
    "overflow-hidden",
  ].join(" "),
  {
    variants: {
      type: {
        success: [
          "bg-cosmic-dark/90",
          "border-cosmic-gold/40",
          "shadow-[0_0_20px_rgba(242,191,145,0.2)]",
        ].join(" "),
        error: [
          "bg-cosmic-dark/90",
          "border-cosmic-red/50",
          "shadow-[0_0_20px_rgba(115,60,60,0.3)]",
        ].join(" "),
        info: [
          "bg-cosmic-dark/90",
          "border-cosmic-blue/40",
          "shadow-[0_0_20px_rgba(66,112,140,0.2)]",
        ].join(" "),
        warning: [
          "bg-cosmic-dark/90",
          "border-orange-500/40",
          "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/* 위치별 컨테이너 스타일 */
const positionStyles: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

/* ========================================
 * ToastContainer 컴포넌트 - 토스트 컨테이너
 * ======================================== */

interface ToastContainerProps {
  position: ToastPosition;
}

/**
 * ToastContainer 컴포넌트 - 토스트들을 표시하는 컨테이너
 */
const ToastContainer: React.FC<ToastContainerProps> = ({ position }) => {
  const context = React.useContext(ToastContext);
  
  if (!context) return null;

  const { toasts } = context;
  const isTop = position.startsWith("top");

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-3 pointer-events-none",
        positionStyles[position],
        isTop ? "flex-col" : "flex-col-reverse"
      )}
      aria-live="polite"
      aria-label="알림"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ========================================
 * ToastItem 컴포넌트 - 개별 토스트
 * ======================================== */

interface ToastItemProps {
  toast: ToastData;
  position: ToastPosition;
}

/**
 * ToastItem 컴포넌트 - 개별 토스트 아이템
 */
const ToastItem: React.FC<ToastItemProps> = ({ toast, position }) => {
  const context = React.useContext(ToastContext);
  const removeToast = context?.removeToast;
  const { id, type, title, description, duration, dismissible } = toast;

  // 자동 닫힘 타이머
  React.useEffect(() => {
    if (removeToast && duration && duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, removeToast]);

  if (!context) return null;

  const { removeToast: dismiss } = context;

  // 타입별 아이콘
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-cosmic-gold" />,
    error: <AlertCircle className="w-5 h-5 text-cosmic-red" />,
    info: <Info className="w-5 h-5 text-cosmic-light" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-400" />,
  };

  // 애니메이션 방향 계산
  const getSlideDirection = () => {
    if (position.includes("left")) return { x: -100 };
    if (position.includes("right")) return { x: 100 };
    if (position.includes("top")) return { y: -100 };
    return { y: 100 };
  };

  const slideDirection = getSlideDirection();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, ...slideDirection }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, ...slideDirection }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-auto"
    >
      <div className={cn(toastVariants({ type }))}>
        {/* 진행 바 (자동 닫힘 시) */}
        {duration && duration > 0 && (
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 h-1 rounded-full",
              type === "success" && "bg-cosmic-gold",
              type === "error" && "bg-cosmic-red",
              type === "info" && "bg-cosmic-light",
              type === "warning" && "bg-orange-400"
            )}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        )}

        {/* 아이콘 */}
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cosmic-white">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-cosmic-gray">{description}</p>
          )}
        </div>

        {/* 닫기 버튼 */}
        {dismissible && (
          <button
            onClick={() => dismiss(id)}
            className={cn(
              "flex-shrink-0",
              "p-1 rounded-lg",
              "text-cosmic-gray hover:text-cosmic-white",
              "hover:bg-cosmic-blue/20",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-cosmic-light/50"
            )}
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ========================================
 * 독립형 Toast 컴포넌트 (Provider 없이 사용)
 * ======================================== */

export interface StandaloneToastProps extends VariantProps<typeof toastVariants> {
  /** 표시 여부 */
  isVisible: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 자동 닫힘 시간 (ms) */
  duration?: number;
  /** 위치 */
  position?: ToastPosition;
  /** 닫기 버튼 표시 */
  dismissible?: boolean;
}

/**
 * Toast 컴포넌트 - 독립형 토스트 (Provider 없이 사용)
 * 
 * @example
 * const [isVisible, setIsVisible] = useState(false);
 * 
 * <Toast
 *   isVisible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   type="success"
 *   title="저장 완료"
 *   description="변경사항이 저장되었습니다."
 * />
 */
const Toast: React.FC<StandaloneToastProps> = ({
  isVisible,
  onClose,
  type = "info",
  title,
  description,
  duration = 5000,
  position = "top-right",
  dismissible = true,
}) => {
  // 자동 닫힘 타이머
  React.useEffect(() => {
    if (isVisible && duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // 타입별 아이콘
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-cosmic-gold" />,
    error: <AlertCircle className="w-5 h-5 text-cosmic-red" />,
    info: <Info className="w-5 h-5 text-cosmic-light" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-400" />,
  };

  // 애니메이션 방향 계산
  const getSlideDirection = () => {
    if (position.includes("left")) return { x: -100 };
    if (position.includes("right")) return { x: 100 };
    if (position.includes("top")) return { y: -100 };
    return { y: 100 };
  };

  const slideDirection = getSlideDirection();

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className={cn(
            "fixed z-[100] pointer-events-none",
            positionStyles[position]
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, ...slideDirection }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, ...slideDirection }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-auto"
          >
            <div className={cn(toastVariants({ type }))}>
              {/* 진행 바 */}
              {duration && duration > 0 && (
                <motion.div
                  className={cn(
                    "absolute bottom-0 left-0 h-1 rounded-full",
                    type === "success" && "bg-cosmic-gold",
                    type === "error" && "bg-cosmic-red",
                    type === "info" && "bg-cosmic-light",
                    type === "warning" && "bg-orange-400"
                  )}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              )}

              {/* 아이콘 */}
              <div className="flex-shrink-0 mt-0.5">
                {icons[type as ToastType]}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cosmic-white">{title}</p>
                {description && (
                  <p className="mt-1 text-xs text-cosmic-gray">{description}</p>
                )}
              </div>

              {/* 닫기 버튼 */}
              {dismissible && (
                <button
                  onClick={onClose}
                  className={cn(
                    "flex-shrink-0",
                    "p-1 rounded-lg",
                    "text-cosmic-gray hover:text-cosmic-white",
                    "hover:bg-cosmic-blue/20",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cosmic-light/50"
                  )}
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Toast.displayName = "Toast";

export {
  Toast,
  ToastContainer,
  toastVariants,
};
