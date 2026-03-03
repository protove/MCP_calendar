'use client';

import { useState, useCallback, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  AlertCircle, 
  User,
  Check,
  X
} from 'lucide-react';
import { authApi } from '@/lib/api';

// ============================================
// RegisterForm 컴포넌트
// 회원가입 폼 (이름, 이메일, 비밀번호, 비밀번호 확인)
// ============================================

// 폼 데이터 타입 정의
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 폼 에러 타입 정의
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// 비밀번호 강도 체크 타입
interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function RegisterForm() {
  const router = useRouter();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 비밀번호 강도 계산 (메모이제이션으로 최적화)
  const passwordStrength = useMemo((): PasswordStrength => {
    const password = formData.password;
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 1) return { score, label: '약함', color: 'bg-cosmic-red' };
    if (score <= 2) return { score, label: '보통', color: 'bg-cosmic-gold' };
    if (score <= 3) return { score, label: '강함', color: 'bg-cosmic-light' };
    return { score, label: '매우 강함', color: 'bg-green-500' };
  }, [formData.password]);

  // 비밀번호 요구사항 체크
  const passwordRequirements = useMemo(() => [
    { label: '6자 이상', met: formData.password.length >= 6 },
    { label: '대문자 포함', met: /[A-Z]/.test(formData.password) },
    { label: '소문자 포함', met: /[a-z]/.test(formData.password) },
    { label: '숫자 포함', met: /\d/.test(formData.password) },
  ], [formData.password]);

  // 입력값 변경 핸들러
  const handleChange = useCallback((field: keyof RegisterFormData) => {
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

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    }

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

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
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
      await authApi.register(formData.name.trim(), formData.email, formData.password);
      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login?registered=true');
    } catch (error: any) {
      const message = error.response?.data?.message
        || error.response?.data?.error?.message
        || '회원가입에 실패했습니다. 다시 시도해주세요.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* 이름 입력 필드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-cosmic-gray">
          이름
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="홍길동"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-3 bg-cosmic-dark/50 border rounded-lg
              text-cosmic-white placeholder-cosmic-gray/50
              focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.name 
                ? 'border-cosmic-red/50 focus:ring-cosmic-red/30' 
                : 'border-cosmic-blue/30 hover:border-cosmic-blue/50'
              }
            `}
          />
        </div>
        <AnimatePresence>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cosmic-red text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

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
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-gray hover:text-cosmic-light transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* 비밀번호 강도 표시 */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            {/* 강도 바 */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength.score
                      ? passwordStrength.color
                      : 'bg-cosmic-gray/20'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
              비밀번호 강도: {passwordStrength.label}
            </p>

            {/* 비밀번호 요구사항 체크리스트 */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 ${
                    req.met ? 'text-cosmic-light' : 'text-cosmic-gray/50'
                  }`}
                >
                  {req.met ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

      {/* 비밀번호 확인 입력 필드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-cosmic-gray">
          비밀번호 확인
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmic-gray" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="••••••••"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-12 py-3 bg-cosmic-dark/50 border rounded-lg
              text-cosmic-white placeholder-cosmic-gray/50
              focus:outline-none focus:ring-2 focus:ring-cosmic-blue/50
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.confirmPassword 
                ? 'border-cosmic-red/50 focus:ring-cosmic-red/30' 
                : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-500/50'
                  : 'border-cosmic-blue/30 hover:border-cosmic-blue/50'
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-gray hover:text-cosmic-light transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* 비밀번호 일치 여부 표시 */}
        {formData.confirmPassword && !errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs flex items-center gap-1 ${
              formData.password === formData.confirmPassword
                ? 'text-green-500'
                : 'text-cosmic-gold'
            }`}
          >
            {formData.password === formData.confirmPassword ? (
              <>
                <Check className="w-3 h-3" />
                비밀번호가 일치합니다
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                비밀번호가 일치하지 않습니다
              </>
            )}
          </motion.p>
        )}

        <AnimatePresence>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cosmic-red text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 회원가입 버튼 */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className={`
          relative w-full py-3 px-4 rounded-lg font-medium
          bg-gradient-to-r from-cosmic-gold to-cosmic-light
          text-cosmic-dark shadow-lg shadow-cosmic-gold/30
          hover:shadow-xl hover:shadow-cosmic-gold/40
          focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50
          transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed
          overflow-hidden
        `}
      >
        {/* 버튼 호버 시 빛나는 효과 */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <CosmicSpinner />
              <span>가입 처리 중...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>회원가입</span>
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

      {/* 로그인 링크 */}
      <p className="text-center text-cosmic-gray text-sm">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="text-cosmic-gold hover:text-cosmic-light transition-colors font-medium"
        >
          로그인
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
      <div className="absolute inset-0 border-2 border-cosmic-dark/20 rounded-full" />
      <div className="absolute inset-0 border-2 border-transparent border-t-cosmic-dark rounded-full animate-spin" />
      <div className="absolute inset-1.5 bg-cosmic-dark/50 rounded-full animate-pulse" />
    </div>
  );
}
