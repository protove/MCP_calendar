"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge 컴포넌트 - 우주 테마 배지/태그
 * 
 * 특징:
 * - 다양한 variant 지원 (default, success, warning, error, info)
 * - 우주 테마에 맞는 색상과 glow 효과
 * - 크기 variant 지원
 * - 닫기 버튼 옵션
 */

/* Badge 스타일 variants 정의 */
const badgeVariants = cva(
  // 기본 스타일
  [
    "inline-flex items-center justify-center",
    "font-medium",
    "rounded-full",
    "transition-all duration-200",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      /* 스타일 variants */
      variant: {
        // 기본 스타일 - 우주 블루
        default: [
          "bg-cosmic-blue/20 text-cosmic-light",
          "border border-cosmic-blue/40",
        ].join(" "),
        
        // 성공 스타일 - 그린
        success: [
          "bg-green-500/20 text-green-400",
          "border border-green-500/40",
        ].join(" "),
        
        // 경고 스타일 - 골드
        warning: [
          "bg-cosmic-gold/20 text-cosmic-gold",
          "border border-cosmic-gold/40",
        ].join(" "),
        
        // 에러 스타일 - 레드
        error: [
          "bg-cosmic-red/20 text-red-400",
          "border border-cosmic-red/40",
        ].join(" "),
        
        // 정보 스타일 - 라이트 블루
        info: [
          "bg-cyan-500/20 text-cyan-400",
          "border border-cyan-500/40",
        ].join(" "),
        
        // 보조 스타일 - 그레이
        secondary: [
          "bg-cosmic-gray/20 text-cosmic-gray",
          "border border-cosmic-gray/40",
        ].join(" "),
        
        // 골드 포인트 스타일
        gold: [
          "bg-cosmic-gold/20 text-cosmic-gold",
          "border border-cosmic-gold/40",
          "shadow-[0_0_10px_rgba(242,191,145,0.3)]",
        ].join(" "),
        
        // 아웃라인 스타일
        outline: [
          "bg-transparent text-cosmic-white",
          "border border-cosmic-blue/50",
        ].join(" "),
        
        // 채워진 스타일
        solid: [
          "bg-cosmic-blue text-cosmic-white",
          "border border-cosmic-blue",
        ].join(" "),
      },
      
      /* 크기 variants */
      size: {
        xs: "px-2 py-0.5 text-xs",
        sm: "px-2.5 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-sm",
      },
      
      /* Glow 효과 */
      glow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Glow 효과 + variant 조합
      { glow: true, variant: "default", className: "shadow-[0_0_10px_rgba(66,112,140,0.4)]" },
      { glow: true, variant: "success", className: "shadow-[0_0_10px_rgba(34,197,94,0.4)]" },
      { glow: true, variant: "warning", className: "shadow-[0_0_10px_rgba(242,191,145,0.4)]" },
      { glow: true, variant: "error", className: "shadow-[0_0_10px_rgba(115,60,60,0.4)]" },
      { glow: true, variant: "info", className: "shadow-[0_0_10px_rgba(34,211,238,0.4)]" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
);

/* Badge 컴포넌트 Props 타입 정의 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** 닫기 버튼 클릭 핸들러 (제공 시 닫기 버튼 표시) */
  onClose?: () => void;
  /** 왼쪽 아이콘/도트 */
  leftIcon?: React.ReactNode;
  /** 상태 도트 표시 */
  dot?: boolean;
  /** 도트 색상 (dot이 true일 때 사용) */
  dotColor?: "default" | "success" | "warning" | "error";
}

/**
 * Badge 컴포넌트 - 상태/카테고리 표시용 배지
 * 
 * @example
 * // 기본 사용
 * <Badge>기본</Badge>
 * 
 * // Variant 적용
 * <Badge variant="success">완료</Badge>
 * <Badge variant="error">오류</Badge>
 * 
 * // Glow 효과
 * <Badge variant="gold" glow>VIP</Badge>
 * 
 * // 닫기 버튼
 * <Badge onClose={() => console.log('closed')}>태그</Badge>
 * 
 * // 도트 표시
 * <Badge dot dotColor="success">온라인</Badge>
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      onClose,
      leftIcon,
      dot,
      dotColor = "default",
      children,
      ...props
    },
    ref
  ) => {
    const dotColors = {
      default: "bg-cosmic-light",
      success: "bg-green-400",
      warning: "bg-cosmic-gold",
      error: "bg-red-400",
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, glow }), className)}
        {...props}
      >
        {/* 상태 도트 */}
        {dot && (
          <span
            className={cn(
              "w-2 h-2 rounded-full mr-1.5 animate-pulse",
              dotColors[dotColor]
            )}
          />
        )}

        {/* 왼쪽 아이콘 */}
        {leftIcon && <span className="mr-1.5">{leftIcon}</span>}

        {/* 배지 내용 */}
        {children}

        {/* 닫기 버튼 */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "ml-1.5 -mr-1",
              "hover:bg-white/10 rounded-full",
              "transition-colors duration-150",
              "focus:outline-none"
            )}
            aria-label="제거"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/* ========================================
 * BadgeGroup 컴포넌트 - 여러 배지 그룹
 * ======================================== */

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 배지 사이 간격 */
  gap?: "xs" | "sm" | "default" | "lg";
}

