'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// ============================================
// AuthCard 컴포넌트
// 로그인/회원가입 폼을 감싸는 우주 테마 카드
// ============================================

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <motion.div
      // 카드 진입 애니메이션 설정
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-md"
    >
      {/* 카드 외부 글로우 효과 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cosmic-blue via-cosmic-light to-cosmic-gold rounded-2xl blur-lg opacity-30 animate-pulse" />
      
      {/* 메인 카드 컨테이너 */}
      <div className="relative bg-cosmic-dark/80 backdrop-blur-xl border border-cosmic-blue/30 rounded-2xl p-8 shadow-2xl">
        {/* 카드 상단 장식 라인 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-cosmic-gold to-transparent rounded-full" />
        
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          {/* 로고/아이콘 영역 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-cosmic-blue to-cosmic-light shadow-lg shadow-cosmic-blue/30"
          >
            {/* 별 모양 SVG 아이콘 */}
            <svg
              className="w-8 h-8 text-cosmic-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </motion.div>
          
          {/* 타이틀 */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-cosmic-white mb-2"
          >
            {title}
          </motion.h1>
          
          {/* 서브타이틀 */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-cosmic-gray text-sm"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* 폼 컨텐츠 영역 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
