"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * 페이지 전환 애니메이션 Variants
 * 부드러운 페이드 + 슬라이드 효과
 */
const pageVariants = {
  // 초기 상태 (진입 전)
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  // 진입 후 상태
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // 커스텀 이징 (부드러운 감속)
      staggerChildren: 0.1,
    },
  },
  // 퇴장 상태
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * 대안적인 슬라이드 Variants
 * 왼쪽에서 오른쪽으로 슬라이드
 */
const slideVariants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * 페이지 전환 애니메이션 래퍼 컴포넌트
 * 
 * Framer Motion을 사용하여 페이지 간 부드러운 전환 효과 제공
 * - 페이드 인/아웃
 * - 슬라이드 업/다운
 * - 스케일 효과
 * 
 * @example
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 페이드 전환 전용 컴포넌트
 * 더 단순한 페이드 인/아웃 효과
 */
export function FadeTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 슬라이드 전환 전용 컴포넌트
 * 수평 슬라이드 효과
 */
export function SlideTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 컨텐츠 요소용 애니메이션 래퍼
 * 페이지 내 개별 요소에 staggered 애니메이션 적용
 */
interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedItem({ children, delay = 0, className = "" }: AnimatedItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 스태거 컨테이너 컴포넌트
 * 자식 요소들에 순차적인 애니메이션 적용
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 스태거 아이템 컴포넌트
 * StaggerContainer 내부에서 사용
 */
export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
