variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 (dev, staging, prod)"
  type        = string
}

variable "private_subnet_ids" {
  description = "프라이빗 서브넷 ID 목록 (RDS 서브넷 그룹용)"
  type        = list(string)
}

variable "database_sg_id" {
  description = "Database Security Group ID"
  type        = string
}

variable "redis_sg_id" {
  description = "Redis Security Group ID"
  type        = string
}

variable "db_name" {
  description = "데이터베이스 이름"
  type        = string
  default     = "mcp_calendar"
}

variable "db_username" {
  description = "데이터베이스 마스터 사용자명"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "데이터베이스 마스터 비밀번호"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS 인스턴스 클래스"
  type        = string
  default     = "db.t3.micro" # Free Tier 대상
}

variable "db_allocated_storage" {
  description = "RDS 할당 스토리지 (GB)"
  type        = number
  default     = 20 # Free Tier: 최대 20 GiB
}

variable "db_engine_version" {
  description = "PostgreSQL 엔진 버전"
  type        = string
  default     = "16.6"
}
