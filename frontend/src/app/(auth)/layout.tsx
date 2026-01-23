'use client';

import { ReactNode, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

// ============================================
// Auth 레이아웃 컴포넌트
// 로그인/회원가입 페이지를 위한 우주 테마 레이아웃
// 사이드바 없이 중앙 정렬된 컨텐츠
// ============================================

interface AuthLayoutProps {
  children: ReactNode;
}

// 별 타입 정의
interface Star {
  id: number;
  size: number;
  left: string;
  top: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
}

// 유성 타입 정의
interface ShootingStar {
  id: number;
  left: string;
  top: string;
  animationDuration: string;
  animationDelay: string;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // 별 위치 상태 (클라이언트 사이드에서만 생성)
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  // 컴포넌트 마운트 시 별 생성
  useEffect(() => {
    // 배경 별 생성 (100개)
    const generatedStars: Star[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(generatedStars);

    // 유성 생성 (5개)
    const generatedShootingStars: ShootingStar[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      animationDuration: `${Math.random() * 2 + 1}s`,
      animationDelay: `${Math.random() * 10}s`,
    }));
    setShootingStars(generatedShootingStars);
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmic-dark overflow-hidden">
      {/* 배경 그라데이션 레이어 */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark via-[#1a2235] to-[#0d1117]" />
      
      {/* 우주 먼지/은하수 효과 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-blue/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cosmic-light/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cosmic-gold/5 rounded-full blur-[150px]" />
      </div>

      {/* 별 배경 레이어 */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-cosmic-white animate-twinkle"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              animationDuration: star.animationDuration,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* 유성 레이어 */}
      <div className="absolute inset-0 overflow-hidden">
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-cosmic-gold animate-shooting-star"
            style={{
              left: star.left,
              top: star.top,
              animationDuration: star.animationDuration,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* 그리드 패턴 오버레이 */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128, 173, 191, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128, 173, 191, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 상단 네비게이션 */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between p-6"
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-blue to-cosmic-light shadow-lg shadow-cosmic-blue/30"
          >
            <Sparkles className="w-5 h-5 text-cosmic-white" />
          </motion.div>
          <span className="text-xl font-bold text-cosmic-white group-hover:text-cosmic-gold transition-colors">
            MCP Calendar
          </span>
        </Link>

        {/* 우측 링크 (선택사항) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-cosmic-gray hover:text-cosmic-light transition-colors"
          >
            홈으로
          </Link>
        </div>
      </motion.nav>

      {/* 메인 컨텐츠 영역 */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 pb-10">
        {children}
      </main>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cosmic-blue/10 to-transparent pointer-events-none" />

      {/* CSS 애니메이션 정의 */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 1;
            width: 4px;
            height: 4px;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(45deg);
            opacity: 0;
            width: 100px;
            height: 2px;
          }
        }

        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        .animate-shooting-star {
          animation: shooting-star linear infinite;
          box-shadow: 
            0 0 10px 2px rgba(242, 191, 145, 0.3),
            0 0 20px 4px rgba(242, 191, 145, 0.2);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
