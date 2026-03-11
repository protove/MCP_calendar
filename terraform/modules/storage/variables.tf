variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 (dev, staging, prod)"
  type        = string
}

variable "ecr_image_retention_count" {
  description = "ECR 이미지 보관 최대 개수"
  type        = number
  default     = 5
}

variable "s3_force_destroy" {
  description = "S3 버킷 강제 삭제 허용 (dev 환경용)"
  type        = bool
  default     = false
}
