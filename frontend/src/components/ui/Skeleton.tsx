"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Skeleton 컴포넌트 - 우주 테마 로딩 스켈레톤
 * 
 * 특징:
 * - 우주 테마 색상의 쉬머 효과
 * - 다양한 형태 지원 (text, card, circle, avatar)
 * - 커스텀 크기 지정 가능
 */

/* Skeleton 기본 variants */
const skeletonVariants = cva(
  [
    "relative overflow-hidden",
    "bg-cosmic-blue/10",
    "before:absolute before:inset-0",
    "before:bg-gradient-to-r",
    "before:from-transparent before:via-cosmic-light/10 before:to-transparent",
    "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
  ].join(" "),
  {
    variants: {
      /* 형태 variants */
      variant: {
        text: "rounded h-4 w-full",
        heading: "rounded h-8 w-3/4",
        card: "rounded-xl h-40 w-full",
        circle: "rounded-full aspect-square",
        avatar: "rounded-full w-10 h-10",
        image: "rounded-lg aspect-video w-full",
        button: "rounded-lg h-10 w-24",
      },
      /* 애니메이션 속도 */
      animation: {
        default: "",
        slow: "before:animate-[shimmer_2.5s_ease-in-out_infinite]",
        fast: "before:animate-[shimmer_1s_ease-in-out_infinite]",
      },
    },
    defaultVariants: {
      variant: "text",
      animation: "default",
    },
  }
);

/* Skeleton Props 타입 */
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** 너비 (px 또는 CSS 단위) */
  width?: string | number;
  /** 높이 (px 또는 CSS 단위) */
  height?: string | number;
}

/**
 * Skeleton 기본 컴포넌트
 * 
 * @example
 * // 텍스트 스켈레톤
 * <Skeleton variant="text" />
 * 
 * // 카드 스켈레톤
 * <Skeleton variant="card" />
 * 
 * // 커스텀 크기
 * <Skeleton width={200} height={100} />
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, width, height, style, ...props }, ref) => {
    const customStyle: React.CSSProperties = {
      ...style,
      ...(width && { width: typeof width === "number" ? `${width}px` : width }),
      ...(height && { height: typeof height === "number" ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={customStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

/* ======================================
 * SkeletonText - 여러 줄 텍스트 스켈레톤
 * ====================================== */

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 줄 수 */
  lines?: number;
  /** 마지막 줄 너비 비율 (0-1) */
  lastLineWidth?: number;
  /** 줄 간격 */
  gap?: number;
}

/**
 * SkeletonText - 여러 줄 텍스트용 스켈레톤
 * 
 * @example
 * <SkeletonText lines={3} />
 */
const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, lastLineWidth = 0.6, gap = 2, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col", className)}
        style={{ gap: `${gap * 4}px` }}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            style={{
              width: index === lines - 1 ? `${lastLineWidth * 100}%` : "100%",
            }}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = "SkeletonText";

/* ======================================
 * SkeletonCard - 카드 형태 스켈레톤
 * ====================================== */

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 이미지 포함 여부 */
  hasImage?: boolean;
  /** 아바타 포함 여부 */
  hasAvatar?: boolean;
  /** 텍스트 줄 수 */
  textLines?: number;
}

/**
 * SkeletonCard - 카드 레이아웃 스켈레톤
 * 
 * @example
 * <SkeletonCard hasImage hasAvatar textLines={2} />
 */
const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, hasImage = false, hasAvatar = false, textLines = 2, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-cosmic-blue/20 bg-cosmic-dark/40 p-4 space-y-4",
          className
        )}
        {...props}
      >
        {/* 이미지 영역 */}
        {hasImage && (
          <Skeleton variant="image" className="mb-4" />
        )}
        
        {/* 헤더 (아바타 + 제목) */}
        <div className="flex items-center gap-3">
          {hasAvatar && <Skeleton variant="avatar" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="heading" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        
        {/* 본문 텍스트 */}
        {textLines > 0 && (
          <SkeletonText lines={textLines} />
        )}
        
        {/* 하단 버튼 영역 */}
        <div className="flex gap-2 pt-2">
          <Skeleton variant="button" />
          <Skeleton variant="button" width="80px" />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

/* ======================================
 * SkeletonList - 리스트 형태 스켈레톤
 * ====================================== */

export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이템 수 */
  items?: number;
  /** 아바타 표시 여부 */
  showAvatar?: boolean;
}

/**
 * SkeletonList - 리스트 아이템 스켈레톤
 * 
 * @example
 * <SkeletonList items={5} showAvatar />
 */
const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ className, items = 3, showAvatar = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-3", className)}
        {...props}
      >
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg border border-cosmic-blue/10 bg-cosmic-dark/20"
          >
            {showAvatar && <Skeleton variant="avatar" />}
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = "SkeletonList";

/* ======================================
 * SkeletonTable - 테이블 형태 스켈레톤
 * ====================================== */

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 행 수 */
  rows?: number;
  /** 열 수 */
  columns?: number;
}

/**
 * SkeletonTable - 테이블 레이아웃 스켈레톤
 * 
 * @example
 * <SkeletonTable rows={5} columns={4} />
 */
const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ className, rows = 5, columns = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-cosmic-blue/20 overflow-hidden",
          className
        )}
        {...props}
      >
        {/* 테이블 헤더 */}
        <div 
          className="grid gap-4 p-4 bg-cosmic-blue/10 border-b border-cosmic-blue/20"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" height={16} />
          ))}
        </div>
        
        {/* 테이블 바디 */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4 border-b border-cosmic-blue/10 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={colIndex === 0 ? "80%" : "60%"}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTable.displayName = "SkeletonTable";

export { Skeleton, SkeletonText, SkeletonCard, SkeletonList, SkeletonTable };
