variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 (dev, staging, prod)"
  type        = string
}

variable "public_subnet_ids" {
  description = "퍼블릭 서브넷 ID 목록"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID (ALB 타겟그룹용)"
  type        = string
}

variable "web_sg_id" {
  description = "Web Security Group ID (ALB용)"
  type        = string
}

variable "backend_sg_id" {
  description = "Backend Security Group ID (Fargate 태스크용)"
  type        = string
}

variable "ecr_backend_url" {
  description = "Backend ECR Repository URL"
  type        = string
}

variable "backend_port" {
  description = "Backend 컨테이너 포트"
  type        = number
  default     = 8080
}

variable "backend_env_vars" {
  description = "Backend 컨테이너 환경변수 맵"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "cloudwatch_log_group" {
  description = "CloudWatch Log Group 이름"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "domain_name" {
  description = "도메인 이름 (ACM 인증서 발급용)"
  type        = string
}
