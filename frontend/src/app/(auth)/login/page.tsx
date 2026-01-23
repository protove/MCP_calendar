'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';

// ============================================
// 로그인 페이지
// 우주 테마의 로그인 페이지 컴포넌트
// ============================================

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // 회원가입 후 리다이렉트된 경우 성공 메시지 표시
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true);
      // 5초 후 메시지 숨김
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 회원가입 성공 메시지 */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span>회원가입이 완료되었습니다. 로그인해주세요!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로그인 카드 */}
      <AuthCard
        title="다시 오신 것을 환영합니다"
        subtitle="우주의 일정을 관리해보세요 ✨"
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
