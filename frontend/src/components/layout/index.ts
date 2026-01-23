/**
 * Layout 컴포넌트 모음
 * 
 * 우주/별자리 테마가 적용된 레이아웃 컴포넌트들을 export합니다.
 */

// 메인 레이아웃 (사이드바 + 헤더 + 컨텐츠 영역)
export { MainLayout } from "./MainLayout";

// 사이드바 네비게이션
export { Sidebar } from "./Sidebar";

// 모바일 헤더
export { Header } from "./Header";

// 페이지 전환 애니메이션
export {
  PageTransition,
  FadeTransition,
  SlideTransition,
  AnimatedItem,
  StaggerContainer,
  StaggerItem,
} from "./PageTransition";
