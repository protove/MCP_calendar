"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Modal 컴포넌트 - 우주 테마 모달 다이얼로그
 * 
 * 특징:
 * - 우주 테마에 맞는 반투명 오버레이와 glow 효과
 * - Framer Motion을 활용한 부드러운 열기/닫기 애니메이션
 * - 제목, 내용, 푸터 구조로 구성
 * - ESC 키 및 오버레이 클릭으로 닫기 지원
 * - 포커스 트랩 및 접근성 지원
 */

/* Modal 크기 variants */
const modalVariants = cva(
  [
    "relative w-full mx-4",
    "bg-cosmic-card-gradient backdrop-blur-md",
    "border border-cosmic-blue/30",
    "rounded-2xl shadow-cosmic-lg",
    "overflow-hidden",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

/* Modal Context - 모달 상태 공유 */
interface ModalContextType {
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal 컴포넌트 내부에서만 사용 가능합니다.");
  }
  return context;
};

/* ========================================
 * Modal 컴포넌트 - 메인 모달 컨테이너
 * ======================================== */

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 오버레이 클릭으로 닫기 허용 */
  closeOnOverlayClick?: boolean;
  /** ESC 키로 닫기 허용 */
  closeOnEsc?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
}

/**
 * Modal 컴포넌트 - 메인 모달
 * 
 * @example
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalHeader>
 *     <ModalTitle>제목</ModalTitle>
 *   </ModalHeader>
 *   <ModalBody>내용</ModalBody>
 *   <ModalFooter>
 *     <Button onClick={() => setIsOpen(false)}>닫기</Button>
 *   </ModalFooter>
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  showCloseButton = true,
}) => {
  // ESC 키 이벤트 핸들러
  React.useEffect(() => {
    if (!closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  // 모달 열릴 때 body 스크롤 방지
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 (배경) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-cosmic-dark/80 backdrop-blur-sm"
              onClick={handleOverlayClick}
              aria-hidden="true"
            />

            {/* 모달 컨테이너 */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={handleOverlayClick}
              role="dialog"
              aria-modal="true"
            >
              {/* 모달 박스 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(modalVariants({ size }), className)}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 닫기 버튼 */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "absolute top-4 right-4 z-10",
                      "p-2 rounded-lg",
                      "text-cosmic-gray hover:text-cosmic-white",
                      "hover:bg-cosmic-blue/20",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-cosmic-light/50"
                    )}
                    aria-label="닫기"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Glow 효과 (장식) */}
                <div className="absolute -inset-px bg-gradient-to-r from-cosmic-blue/20 via-cosmic-light/10 to-cosmic-blue/20 rounded-2xl blur-sm opacity-50 -z-10" />

                {children}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

Modal.displayName = "Modal";

/* ========================================
 * ModalHeader 컴포넌트 - 모달 헤더
 * ======================================== */

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 하단 구분선 표시 */
  withBorder?: boolean;
}

/**
 * ModalHeader 컴포넌트 - 모달 상단 헤더 영역
 */
const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, withBorder = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4",
          withBorder && "border-b border-cosmic-blue/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalHeader.displayName = "ModalHeader";

/* ========================================
 * ModalTitle 컴포넌트 - 모달 제목
 * ======================================== */

/**
 * ModalTitle 컴포넌트 - 모달 제목 텍스트
 */
const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "text-xl font-semibold text-cosmic-white",
        className
      )}
      {...props}
    />
  );
});

ModalTitle.displayName = "ModalTitle";

/* ========================================
 * ModalDescription 컴포넌트 - 모달 설명
 * ======================================== */

/**
 * ModalDescription 컴포넌트 - 모달 부제목/설명
 */
const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("mt-1 text-sm text-cosmic-gray", className)}
      {...props}
    />
  );
});

ModalDescription.displayName = "ModalDescription";

/* ========================================
 * ModalBody 컴포넌트 - 모달 본문
 * ======================================== */

/**
 * ModalBody 컴포넌트 - 모달 메인 컨텐츠 영역
 */
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-6 py-4",
        "text-cosmic-white/90",
        "max-h-[60vh] overflow-y-auto",
        // 커스텀 스크롤바 스타일
        "scrollbar-thin scrollbar-track-cosmic-dark/50 scrollbar-thumb-cosmic-blue/50",
        className
      )}
      {...props}
    />
  );
});

ModalBody.displayName = "ModalBody";

/* ========================================
 * ModalFooter 컴포넌트 - 모달 푸터
 * ======================================== */

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 상단 구분선 표시 */
  withBorder?: boolean;
}

/**
 * ModalFooter 컴포넌트 - 모달 하단 푸터 영역 (버튼 등)
 */
const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, withBorder = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4",
          "flex items-center justify-end gap-3",
          withBorder && "border-t border-cosmic-blue/20",
          className
        )}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = "ModalFooter";

/* ========================================
 * ConfirmModal 컴포넌트 - 확인 모달
 * ======================================== */

export interface ConfirmModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 확인 버튼 클릭 콜백 */
  onConfirm: () => void;
  /** 제목 */
  title: string;
  /** 설명/내용 */
  description?: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 타입 (위험한 작업인지) */
  variant?: "default" | "danger";
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * ConfirmModal 컴포넌트 - 확인/취소 모달
 * 
 * @example
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="삭제 확인"
 *   description="정말로 삭제하시겠습니까?"
 *   variant="danger"
 * />
 */
const ConfirmModal = React.memo<ConfirmModalProps>(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소",
    variant = "default",
    isLoading = false,
  }) => {
    const confirmButtonClass = variant === "danger"
      ? "bg-cosmic-red hover:bg-cosmic-red/80"
      : "bg-cosmic-blue hover:bg-cosmic-light";

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
        <ModalHeader withBorder={false}>
          <ModalTitle>{title}</ModalTitle>
          {description && (
            <ModalDescription>{description}</ModalDescription>
          )}
        </ModalHeader>

        <ModalFooter withBorder={false}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg",
              "text-cosmic-gray hover:text-cosmic-white",
              "hover:bg-cosmic-blue/20",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg",
              "text-cosmic-white font-medium",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              confirmButtonClass
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
);

ConfirmModal.displayName = "ConfirmModal";

/* ========================================
 * AlertModal 컴포넌트 - 알림 모달
 * ======================================== */

export interface AlertModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 제목 */
  title: string;
  /** 설명/내용 */
  description?: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 알림 타입 */
  type?: "info" | "success" | "warning" | "error";
}

/**
 * AlertModal 컴포넌트 - 단순 알림 모달
 */
const AlertModal = React.memo<AlertModalProps>(
  ({
    isOpen,
    onClose,
    title,
    description,
    confirmText = "확인",
    type = "info",
  }) => {
    const typeStyles = {
      info: "text-cosmic-light",
      success: "text-green-400",
      warning: "text-cosmic-gold",
      error: "text-cosmic-red",
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
        <ModalHeader withBorder={false}>
          <ModalTitle className={typeStyles[type]}>{title}</ModalTitle>
          {description && (
            <ModalDescription>{description}</ModalDescription>
          )}
        </ModalHeader>

        <ModalFooter withBorder={false} className="justify-center">
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 rounded-lg",
              "bg-cosmic-blue hover:bg-cosmic-light",
              "text-cosmic-white font-medium",
              "transition-colors duration-200"
            )}
          >
            {confirmText}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
);

AlertModal.displayName = "AlertModal";

export {
  Modal,
  modalVariants,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  AlertModal,
  useModalContext,
};
