import { CalendarView } from "@/components/calendar";

/**
 * 캘린더 페이지
 * 
 * 우주/별자리 테마가 적용된 메인 캘린더 뷰
 * - FullCalendar 기반 월간/주간/일간 뷰
 * - 이벤트 생성, 수정, 삭제 기능
 * - 드래그 앤 드롭 지원
 */
export default function CalendarPage() {
    return <CalendarView />;
}
