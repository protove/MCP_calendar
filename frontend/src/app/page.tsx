import { DashboardView } from "@/components/dashboard";

/**
 * 메인 페이지 - 대시보드
 * 
 * MCP Calendar 애플리케이션의 메인 진입점
 * 대시보드 뷰를 렌더링하여 사용자에게 일정, 지출, 날씨 등의 요약 정보를 제공
 */
export default function Home() {
  return <DashboardView />;
}