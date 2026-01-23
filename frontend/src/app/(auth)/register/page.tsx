'use client';

import AuthCard from '@/components/auth/AuthCard';
import RegisterForm from '@/components/auth/RegisterForm';

// ============================================
// 회원가입 페이지
// 우주 테마의 회원가입 페이지 컴포넌트
// ============================================

export default function RegisterPage() {
  return (
    <AuthCard
      title="새로운 우주로의 여정"
      subtitle="MCP Calendar와 함께 시작하세요 🚀"
    >
      <RegisterForm />
    </AuthCard>
  );
}
