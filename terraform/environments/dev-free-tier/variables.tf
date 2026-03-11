################################################################################
# 공통 변수
################################################################################
variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
  default     = "mcp-calendar"
}

variable "environment" {
  description = "환경 식별자"
  type        = string
  default     = "dev"
}

################################################################################
# Networking 변수
################################################################################
variable "vpc_cidr" {
  description = "VPC CIDR 블록"
  type        = string
  default     = "10.0.0.0/16"
}

variable "allowed_ssh_cidrs" {
  description = "SSH 접근 허용 CIDR 목록 (빈 배열이면 SG 미생성)"
  type        = list(string)
  default     = []
}

################################################################################
# Database 변수
################################################################################
variable "db_name" {
  description = "PostgreSQL 데이터베이스 이름"
  type        = string
  default     = "mcp_calendar"
}

variable "db_username" {
  description = "PostgreSQL 마스터 사용자명"
  type        = string
  sensitive   = true
}

variable "db_password_secret_arn" {
  description = "PostgreSQL 비밀번호가 저장된 Secrets Manager ARN"
  type        = string
}

################################################################################
# App 시크릿 (Secrets Manager ARN)
################################################################################
variable "jwt_secret_arn" {
  description = "JWT 시크릿이 저장된 Secrets Manager ARN"
  type        = string
}

variable "gemini_api_key_secret_arn" {
  description = "Gemini API Key가 저장된 Secrets Manager ARN"
  type        = string
}

variable "weather_api_key_secret_arn" {
  description = "OpenWeatherMap API Key가 저장된 Secrets Manager ARN"
  type        = string
  default     = ""
}

################################################################################
# Monitoring 변수
################################################################################
variable "alarm_email" {
  description = "알람 수신 이메일"
  type        = string
}

variable "monthly_budget_usd" {
  description = "월 예산 한도 (USD)"
  type        = string
  default     = "5.0"
}

variable "domain_name" {
  description = "도메인 이름 (Cloudflare에서 관리)"
  type        = string
}
