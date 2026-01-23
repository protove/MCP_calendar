"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Loading 컴포넌트 시리즈 - 우주 테마 로딩 UI
 * 
 * 특징:
 * - 우주/별자리 테마에 맞는 다양한 로딩 애니메이션
 * - Framer Motion을 활용한 부드러운 애니메이션
 * - 스피너, 스켈레톤, 전체 페이지 로딩 지원
 */

/* ========================================
 * LoadingSpinner 컴포넌트 - 기본 스피너
 * ======================================== */

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-cosmic-blue/20",
  {
    variants: {
      size: {
        xs: "h-4 w-4 border-2",
        sm: "h-6 w-6 border-2",
        default: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        default: "border-t-cosmic-light",
        gold: "border-t-cosmic-gold",
        white: "border-t-cosmic-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** 로딩 텍스트 */
  text?: string;
}

/**
 * LoadingSpinner 컴포넌트 - 기본 로딩 스피너
 * 
 * @example
 * <LoadingSpinner size="lg" text="불러오는 중..." />
 */
const LoadingSpinner = React.memo<LoadingSpinnerProps>(
  ({ className, size, variant, text, ...props }) => {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-3", className)}
        role="status"
        aria-label="로딩 중"
        {...props}
      >
        <div className={spinnerVariants({ size, variant })} />
        {text && (
          <p className="text-sm text-cosmic-gray animate-pulse">{text}</p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

/* ========================================
 * CosmicSpinner 컴포넌트 - 우주 테마 스피너
 * ======================================== */

export interface CosmicSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * CosmicSpinner 컴포넌트 - 별자리/행성 모양 스피너
 * 궤도를 도는 행성 느낌의 애니메이션
 */
const CosmicSpinner = React.memo<CosmicSpinnerProps>(
  ({ size = "default", className }) => {
    const sizeClasses = {
      sm: { container: "w-8 h-8", orbit: "w-6 h-6", planet: "w-2 h-2" },
      default: { container: "w-12 h-12", orbit: "w-10 h-10", planet: "w-3 h-3" },
      lg: { container: "w-16 h-16", orbit: "w-14 h-14", planet: "w-4 h-4" },
    };

    const sizes = sizeClasses[size];

    return (
      <div
        className={cn("relative flex items-center justify-center", sizes.container, className)}
        role="status"
        aria-label="로딩 중"
      >
        {/* 중심 별 */}
        <motion.div
          className="absolute w-2 h-2 bg-cosmic-gold rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 첫 번째 궤도 */}
        <motion.div
          className={cn("absolute border border-cosmic-blue/30 rounded-full", sizes.orbit)}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className={cn(
              "absolute -top-1 left-1/2 -translate-x-1/2",
              "bg-cosmic-light rounded-full shadow-[0_0_8px_rgba(128,173,191,0.6)]",
              sizes.planet
            )}
          />
        </motion.div>
        
        {/* 두 번째 궤도 */}
        <motion.div
          className="absolute w-full h-full border border-cosmic-blue/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cosmic-gold rounded-full shadow-[0_0_8px_rgba(242,191,145,0.6)]" />
        </motion.div>
      </div>
    );
  }
);

CosmicSpinner.displayName = "CosmicSpinner";

/* ========================================
 * LoadingSkeleton 컴포넌트 - 스켈레톤 로딩
 * ======================================== */

const skeletonVariants = cva(
  [
    "bg-gradient-to-r from-cosmic-blue/10 via-cosmic-blue/20 to-cosmic-blue/10",
    "bg-[length:200%_100%]",
    "animate-[shimmer_1.5s_ease-in-out_infinite]",
    "rounded-md",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        text: "h-4",
        title: "h-6",
        avatar: "rounded-full",
        card: "h-32",
        button: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** 너비 (Tailwind 클래스 또는 인라인 스타일) */
  width?: string;
  /** 높이 (Tailwind 클래스 또는 인라인 스타일) */
  height?: string;
}

/**
 * LoadingSkeleton 컴포넌트 - 콘텐츠 로딩 플레이스홀더
 * 
 * @example
 * <LoadingSkeleton variant="text" width="w-3/4" />
 * <LoadingSkeleton variant="avatar" width="w-12" height="h-12" />
 */
const LoadingSkeleton = React.memo<LoadingSkeletonProps>(
  ({ className, variant, width, height, style, ...props }) => {
    return (
      <div
        className={cn(skeletonVariants({ variant }), width, height, className)}
        style={style}
        {...props}
      />
    );
  }
);

LoadingSkeleton.displayName = "LoadingSkeleton";

/* ========================================
 * SkeletonCard 컴포넌트 - 카드 스켈레톤
 * ======================================== */

export interface SkeletonCardProps {
  className?: string;
  /** 이미지 영역 포함 여부 */
  withImage?: boolean;
  /** 라인 수 */
  lines?: number;
}

/**
 * SkeletonCard 컴포넌트 - 카드 형태의 스켈레톤
 */
const SkeletonCard = React.memo<SkeletonCardProps>(
  ({ className, withImage = false, lines = 3 }) => {
    return (
      <div
        className={cn(
          "p-4 rounded-xl",
          "bg-cosmic-card-gradient border border-cosmic-blue/20",
          className
        )}
      >
        {withImage && (
          <LoadingSkeleton className="w-full h-40 mb-4 rounded-lg" />
        )}
        <LoadingSkeleton variant="title" className="w-2/3 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <LoadingSkeleton
              key={i}
              variant="text"
              className={cn(
                i === lines - 1 ? "w-1/2" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

/* ========================================
 * PageLoading 컴포넌트 - 전체 페이지 로딩
 * ======================================== */

export interface PageLoadingProps {
  /** 로딩 메시지 */
  message?: string;
  /** 표시 여부 */
  isLoading?: boolean;
  /** 오버레이 사용 여부 (기존 콘텐츠 위에 표시) */
  overlay?: boolean;
}

/**
 * PageLoading 컴포넌트 - 전체 페이지 로딩 화면
 * 
 * @example
 * <PageLoading isLoading={true} message="페이지를 불러오는 중..." />
 */
const PageLoading = React.memo<PageLoadingProps>(
  ({ message = "로딩 중...", isLoading = true, overlay = false }) => {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex flex-col items-center justify-center gap-6",
              overlay
                ? "fixed inset-0 z-50 bg-cosmic-dark/90 backdrop-blur-sm"
                : "min-h-[400px] w-full"
            )}
          >
            {/* 우주 배경 효과 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* 별들 */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cosmic-white/60 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* 로딩 스피너 */}
            <div className="relative z-10">
              <CosmicSpinner size="lg" />
            </div>

            {/* 로딩 메시지 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-cosmic-gray text-sm"
            >
              {message}
            </motion.p>

            {/* 프로그레스 바 (장식용) */}
            <motion.div
              className="relative z-10 w-48 h-1 bg-cosmic-blue/20 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-cosmic-blue to-cosmic-light rounded-full"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "50%" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

PageLoading.displayName = "PageLoading";

/* ========================================
 * InlineLoading 컴포넌트 - 인라인 로딩
 * ======================================== */

export interface InlineLoadingProps {
  text?: string;
  className?: string;
}

/**
 * InlineLoading 컴포넌트 - 텍스트와 함께 표시되는 작은 로딩
 */
const InlineLoading = React.memo<InlineLoadingProps>(
  ({ text = "로딩 중", className }) => {
    return (
      <span className={cn("inline-flex items-center gap-2 text-cosmic-gray", className)}>
        <LoadingSpinner size="xs" />
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.span>
      </span>
    );
  }
);

InlineLoading.displayName = "InlineLoading";

/* ========================================
 * LoadingDots 컴포넌트 - 점 로딩
 * ======================================== */

export interface LoadingDotsProps {
  className?: string;
  color?: "default" | "gold" | "white";
}

/**
 * LoadingDots 컴포넌트 - 점 3개가 순차적으로 움직이는 로딩
 */
const LoadingDots = React.memo<LoadingDotsProps>(
  ({ className, color = "default" }) => {
    const colorClasses = {
      default: "bg-cosmic-light",
      gold: "bg-cosmic-gold",
      white: "bg-cosmic-white",
    };

    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("w-2 h-2 rounded-full", colorClasses[color])}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";

/* shimmer 애니메이션을 위한 CSS (globals.css에 추가 필요) */
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }

export {
  LoadingSpinner,
  spinnerVariants,
  CosmicSpinner,
  LoadingSkeleton,
  skeletonVariants,
  SkeletonCard,
  PageLoading,
  InlineLoading,
  LoadingDots,
};
