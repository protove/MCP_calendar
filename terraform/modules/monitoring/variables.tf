variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 (dev, staging, prod)"
  type        = string
}

variable "ec2_instance_id" {
  description = "모니터링 대상 EC2 인스턴스 ID"
  type        = string
}

variable "rds_instance_id" {
  description = "모니터링 대상 RDS 인스턴스 ID"
  type        = string
  default     = ""
}

variable "log_group_name" {
  description = "CloudWatch Log Group 이름 (외부에서 전달)"
  type        = string
}

variable "alarm_email" {
  description = "알람 수신 이메일"
  type        = string
}

variable "monthly_budget_usd" {
  description = "월 예산 한도 (USD)"
  type        = string
  default     = "5.0"
}

variable "budget_alert_thresholds" {
  description = "예산 알림 기준치 (%, 복수 가능)"
  type        = list(number)
  default     = [50, 80, 100]
}
