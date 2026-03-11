variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "github_owner" {
  description = "GitHub 저장소 소유자"
  type        = string
}

variable "github_repo" {
  description = "GitHub 저장소 이름"
  type        = string
}

variable "github_branch" {
  description = "배포 대상 브랜치"
  type        = string
  default     = "main"
}

variable "ecr_backend_url" {
  description = "Backend ECR Repository URL"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS Cluster 이름"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS Service 이름"
  type        = string
}

variable "cloudwatch_log_group" {
  description = "CodeBuild 로그 그룹"
  type        = string
  default     = ""
}
