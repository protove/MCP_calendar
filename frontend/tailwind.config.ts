import type { Config } from 'tailwindcss';

/**
 * MCP Calendar - Tailwind CSS 설정
 * 
 * 우주/별자리 테마 컬러 팔레트
 * - 깊은 우주의 신비로운 느낌을 표현
 * - 별빛과 은하수를 연상시키는 색상 조합
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* CSS 변수 기반 색상 */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        /* 우주/별자리 테마 커스텀 색상 팔레트 */
        'cosmic-dark': '#141A26',    // 깊은 우주 배경색 - 메인 배경, 카드 배경
        'cosmic-blue': '#42708C',    // 우주의 파란 빛 - 버튼, 강조 요소
        'cosmic-light': '#80ADBF',   // 밝은 하늘빛 - 호버 상태, 보조 강조
        'cosmic-gold': '#F2BF91',    // 별빛 / 따뜻한 액센트 - 포인트 색상, 알림
        'cosmic-red': '#733C3C',     // 붉은 별 / 경고색 - 에러, 삭제 버튼
        'cosmic-white': '#E8F1F5',   // 텍스트용 밝은 색 - 기본 텍스트
        'cosmic-gray': '#9BADB8',    // 보조 텍스트용 - 설명, 부가 정보
      },
      /* 우주 테마 그라데이션 */
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #141A26 0%, #1a2332 50%, #0d1117 100%)',
        'cosmic-card-gradient': 'linear-gradient(145deg, rgba(66, 112, 140, 0.15) 0%, rgba(20, 26, 38, 0.8) 100%)',
        'cosmic-button-gradient': 'linear-gradient(135deg, #42708C 0%, #80ADBF 100%)',
      },
      /* 애니메이션 */
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shooting-star': 'shootingStar 3s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(128, 173, 191, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(128, 173, 191, 0.6)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shootingStar: {
          '0%': { 
            transform: 'translateX(0) translateY(0) rotate(45deg)', 
            opacity: '1' 
          },
          '70%': { opacity: '1' },
          '100%': { 
            transform: 'translateX(300px) translateY(300px) rotate(45deg)', 
            opacity: '0' 
          },
        },
      },
      /* 그림자 효과 */
      boxShadow: {
        'cosmic': '0 4px 20px rgba(66, 112, 140, 0.3)',
        'cosmic-lg': '0 8px 40px rgba(66, 112, 140, 0.4)',
        'cosmic-glow': '0 0 30px rgba(128, 173, 191, 0.3)',
        'cosmic-gold': '0 4px 20px rgba(242, 191, 145, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;