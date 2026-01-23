"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input 컴포넌트 - 우주 테마 입력 필드
 * 
 * 특징:
 * - 우주 테마에 맞는 반투명 배경과 테두리
 * - 포커스 시 glow 효과로 별빛 느낌 연출
 * - 에러 상태 표시 (붉은 별 색상 활용)
 * - 다양한 크기 variant 지원
 */

/* Input 스타일 variants 정의 */
const inputVariants = cva(
  // 기본 스타일
  [
    "flex w-full rounded-lg",
    "bg-cosmic-dark/60 backdrop-blur-sm",
    "border border-cosmic-blue/30",
    "text-cosmic-white placeholder:text-cosmic-gray/60",
    "transition-all duration-300 ease-out",
    "focus:outline-none focus:ring-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // 포커스 시 glow 효과
    "focus:border-cosmic-light focus:shadow-[0_0_15px_rgba(128,173,191,0.4)]",
  ].join(" "),
  {
    variants: {
      /* 크기 variants */
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
      /* 상태 variants */
      state: {
        default: "",
        error: [
          "border-cosmic-red/60",
          "focus:border-cosmic-red focus:shadow-[0_0_15px_rgba(115,60,60,0.5)]",
        ].join(" "),
        success: [
          "border-cosmic-gold/60",
          "focus:border-cosmic-gold focus:shadow-[0_0_15px_rgba(242,191,145,0.4)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  }
);

/* Input 컴포넌트 Props 타입 정의 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** 에러 메시지 (표시 시 에러 상태로 변경) */
  error?: string;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
}

/**
 * Input 컴포넌트
 * 
 * @example
 * // 기본 사용
 * <Input placeholder="이메일을 입력하세요" />
 * 
 * // 에러 상태
 * <Input error="유효한 이메일을 입력하세요" />
 * 
 * // 아이콘 포함
 * <Input leftIcon={<MailIcon />} placeholder="이메일" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, state, error, leftIcon, rightIcon, ...props }, ref) => {
    // 에러가 있으면 자동으로 error state 적용
    const inputState = error ? "error" : state;

    return (
      <div className="relative w-full">
        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic-gray">
            {leftIcon}
          </div>
        )}

        {/* 입력 필드 */}
        <input
          type={type}
          className={cn(
            inputVariants({ size, state: inputState }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />

        {/* 오른쪽 아이콘 */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-gray">
            {rightIcon}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p className="mt-1.5 text-sm text-cosmic-red animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/* ========================================
 * Textarea 컴포넌트 - 여러 줄 입력용
 * ======================================== */

const textareaVariants = cva(
  [
    "flex w-full rounded-lg",
    "bg-cosmic-dark/60 backdrop-blur-sm",
    "border border-cosmic-blue/30",
    "text-cosmic-white placeholder:text-cosmic-gray/60",
    "transition-all duration-300 ease-out",
    "focus:outline-none focus:ring-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus:border-cosmic-light focus:shadow-[0_0_15px_rgba(128,173,191,0.4)]",
    "resize-none",
  ].join(" "),
  {
    variants: {
      state: {
        default: "",
        error: "border-cosmic-red/60 focus:border-cosmic-red focus:shadow-[0_0_15px_rgba(115,60,60,0.5)]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
}

/**
 * Textarea 컴포넌트 - 여러 줄 텍스트 입력
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, error, ...props }, ref) => {
    const textareaState = error ? "error" : state;

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            textareaVariants({ state: textareaState }),
            "min-h-[100px] px-4 py-3",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-cosmic-red animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/* ========================================
 * Label 컴포넌트 - 입력 필드 라벨
 * ======================================== */

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 필수 입력 표시 */
  required?: boolean;
}

/**
 * Label 컴포넌트 - 입력 필드용 라벨
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium text-cosmic-white/90 mb-1.5 block",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && (
          <span className="text-cosmic-gold ml-1">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

/* ========================================
 * FormField 컴포넌트 - Label + Input 조합
 * ======================================== */

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField 컴포넌트 - Label과 Input을 묶어주는 래퍼
 */
const FormField = React.memo<FormFieldProps>(
  ({ label, required, error, children, className }) => {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label required={required}>{label}</Label>
        {children}
        {error && (
          <p className="text-sm text-cosmic-red animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { Input, inputVariants, Textarea, textareaVariants, Label, FormField };
