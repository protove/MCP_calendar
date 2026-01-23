"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * LoadingSpinner 컴포넌트 - 우주 테마 로딩 스피너
 * 
 * 특징:
 * - 별/궤도 애니메이션으로 우주 테마 표현
 * - 다양한 크기 지원 (sm, md, lg)
 * - 선택적 텍스트 표시
 */

/* 스피너 크기 variants */
const spinnerVariants = cva(
  "relative flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/* 궤도 크기 매핑 */
const orbitSizes = {
  sm: { outer: 24, middle: 18, inner: 12, dot: 4 },
  md: { outer: 40, middle: 30, inner: 20, dot: 6 },
  lg: { outer: 64, middle: 48, inner: 32, dot: 8 },
  xl: { outer: 96, middle: 72, inner: 48, dot: 10 },
};

/* LoadingSpinner Props 타입 */
export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** 로딩 텍스트 */
  text?: string;
  /** 스피너 타입 */
  variant?: "orbit" | "pulse" | "dots";
}

/**
 * 궤도형 스피너 - 행성 궤도 애니메이션
 */
const OrbitSpinner: React.FC<{ size: keyof typeof orbitSizes }> = ({ size }) => {
  const sizes = orbitSizes[size];
  
  return (
    <div className="relative" style={{ width: sizes.outer, height: sizes.outer }}>
      {/* 외부 궤도 */}
      <div 
        className="absolute inset-0 rounded-full border border-cosmic-blue/30 animate-cosmic-orbit"
        style={{ animationDuration: "3s" }}
      >
        <div 
          className="absolute rounded-full bg-cosmic-light shadow-[0_0_10px_rgba(128,173,191,0.6)]"
          style={{ 
            width: sizes.dot, 
            height: sizes.dot,
            top: -sizes.dot / 2,
            left: "50%",
            marginLeft: -sizes.dot / 2,
          }}
        />
      </div>
      
      {/* 중간 궤도 */}
      <div 
        className="absolute rounded-full border border-cosmic-gold/30 animate-cosmic-orbit"
        style={{ 
          width: sizes.middle, 
          height: sizes.middle,
          top: (sizes.outer - sizes.middle) / 2,
          left: (sizes.outer - sizes.middle) / 2,
          animationDuration: "2s",
          animationDirection: "reverse",
        }}
      >
        <div 
          className="absolute rounded-full bg-cosmic-gold shadow-[0_0_10px_rgba(242,191,145,0.6)]"
          style={{ 
            width: sizes.dot * 0.8, 
            height: sizes.dot * 0.8,
            top: -sizes.dot * 0.4,
            left: "50%",
            marginLeft: -sizes.dot * 0.4,
          }}
        />
      </div>
      
      {/* 중심 별 (펄스 효과) */}
      <div 
        className="absolute rounded-full bg-cosmic-white animate-cosmic-pulse"
        style={{ 
          width: sizes.inner / 2, 
          height: sizes.inner / 2,
          top: (sizes.outer - sizes.inner / 2) / 2,
          left: (sizes.outer - sizes.inner / 2) / 2,
          boxShadow: "0 0 15px rgba(232, 241, 245, 0.8)",
        }}
      />
    </div>
  );
};

/**
 * 펄스형 스피너 - 별빛 펄스 애니메이션
 */
const PulseSpinner: React.FC<{ size: keyof typeof orbitSizes }> = ({ size }) => {
  const sizes = orbitSizes[size];
  
  return (
    <div className="relative" style={{ width: sizes.outer, height: sizes.outer }}>
      {/* 외부 링 펄스 */}
      <div 
        className="absolute inset-0 rounded-full bg-cosmic-blue/20"
        style={{
          animation: "cosmic-ring-pulse 1.5s ease-out infinite",
        }}
      />
      
      {/* 중간 링 펄스 */}
      <div 
        className="absolute rounded-full bg-cosmic-light/30"
        style={{
          width: sizes.middle,
          height: sizes.middle,
          top: (sizes.outer - sizes.middle) / 2,
          left: (sizes.outer - sizes.middle) / 2,
          animation: "cosmic-ring-pulse 1.5s ease-out 0.3s infinite",
        }}
      />
      
      {/* 중심 별 */}
      <div 
        className="absolute rounded-full bg-gradient-to-br from-cosmic-gold to-cosmic-light animate-cosmic-pulse"
        style={{ 
          width: sizes.inner, 
          height: sizes.inner,
          top: (sizes.outer - sizes.inner) / 2,
          left: (sizes.outer - sizes.inner) / 2,
          boxShadow: "0 0 20px rgba(242, 191, 145, 0.6)",
        }}
      />
    </div>
  );
};

/**
 * 도트형 스피너 - 바운스 도트 애니메이션
 */
const DotsSpinner: React.FC<{ size: keyof typeof orbitSizes }> = ({ size }) => {
  const dotSize = orbitSizes[size].dot * 1.5;
  const gap = dotSize * 0.8;
  
  return (
    <div className="flex items-center justify-center" style={{ gap }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-full bg-cosmic-light animate-cosmic-bounce"
          style={{
            width: dotSize,
            height: dotSize,
            animationDelay: `${index * 0.16}s`,
            boxShadow: "0 0 8px rgba(128, 173, 191, 0.5)",
          }}
        />
      ))}
    </div>
  );
};

/**
 * LoadingSpinner 메인 컴포넌트
 * 
 * @example
 * // 기본 사용
 * <LoadingSpinner />
 * 
 * // 크기 및 텍스트 지정
 * <LoadingSpinner size="lg" text="로딩 중..." />
 * 
 * // 다른 타입의 스피너
 * <LoadingSpinner variant="pulse" />
 * <LoadingSpinner variant="dots" />
 */
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", text, variant = "orbit", ...props }, ref) => {
    const spinnerSize = (size || "md") as keyof typeof orbitSizes;
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
        role="status"
        aria-label={text || "로딩 중"}
        {...props}
      >
        <div className={cn(spinnerVariants({ size }))}>
          {variant === "orbit" && <OrbitSpinner size={spinnerSize} />}
          {variant === "pulse" && <PulseSpinner size={spinnerSize} />}
          {variant === "dots" && <DotsSpinner size={spinnerSize} />}
        </div>
        
        {text && (
          <span className="text-cosmic-gray text-sm animate-cosmic-pulse">
            {text}
          </span>
        )}
        
        {/* 스크린 리더를 위한 숨김 텍스트 */}
        <span className="sr-only">{text || "로딩 중"}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
