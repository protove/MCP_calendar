'use client';

import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { authApi, saveAuthData } from '@/lib/api';

// ============================================
// LoginForm 컴포넌트
// 이메일/비밀번호 로그인 폼
// ============================================

// 폼 데이터 타입 정의
interface LoginFormData {
  email: string;
  password: string;
}

// 폼 에러 타입 정의
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const router = useRouter();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = useCallback((field: keyof LoginFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // 입력 시 해당 필드 에러 제거
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  }, [errors]);

  // 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.login(formData.email, formData.password);
      const authData = response.data.data;

      if (authData) {
        saveAuthData(authData);
        router.push('/');
      } else {
        setErrors({ general: '로그인 응답이 올바르지 않습니다.' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message
        || error.response?.data?.error?.message
        || '로그인에 실패했습니다. 다시 시도해주세요.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 일반 에러 메시지 */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-cosmic-red/20 border border-cosmic-red/50 rounded-lg text-cosmic-red text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.general}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이메일 입력 필드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-cosmic-gray">
          이메일
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="your@email.com"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-3 bg-cosmic-dark/50 border rounded-lg
              text-cosmic-white placeholder-cosmic-gray/50
              focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.email 
                ? 'border-cosmic-red/50 focus:ring-cosmic-red/30' 
                : 'border-cosmic-blue/30 hover:border-cosmic-blue/50'
              }
            `}
          />
        </div>
        {/* 이메일 에러 메시지 */}
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cosmic-red text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 비밀번호 입력 필드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-cosmic-gray">
          비밀번호
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="••••••••"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-12 py-3 bg-cosmic-dark/50 border rounded-lg
              text-cosmic-white placeholder-cosmic-gray/50
              focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.password 
                ? 'border-cosmic-red/50 focus:ring-cosmic-red/30' 
                : 'border-cosmic-blue/30 hover:border-cosmic-blue/50'
              }
            `}
          />
          {/* 비밀번호 표시/숨김 토글 버튼 */}
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-gray hover:text-cosmic-light transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {/* 비밀번호 에러 메시지 */}
        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cosmic-red text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 비밀번호 찾기 링크 */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-cosmic-light hover:text-cosmic-gold transition-colors"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {/* 로그인 버튼 */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className={`
          relative w-full py-3 px-4 rounded-lg font-medium
          bg-gradient-to-r from-cosmic-blue to-cosmic-light
          text-cosmic-white shadow-lg shadow-cosmic-blue/30
          hover:shadow-xl hover:shadow-cosmic-blue/40
          focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50
          transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed
          overflow-hidden
        `}
      >
        {/* 버튼 호버 시 빛나는 효과 */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              {/* 로딩 스피너 */}
              <CosmicSpinner />
              <span>로그인 중...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>로그인</span>
            </>
          )}
        </span>
      </motion.button>

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-cosmic-blue/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-cosmic-dark text-cosmic-gray">또는</span>
        </div>
      </div>

      {/* 회원가입 링크 */}
      <p className="text-center text-cosmic-gray text-sm">
        아직 계정이 없으신가요?{' '}
        <Link
          href="/register"
          className="text-cosmic-gold hover:text-cosmic-light transition-colors font-medium"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}

// ============================================
// CosmicSpinner 컴포넌트
// 우주 테마 로딩 스피너
// ============================================
function CosmicSpinner() {
  return (
    <div className="relative w-5 h-5">
      {/* 외부 링 */}
      <div className="absolute inset-0 border-2 border-cosmic-white/20 rounded-full" />
      {/* 회전하는 링 */}
      <div className="absolute inset-0 border-2 border-transparent border-t-cosmic-gold rounded-full animate-spin" />
      {/* 중앙 점 */}
      <div className="absolute inset-1.5 bg-cosmic-gold/50 rounded-full animate-pulse" />
    </div>
  );
}