/**
 * BadgeGroup 컴포넌트 - 여러 배지를 묶어서 표시
 */
const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, gap = "default", children, ...props }, ref) => {
    const gapClasses = {
      xs: "gap-1",
      sm: "gap-1.5",
      default: "gap-2",
      lg: "gap-3",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center", gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = "BadgeGroup";

/* ========================================
 * StatusBadge 컴포넌트 - 상태 표시 배지
 * ======================================== */

export interface StatusBadgeProps {
  /** 상태 */
  status: "online" | "offline" | "away" | "busy";
  /** 크기 */
  size?: "sm" | "default" | "lg";
  /** 추가 클래스 */
  className?: string;
  /** 텍스트 표시 여부 */
  showText?: boolean;
}

/**
 * StatusBadge 컴포넌트 - 온라인/오프라인 등 상태 표시
 */
const StatusBadge = React.memo<StatusBadgeProps>(
  ({ status, size = "default", className, showText = true }) => {
    const statusConfig = {
      online: {
        color: "bg-green-400",
        text: "온라인",
        textColor: "text-green-400",
      },
      offline: {
        color: "bg-cosmic-gray",
        text: "오프라인",
        textColor: "text-cosmic-gray",
      },
      away: {
        color: "bg-cosmic-gold",
        text: "자리비움",
        textColor: "text-cosmic-gold",
      },
      busy: {
        color: "bg-cosmic-red",
        text: "바쁨",
        textColor: "text-cosmic-red",
      },
    };

    const sizeClasses = {
      sm: { dot: "w-2 h-2", text: "text-xs" },
      default: { dot: "w-2.5 h-2.5", text: "text-sm" },
      lg: { dot: "w-3 h-3", text: "text-base" },
    };

    const config = statusConfig[status];
    const sizes = sizeClasses[size];

    return (
      <span
        className={cn("inline-flex items-center gap-2", className)}
      >
        <span
          className={cn(
            "rounded-full animate-pulse",
            config.color,
            sizes.dot
          )}
        />
        {showText && (
          <span className={cn(sizes.text, config.textColor)}>
            {config.text}
          </span>
        )}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

/* ========================================
 * CountBadge 컴포넌트 - 숫자 배지
 * ======================================== */

export interface CountBadgeProps {
  /** 표시할 숫자 */
  count: number;
  /** 최대 표시 숫자 (초과 시 +로 표시) */
  max?: number;
  /** 0일 때 표시 여부 */
  showZero?: boolean;
  /** 크기 */
  size?: "xs" | "sm" | "default";
  /** 변형 */
  variant?: "default" | "error" | "gold";
  /** 추가 클래스 */
  className?: string;
}

/**
 * CountBadge 컴포넌트 - 알림 숫자 등 표시
 */
const CountBadge = React.memo<CountBadgeProps>(
  ({
    count,
    max = 99,
    showZero = false,
    size = "default",
    variant = "default",
    className,
  }) => {
    // 0이고 showZero가 false면 렌더링하지 않음
    if (count === 0 && !showZero) return null;

    const displayCount = count > max ? `${max}+` : count;

    const sizeClasses = {
      xs: "min-w-4 h-4 text-[10px] px-1",
      sm: "min-w-5 h-5 text-xs px-1.5",
      default: "min-w-6 h-6 text-xs px-2",
    };

    const variantClasses = {
      default: "bg-cosmic-blue text-cosmic-white",
      error: "bg-cosmic-red text-cosmic-white",
      gold: "bg-cosmic-gold text-cosmic-dark",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "font-medium rounded-full",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {displayCount}
      </span>
    );
  }
);

CountBadge.displayName = "CountBadge";

/* ========================================
 * PriorityBadge 컴포넌트 - 우선순위 배지
 * ======================================== */

export interface PriorityBadgeProps {
  /** 우선순위 레벨 */
  priority: "low" | "medium" | "high" | "urgent";
  /** 크기 */
  size?: "sm" | "default";
  /** 추가 클래스 */
  className?: string;
}

/**
 * PriorityBadge 컴포넌트 - 작업 우선순위 표시
 */
const PriorityBadge = React.memo<PriorityBadgeProps>(
  ({ priority, size = "default", className }) => {
    const priorityConfig = {
      low: { label: "낮음", variant: "secondary" as const },
      medium: { label: "보통", variant: "info" as const },
      high: { label: "높음", variant: "warning" as const },
      urgent: { label: "긴급", variant: "error" as const },
    };

    const config = priorityConfig[priority];

    return (
      <Badge
        variant={config.variant}
        size={size}
        glow={priority === "urgent"}
        className={className}
      >
        {config.label}
      </Badge>
    );
  }
);

PriorityBadge.displayName = "PriorityBadge";

export {
  Badge,
  badgeVariants,
  BadgeGroup,
  StatusBadge,
  CountBadge,
  PriorityBadge,
};
