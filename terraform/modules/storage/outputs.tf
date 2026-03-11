output "ecr_backend_url" {
  description = "Backend ECR Repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "Frontend ECR Repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_arn" {
  description = "Backend ECR Repository ARN"
  value       = aws_ecr_repository.backend.arn
}

output "ecr_frontend_arn" {
  description = "Frontend ECR Repository ARN"
  value       = aws_ecr_repository.frontend.arn
}

output "s3_assets_bucket" {
  description = "S3 Assets 버킷 이름"
  value       = aws_s3_bucket.assets.id
}

output "s3_assets_bucket_arn" {
  description = "S3 Assets 버킷 ARN"
  value       = aws_s3_bucket.assets.arn
}
