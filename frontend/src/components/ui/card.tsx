"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card 컴포넌트 시리즈 - 우주 테마 카드 UI
 * 
 * 특징:
 * - 우주 테마에 맞는 반투명 그라데이션 배경
 * - 별빛을 연상시키는 미세한 테두리 효과
 * - 호버 시 glow 효과로 인터랙티브한 느낌
 * - 다양한 variant 지원 (default, elevated, outlined, glass)
 */

/* Card 스타일 variants 정의 */
const cardVariants = cva(
  // 기본 스타일
  [
    "rounded-xl",
    "transition-all duration-300 ease-out",
    "overflow-hidden",
  ].join(" "),
  {
    variants: {
      /* 카드 스타일 variants */
      variant: {
        // 기본 스타일 - 반투명 배경
        default: [
          "bg-cosmic-card-gradient",
          "border border-cosmic-blue/20",
          "shadow-cosmic",
        ].join(" "),
        
        // 부각된 스타일 - 더 진한 그림자
        elevated: [
          "bg-cosmic-card-gradient",
          "border border-cosmic-blue/30",
          "shadow-cosmic-lg",
          "hover:shadow-cosmic-glow hover:border-cosmic-light/40",
        ].join(" "),
        
        // 외곽선 스타일 - 배경 없이 테두리만
        outlined: [
          "bg-transparent",
          "border-2 border-cosmic-blue/40",
          "hover:border-cosmic-light/60",
        ].join(" "),
        
        // 글래스모피즘 스타일
        glass: [
          "bg-white/5 backdrop-blur-md",
          "border border-white/10",
          "shadow-cosmic",
        ].join(" "),
      },
      
      /* 패딩 variants */
      padding: {
        none: "",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      
      /* 호버 효과 여부 */
      hoverable: {
        true: "cursor-pointer hover:scale-[1.02] hover:shadow-cosmic-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hoverable: false,
    },
  }
);

/* Card 컴포넌트 Props 타입 정의 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card 컴포넌트 - 메인 카드 컨테이너
 * 
 * @example
 * // 기본 사용
 * <Card>
 *   <CardHeader>제목</CardHeader>
 *   <CardContent>내용</CardContent>
 * </Card>
 * 
 * // 호버 효과 적용
 * <Card variant="elevated" hoverable>
 *   ...
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hoverable }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

/* ========================================
 * CardHeader 컴포넌트 - 카드 헤더 영역
 * ======================================== */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 하단 구분선 표시 여부 */
  withBorder?: boolean;
}

/**
 * CardHeader 컴포넌트 - 카드 상단 헤더 영역
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 p-4",
          withBorder && "border-b border-cosmic-blue/20",
          className
        )}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

/* ========================================
 * CardTitle 컴포넌트 - 카드 제목
 * ======================================== */

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 제목 크기 */
  size?: "sm" | "default" | "lg";
}

/**
 * CardTitle 컴포넌트 - 카드 제목 텍스트
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "text-base font-medium",
      default: "text-lg font-semibold",
      lg: "text-xl font-bold",
    };

    return (
      <h3
        ref={ref}
        className={cn(
          "text-cosmic-white tracking-tight",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

/* ========================================
 * CardDescription 컴포넌트 - 카드 설명
 * ======================================== */

/**
 * CardDescription 컴포넌트 - 카드 부제목/설명 텍스트
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-cosmic-gray", className)}
      {...props}
    />
  );
});

CardDescription.displayName = "CardDescription";

/* ========================================
 * CardContent 컴포넌트 - 카드 본문 영역
 * ======================================== */

/**
 * CardContent 컴포넌트 - 카드 메인 컨텐츠 영역
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-4 pt-0 text-cosmic-white/90", className)}
      {...props}
    />
  );
});

CardContent.displayName = "CardContent";

/* ========================================
 * CardFooter 컴포넌트 - 카드 푸터 영역
 * ======================================== */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 상단 구분선 표시 여부 */
  withBorder?: boolean;
}

/**
 * CardFooter 컴포넌트 - 카드 하단 푸터 영역
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-4 pt-0",
          withBorder && "border-t border-cosmic-blue/20 pt-4",
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

/* ========================================
 * CardImage 컴포넌트 - 카드 이미지 영역
 * ======================================== */

export interface CardImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 이미지 위치 */
  position?: "top" | "bottom";
  /** 오버레이 표시 여부 */
  overlay?: boolean;
}

/**
 * CardImage 컴포넌트 - 카드 이미지 (선택적)
 */
const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, position = "top", overlay = false, alt = "", ...props }, ref) => {
    return (
      <div className={cn("relative overflow-hidden", position === "bottom" && "order-last")}>
        <img
          ref={ref}
          alt={alt}
          className={cn(
            "w-full h-48 object-cover",
            "transition-transform duration-300",
            "group-hover:scale-105",
            className
          )}
          {...props}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-dark/80 to-transparent" />
        )}
      </div>
    );
  }
);

CardImage.displayName = "CardImage";

/* ========================================
 * StatCard 컴포넌트 - 통계 표시용 특수 카드
 * ======================================== */

export interface StatCardProps {
  /** 통계 제목 */
  title: string;
  /** 통계 값 */
  value: string | number;
  /** 변화량 표시 (예: +12%, -5%) */
  change?: string;
  /** 변화 방향 */
  changeType?: "positive" | "negative" | "neutral";
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * StatCard 컴포넌트 - 통계 정보 표시용 카드
 */
const StatCard = React.memo<StatCardProps>(
  ({ title, value, change, changeType = "neutral", icon, className }) => {
    const changeColors = {
      positive: "text-green-400",
      negative: "text-cosmic-red",
      neutral: "text-cosmic-gray",
    };

    return (
      <Card variant="elevated" className={cn("group", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-cosmic-gray">{title}</p>
              <p className="text-2xl font-bold text-cosmic-white">{value}</p>
              {change && (
                <p className={cn("text-sm", changeColors[changeType])}>
                  {change}
                </p>
              )}
            </div>
            {icon && (
              <div className="p-2 rounded-lg bg-cosmic-blue/20 text-cosmic-light group-hover:bg-cosmic-blue/30 transition-colors">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export {
  Card,
  cardVariants,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  StatCard,
};
