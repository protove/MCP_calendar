"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button 컴포넌트 - 우주 테마 버튼
 * 
 * 특징:
 * - 우주 테마에 맞는 색상과 그라데이션
 * - 호버 시 코스믹 글로우 효과
 * - 다양한 variants와 크기 지원
 * - 접근성을 위한 포커스 상태
 */

/* Button 스타일 variants 정의 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-lg",
    "text-sm font-medium",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-light focus-visible:ring-offset-2 focus-visible:ring-offset-cosmic-dark",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* 기본 - 우주 블루 그라데이션 */
        default: [
          "bg-gradient-to-r from-cosmic-blue to-cosmic-light",
          "text-cosmic-white",
          "border border-cosmic-light/30",
          "shadow-cosmic",
          "hover:shadow-cosmic-glow hover:border-cosmic-light/50",
          "hover:from-cosmic-blue/90 hover:to-cosmic-light/90",
        ].join(" "),

        /* 골드 - 골드 그라데이션 */
        gold: [
          "bg-gradient-to-r from-cosmic-gold to-[#e6a76a]",
          "text-cosmic-dark",
          "border border-cosmic-gold/30",
          "shadow-cosmic-gold",
          "hover:shadow-[0_0_30px_rgba(242,191,145,0.5)]",
          "hover:from-cosmic-gold/90 hover:to-[#e6a76a]/90",
        ].join(" "),

        /* 위험/삭제 - 레드 */
        destructive: [
          "bg-gradient-to-r from-cosmic-red to-[#8f4a4a]",
          "text-cosmic-white",
          "border border-cosmic-red/30",
          "hover:shadow-[0_0_20px_rgba(115,60,60,0.5)]",
          "hover:from-cosmic-red/90 hover:to-[#8f4a4a]/90",
        ].join(" "),

        /* 아웃라인 - 테두리만 */
        outline: [
          "bg-transparent",
          "border-2 border-cosmic-blue/50",
          "text-cosmic-light",
          "hover:bg-cosmic-blue/10 hover:border-cosmic-light/60",
          "hover:shadow-cosmic",
        ].join(" "),

        /* 세컨더리 - 반투명 배경 */
        secondary: [
          "bg-cosmic-blue/20 backdrop-blur-sm",
          "text-cosmic-light",
          "border border-cosmic-blue/30",
          "hover:bg-cosmic-blue/30 hover:border-cosmic-light/40",
        ].join(" "),

        /* 고스트 - 배경 없음 */
        ghost: [
          "bg-transparent",
          "text-cosmic-light",
          "hover:bg-cosmic-blue/15 hover:text-cosmic-white",
        ].join(" "),

        /* 링크 스타일 */
        link: [
          "bg-transparent",
          "text-cosmic-light underline-offset-4",
          "hover:text-cosmic-gold hover:underline",
        ].join(" "),

        /* 글래스 - 글래스모피즘 */
        glass: [
          "bg-white/5 backdrop-blur-md",
          "text-cosmic-white",
          "border border-white/10",
          "hover:bg-white/10 hover:border-white/20",
          "hover:shadow-cosmic",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
        "icon-lg": "h-12 w-12 p-0 rounded-xl",
      },
      /* 글로우 효과 강도 */
      glow: {
        none: "",
        subtle: "hover:shadow-[0_0_15px_rgba(128,173,191,0.3)]",
        default: "hover:shadow-[0_0_25px_rgba(128,173,191,0.4)]",
        intense: "hover:shadow-[0_0_35px_rgba(128,173,191,0.6)]",
      },
      /* 전체 너비 */
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "default",
      fullWidth: false,
    },
  }
);

/* Button Props 타입 정의 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Radix Slot으로 렌더링 (컴포넌트 합성용) */
  asChild?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
}

/**
 * Button 컴포넌트
 * 
 * @example
 * // 기본 사용
 * <Button>클릭</Button>
 * 
 * // 골드 variant
 * <Button variant="gold">제출하기</Button>
 * 
 * // 아이콘 버튼
 * <Button size="icon" variant="ghost">
 *   <PlusIcon />
 * </Button>
 * 
 * // 로딩 상태
 * <Button loading>처리 중...</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, glow, fullWidth }),
          loading && "cursor-wait",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* 로딩 스피너 */}
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}

        {/* 왼쪽 아이콘 */}
        {!loading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}

        {/* 버튼 텍스트 */}
        {children}

        {/* 오른쪽 아이콘 */}
        {rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

